from pydantic import BaseModel, Field

class CreateRoomResponse(BaseModel):
    code: str

class JoinRoomRequest(BaseModel):
    code: str = Field(..., min_length=3, max_length=3)

class JoinRoomResponse(BaseModel):
    success: bool
    message: str | None = None
