from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    YOUTUBE_API_KEY: str
    GEMINI_API_KEY: str | None = None
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",")]
        # Allow opening the HTML file directly from disk
        origins += ["null", "file://"]
        return origins

settings = Settings()
