import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url):
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    SQLALCHEMY_DATABASE_URI = _normalize_database_url(
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or "postgresql:///library_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = False
