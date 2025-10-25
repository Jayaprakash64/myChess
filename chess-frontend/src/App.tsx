import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameLobby from "./Pages/GameLobby";
import GameRoom from "./Pages/GameRoom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameLobby />} />
        <Route path="/room/:roomId" element={<GameRoom />} />
      </Routes>
    </Router>
  );
}
