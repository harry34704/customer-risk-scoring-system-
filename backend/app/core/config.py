from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Customer Risk Scoring System API"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/postgres",
        alias="DATABASE_URL",
    )
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        alias="CORS_ORIGINS",
    )
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    auth_secret_key: str = Field(default="local-dev-change-me", alias="AUTH_SECRET_KEY")
    auth_token_ttl_minutes: int = Field(default=10080, alias="AUTH_TOKEN_TTL_MINUTES")
    logistic_model_path: str = Field(
        default=str(Path(__file__).resolve().parents[1] / "data" / "logistic_baseline.json"),
        alias="LOGISTIC_MODEL_PATH",
    )
    seed_demo_password: str = Field(default="Demo123!", alias="SEED_DEMO_PASSWORD")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            if not value:
                return ["http://localhost:3000"]
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item) for item in value]
        return ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
