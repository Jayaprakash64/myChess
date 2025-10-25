from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None
    ROOM_CODE_TTL: int = 300  #5 minutes

    class Config:
        env_file = ".env"


settings = Settings()
