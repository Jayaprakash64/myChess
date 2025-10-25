export type PlayerColor = "white" | "black";

export interface MovePayload {
  from: string;
  to: string;
}

export interface WSJoinRoom {
  type: "join_room";
  roomId: string;
  playerId: string;
}

export interface WSMove {
  type: "move";
  roomId: string;
  playerId: string;
  move: MovePayload;
}

export interface WSGameState {
  type: "game_state";
  fen: string;
  turn: PlayerColor;
  playerColor?: PlayerColor;
  message?: string;
  isGameOver?: boolean;
  gameOverReason?: string;
}

export interface WSPlayerJoined {
  type: "player_joined";
  playerId: string;
  playerColor: PlayerColor;
  message: string;
}

export interface WSError {
  type: "error";
  message: string;
}

export interface WSGameOver {
  type: "game_over";
  reason: string;
  message: string;
}

export type ServerMessage = WSGameState | WSPlayerJoined | WSError | WSGameOver;

export interface GameState {
  fen: string;
  turn: PlayerColor;
  playerColor?: PlayerColor;
  isGameOver: boolean;
  gameOverReason?: string;
}
