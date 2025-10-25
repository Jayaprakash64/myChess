import { useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import type { GameState, MovePayload } from "../Types/gameTypes";

interface ChessBoardProps {
  gameState: GameState;
  sendMove: (move: MovePayload) => void;
}

export default function ChessBoard({ gameState, sendMove }: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const cgRef = useRef<any>(null);
  const chess = useRef(new Chess());

  useEffect(() => {
    if (!boardRef.current) return;

    cgRef.current = Chessground(boardRef.current, {
      orientation: gameState.playerColor || "white",
      highlight: { lastMove: true, check: true },
      movable: { free: false, color: undefined, dests: new Map() },
    });

    return () => {
      cgRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!cgRef.current) return;

    chess.current.load(gameState.fen);

    const canMove =
      gameState.turn === gameState.playerColor && !gameState.isGameOver;

    const dests = new Map();
    if (canMove) {
      const moves = chess.current.moves({ verbose: true });
      moves.forEach((m) => {
        if (!dests.has(m.from)) dests.set(m.from, []);
        dests.get(m.from).push(m.to);
      });
    }

    cgRef.current.set({
      fen: gameState.fen,
      turnColor: gameState.turn,
      movable: {
        color: canMove ? gameState.playerColor : undefined,
        dests,
        events: {
          after: (from: string, to: string) => {
            sendMove({ from, to });
          },
        },
      },
    });
  }, [gameState, sendMove]);

  return (
    <div
      ref={boardRef}
      style={{ width: "512px", height: "512px" }}
      className="shadow-lg"
    />
  );
}
