import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const navigate = useNavigate();
  const [generatedCode, setGeneratedCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const generateRoomCode = async () => {
    try {
      const res = await fetch("http://localhost:8000/rooms", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to create room");
      const data = await res.json();
      setGeneratedCode(data.code);
      console.log(`Created room with code: ${data.code}`);
    } catch (error) {
      console.error(error);
      alert("Error creating room. Please try again.");
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a room code");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/room/${joinCode}`);
      } else {
        alert(data.message || "Wrong room code. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error joining room. Please try again.");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen overflow-hidden p-8"
      style={{ backgroundColor: "#161512" }}
    >
      <div
        className="rounded-lg p-8 w-full max-w-md"
        style={{ backgroundColor: "#262421" }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-200">
          Game Lobby
        </h1>

        {/* Create Room Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">
            Create Room
          </h2>
          <button
            onClick={generateRoomCode}
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            style={{ backgroundColor: "#3893e8" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#2d7ac7")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#3893e8")
            }
          >
            Create Room
          </button>

          {generatedCode && (
            <div
              className="mt-4 p-4 rounded-lg"
              style={{
                backgroundColor: "#2d4a2e",
                border: "1px solid #4a7c4e",
              }}
            >
              <p className="font-semibold" style={{ color: "#8bc34a" }}>
                Room Created!
              </p>
              <p
                className="text-2xl font-bold text-center mt-2"
                style={{ color: "#a5d6a7" }}
              >
                {generatedCode}
              </p>
              <p
                className="text-sm text-center mt-1"
                style={{ color: "#81c784" }}
              >
                Share this code with others
              </p>
            </div>
          )}
        </div>

        {/* Join Room Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">
            Join Room
          </h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter the room code"
              className="rounded-lg px-4 py-3 text-center text-lg font-mono focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "#161512",
                border: "1px solid #3d3d3d",
                color: "#d0d0d0",
              }}
              maxLength={3}
            />
            <button
              onClick={joinRoom}
              className="text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              style={{ backgroundColor: "#5cb85c" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#4a9d4a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#5cb85c")
              }
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
