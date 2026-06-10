from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = "http://localhost:8000" # fallback
    SUPABASE_KEY: str = "placeholder"

    class Config:
        env_file = ".env"

settings = Settings()
