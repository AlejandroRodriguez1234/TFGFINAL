from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://fitforge:fitforge_secret@postgres:5432/fitforge"
    redis_url:    str = "redis://:redis_secret@redis:6379"
    jwt_secret:   str = "development_secret_key"
    max_image_size_mb: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
