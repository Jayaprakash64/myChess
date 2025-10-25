import random
from fastapi import APIRouter
from app.api.lobby.schemas import CreateRoomResponse, JoinRoomRequest, JoinRoomResponse
from app.services.redis_service import redis_client
from app.core.config import settings

router = APIRouter(prefix="/rooms", tags=["lobby"])

@router.post("/", response_model=CreateRoomResponse)
async def create_room():
    #Generating unique code
    while True:
        code = str(random.randint(100, 999))
        exists = await redis_client.exists(code)
        if not exists:
            break

    # Store with TTL
    await redis_client.setex(code, settings.ROOM_CODE_TTL, "active")
    return CreateRoomResponse(code=code)


@router.post("/join", response_model=JoinRoomResponse)
async def join_room(payload: JoinRoomRequest):
    exists = await redis_client.exists(payload.code)
    if not exists:
        return JoinRoomResponse(success=False, message="Invalid or expired room code")
    return JoinRoomResponse(success=True)
