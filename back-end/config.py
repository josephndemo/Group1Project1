import os
from datetime import timedelta
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy.engine.url import make_url
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url):
    if not url:
        return url

    # Render env values are occasionally pasted with wrapping quotes or whitespace.
    url = url.strip().strip('"').strip("'")

    # Accept mistakenly pasted KEY=value forms in env variable values.
    if "=" in url and not url.startswith(("postgres://", "postgresql://")):
        key, value = url.split("=", 1)
        if key.strip().upper() in {"DATABASE_URL", "POSTGRES_URL", "POSTGRESQL_URL", "RENDER_DATABASE_URL"}:
            url = value.strip().strip('"').strip("'")

    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Optionally append sslmode when explicitly configured via env.
    # This avoids breaking Render internal database URLs that do not use SSL.
    if url and url.startswith("postgresql://"):
        parsed = urlsplit(url)
        db_sslmode = os.getenv("DB_SSLMODE")
        if parsed.netloc and db_sslmode:
            query = dict(parse_qsl(parsed.query, keep_blank_values=True))
            if "sslmode" not in query:
                query["sslmode"] = db_sslmode
                url = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))

    return url


def _database_url():
    candidates = [
        os.getenv("DATABASE_URL"),
        os.getenv("POSTGRES_URL"),
        os.getenv("POSTGRESQL_URL"),
        os.getenv("RENDER_DATABASE_URL"),
    ]

    for candidate in candidates:
        normalized = _normalize_database_url(candidate)
        if not normalized:
            continue
        try:
            make_url(normalized)
            return normalized
        except Exception:
            continue

    raise RuntimeError(
        "No valid SQLAlchemy database URL found. Set DATABASE_URL (or POSTGRES_URL/POSTGRESQL_URL/RENDER_DATABASE_URL)."
    )


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=5)
    SESSION_REFRESH_EACH_REQUEST = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = False
