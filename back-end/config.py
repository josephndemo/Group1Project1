import os
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url):
    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Render/managed Postgres deployments often require SSL.
    if url and url.startswith("postgresql://"):
        parsed = urlsplit(url)
        query = dict(parse_qsl(parsed.query, keep_blank_values=True))
        if "sslmode" not in query:
            query["sslmode"] = os.getenv("DB_SSLMODE", "require")
            url = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))

    return url


def _database_url():
    url = (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("POSTGRESQL_URL")
        or os.getenv("RENDER_DATABASE_URL")
    )
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
