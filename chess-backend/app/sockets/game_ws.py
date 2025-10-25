import json
from typing import Dict, List
from fastapi import WebSocket
from app.services.redis_service import redis_client
from app.sockets.message_types import WSMessageType
from app.sockets.move_handler import handle_move
import chess

# ConnectionManager to handle multiple game rooms
class ConnectionManager:
    MAX_PLAYERS = 2  # Max players per game

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        # Enforce player limit
        current_connections = self.active_connections.get(room_id, [])
        if len(current_connections) >= self.MAX_PLAYERS:
            await websocket.accept()
            await websocket.send_json({
                "type": "error",
                "message": "Room full! Only 2 players allowed."
            })
            await websocket.close()
            return False  # Reject connection

        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        return True  # Connection accepted

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: dict):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_json(message)

# Global connection manager
manager = ConnectionManager()

# WebSocket handler
async def game_ws(websocket: WebSocket, room_id: str):
    accepted = await manager.connect(websocket, room_id)
    if not accepted:
        return # Connection rejected (room full) -> exit early

    try: # Load or initialize game state in Redis
        state_key = f"game:{room_id}:state"
        fen = await redis_client.get(state_key)
        if not fen: # Start new game
            board = chess.Board()
            fen = board.fen()
            await redis_client.set(state_key, fen)
        else: # Load existing game state
            board = chess.Board(fen)
        
        # Color  assignment
        current_connections = manager.active_connections.get(room_id, [])
        player_number = len(current_connections)
        player_id = f"player{player_number}"
        player_color = "white" if player_number == 1 else "black"

        # Sending current state and player color to the joining player
        await websocket.send_json({
            "type": WSMessageType.GAME_STATE,
            "fen": fen,
            "turn": "white" if board.turn == chess.WHITE else "black",
            "playerColor": player_color,
            "message": f"Welcome! You are {player_color}. Game state loaded."
        })

        # Broadcasting player join event
        await manager.broadcast(room_id, {
            "type": WSMessageType.PLAYER_JOINED,
            "playerId": player_id,
            "playerColor": player_color,
            "message": f"{player_id} joined as {player_color}."
        })

        # Listening for moves 
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == WSMessageType.MOVE:
                await handle_move(websocket, room_id, message, manager, redis_client)

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket, room_id)
        print(f"Disconnected from game {room_id}")
