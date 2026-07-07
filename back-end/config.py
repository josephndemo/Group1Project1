import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url):
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def _database_url():
    url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
    if not url:
        raise RuntimeError(
            "DATABASE_URL or POSTGRES_URL is required; SQLite is not supported."
        )
    return _normalize_database_url(url)


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = False
