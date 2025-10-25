from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.api.lobby import routes as lobby_routes
from app.sockets.game_ws import game_ws


app = FastAPI(title="myChess")

#CORS settings 
origins = [
    "http://localhost:5173",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Routers
app.include_router(lobby_routes.router)

@app.get("/")
async def root():
    return {"message": "Game Lobby API running"}


# WebSocket endpoint for game room
@app.websocket("/rooms/{room_id}/ws")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await game_ws(websocket, room_id)
