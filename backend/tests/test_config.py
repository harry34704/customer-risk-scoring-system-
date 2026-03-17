from app.core.config import Settings


def test_render_postgres_url_is_normalized_to_psycopg():
    settings = Settings(DATABASE_URL="postgres://user:pass@host:5432/dbname")

    assert settings.database_url == "postgresql+psycopg://user:pass@host:5432/dbname"


def test_standard_postgresql_url_is_normalized_to_psycopg():
    settings = Settings(DATABASE_URL="postgresql://user:pass@host:5432/dbname")

    assert settings.database_url == "postgresql+psycopg://user:pass@host:5432/dbname"


def test_explicit_psycopg_url_is_left_unchanged():
    settings = Settings(DATABASE_URL="postgresql+psycopg://user:pass@host:5432/dbname")

    assert settings.database_url == "postgresql+psycopg://user:pass@host:5432/dbname"
