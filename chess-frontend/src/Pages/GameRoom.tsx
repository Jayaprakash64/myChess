import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import ChessBoard from "../Components/ChessBoard";
import { useGameSocket } from "../Hooks/useGameSocket";
import type { GameState, ServerMessage } from "../Types/gameTypes";

export default function GameRoom() {
  const { roomId } = useParams();
  const [playerId] = useState(
    () => `player_${Math.random().toString(16).slice(2)}`
  );
  const [gameState, setGameState] = useState<GameState>({
    fen: "",
    turn: "white",
    isGameOver: false,
  });

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "game_state":
        setGameState((prev) => ({
          fen: msg.fen,
          turn: msg.turn,
          playerColor: msg.playerColor ?? prev.playerColor,
          isGameOver: msg.isGameOver ?? false,
          gameOverReason: msg.gameOverReason,
        }));
        break;
      case "game_over":
        setGameState((prev) => ({
          ...prev,
          isGameOver: true,
          gameOverReason: msg.reason,
        }));
        break;
      case "error":
        alert(msg.message);
        break;
      default:
        console.log("Unhandled message:", msg);
    }
  }, []);

  const { sendMove } = useGameSocket(roomId!, playerId, handleServerMessage);

  if (!gameState.fen) {
    return <div className="text-center p-4">Loading game...</div>;
  }

  return (
    <div
      className="flex flex-col items-center justify-center p-4 h-screen overflow-hidden"
      style={{ backgroundColor: "#161512" }}
    >
      <p className="mb-2 text-gray-300">
        You are: {gameState.playerColor || "..."}
      </p>
      <p className="mb-4 text-gray-300">
        Turn: {gameState.turn}{" "}
        {gameState.turn === gameState.playerColor && (
          <span className="text-green-500">(Your turn)</span>
        )}
      </p>
      <ChessBoard gameState={gameState} sendMove={sendMove} />
      {gameState.isGameOver && (
        <div
          className="mt-4 p-2 rounded text-white"
          style={{ backgroundColor: "#c33" }}
        >
          Game Over — {gameState.gameOverReason}
        </div>
      )}
    </div>
  );
}
