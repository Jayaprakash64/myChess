# move_handler.py
import chess
from app.sockets.message_types import WSMessageType

async def handle_move(
    websocket,
    room_id: str,
    message: dict,
    manager,
    redis_client,
):
    try:
        move_data = message.get("move")
        from_square = move_data.get("from")
        to_square = move_data.get("to")

        # Loading current game state
        state_key = f"game:{room_id}:state"
        fen = await redis_client.get(state_key)
        board = chess.Board(fen)

        # Validating move and turn
        move = board.parse_uci(f"{from_square}{to_square}")
        if move not in board.legal_moves:
            await websocket.send_json({
                "type": WSMessageType.ERROR,
                "message": "Invalid move!",
            })
            return

        # Checking if it's the player's turn
        current_connections = manager.active_connections.get(room_id, [])
        player_number = current_connections.index(websocket) + 1
        player_color = "white" if player_number == 1 else "black"
        if (player_color == "white" and board.turn != chess.WHITE) or (player_color == "black" and board.turn != chess.BLACK):
            await websocket.send_json({
                "type": WSMessageType.ERROR,
                "message": "Not your turn!",
            })
            return

        # Apply the move
        board.push(move)
        await redis_client.set(state_key, board.fen())

        # Broadcasting updated state
        await manager.broadcast(room_id, {
            "type": WSMessageType.GAME_STATE,
            "fen": board.fen(),
            "turn": "white" if board.turn == chess.WHITE else "black",
            "message": f"Move made: {from_square} to {to_square}.",
        })

        # Check for game over
        if board.is_game_over():
            reason = "checkmate" if board.is_checkmate() else "stalemate"
            await manager.broadcast(room_id, {
                "type": WSMessageType.GAME_OVER,
                "reason": reason,
                "message": f"Game over: {reason}!",
            })

    except Exception as e:
        await websocket.send_json({
            "type": WSMessageType.ERROR,
            "message": f"Error processing move: {str(e)}",
        })
