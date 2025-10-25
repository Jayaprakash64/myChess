import { useEffect, useRef } from "react";
import type {
  MovePayload,
  ServerMessage,
  WSJoinRoom,
  WSMove,
} from "../Types/gameTypes";

export function useGameSocket(
  roomId: string,
  playerId: string,
  onMessage: (msg: ServerMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/rooms/${roomId}/ws`);
    socketRef.current = ws;

    ws.onopen = () => {
      const joinMsg: WSJoinRoom = {
        type: "join_room",
        roomId,
        playerId,
      };
      ws.send(JSON.stringify(joinMsg));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerMessage;
      onMessage(data);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, [roomId, playerId, onMessage]);

  const sendMove = (move: MovePayload) => {
    const moveMsg: WSMove = {
      type: "move",
      roomId,
      playerId,
      move,
    };
    socketRef.current?.send(JSON.stringify(moveMsg));
  };

  return { sendMove };
}
