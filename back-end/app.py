import os

from flask import Flask, jsonify, request, session
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from flask_cors import CORS
from flask_migrate import Migrate, upgrade
from sqlalchemy import inspect, text
from models import db, User, Shelf, Book, Favorite
from schemas import (
    book_schema,
    book_schema_many,
    shelf_schema,
    shelf_schema_many,
    favorite_schema,
    favorite_schema_many,
)
from reviews_routes import reviews_bp
from config import Config

# Main Flask application module.
# Responsibilities:
# - initialize app extensions (JWT, CORS, SQLAlchemy, migrations)
# - perform startup safety checks and bootstrap routines
# - expose authentication, shelf, book, favorites, and admin routes

app = Flask(__name__)
app.config.from_object(Config)

db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
if db_uri.startswith("postgresql://"):
    app.logger.info("Database backend: postgresql")
else:
    app.logger.info("Database backend: unknown")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "https://openlibrary20.vercel.app,http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

# Always allow known frontend origins even if CORS_ORIGINS is overridden in env.
required_origins = [
    "https://openlibrary20.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
for origin in required_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

CORS(
    app,
    resources={r"/*": {"origins": allowed_origins}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
app.register_blueprint(reviews_bp)


SESSION_EXPIRED_MESSAGE = "Your session has expired due to inactivity. Please log in again."


@app.before_request
def _refresh_permanent_session_timeout():
    # For session-based auth, renew inactivity timeout on every authenticated request.
    if session.get("user_id"):
        session.permanent = True
        session.modified = True


@jwt.expired_token_loader
def _expired_token_handler(_jwt_header, _jwt_payload):
    session.clear()
    return jsonify({"error": SESSION_EXPIRED_MESSAGE, "code": "token_expired"}), 401


@jwt.unauthorized_loader
def _missing_token_handler(_reason):
    return jsonify({"error": "authentication required", "code": "auth_required"}), 401


@jwt.invalid_token_loader
def _invalid_token_handler(_reason):
    session.clear()
    return jsonify({"error": SESSION_EXPIRED_MESSAGE, "code": "invalid_token"}), 401


@jwt.revoked_token_loader
def _revoked_token_handler(_jwt_header, _jwt_payload):
    session.clear()
    return jsonify({"error": SESSION_EXPIRED_MESSAGE, "code": "token_revoked"}), 401


DEFAULT_USERS = [
    {
        "username": "demo",
        "email": "demo@example.com",
        "password": "demo123",
        "role": "user",
    },
    {
        "username": "admin",
        "email": "admin@example.com",
        "password": "admin123",
        "role": "admin",
    },
    {
        "username": "josephndemo",
        "email": "joseph.ndemo@example.com",
        "password": "password123",
        "role": "user",
    },
    {
        "username": "markwarunge",
        "email": "mark.warunge@example.com",
        "password": "password123",
        "role": "user",
    },
    {
        "username": "gregorykipchumba",
        "email": "gregory.kipchumba@example.com",
        "password": "password123",
        "role": "user",
    },
    {
        "username": "abdirahmanabdisalah",
        "email": "abdirahman.abdisalah@example.com",
        "password": "password123",
        "role": "user",
    },
    {
        "username": "robertmaina",
        "email": "robert.maina@example.com",
        "password": "password123",
        "role": "user",
    },
    {
        "username": "rotichian",
        "email": "rotich.ian@example.com",
        "password": "password123",
        "role": "user",
    },
]


def _initialize_database():
    # Keep hosted environments resilient by applying migrations at boot when allowed.
    # Keep Render-like deployments resilient when migrations were not run manually.
    if os.getenv("AUTO_DB_UPGRADE", "true").lower() != "true":
        return

    with app.app_context():
        try:
            upgrade()
        except Exception as exc:
            app.logger.warning("Database upgrade failed, creating tables directly: %s", exc)

        try:
            # Ensure required tables exist even when migrations are partially applied.
            db.create_all()

            # Guard against older DBs that don't yet have the role column.
            inspector = inspect(db.engine)
            user_columns = {column["name"] for column in inspector.get_columns("users")}
            if "role" not in user_columns:
                db.session.execute(
                    text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'")
                )
                db.session.commit()
        except Exception as exc:
            db.session.rollback()
            app.logger.warning("Startup schema initialization skipped: %s", exc)


def _repair_legacy_schema():
    # Backfill legacy deployments where prior columns may be missing.
    with app.app_context():
        repairs = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS notes TEXT",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS comment TEXT",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'want_to_read'",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS first_published VARCHAR(50)",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher VARCHAR(200)",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url VARCHAR(500)",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS external_id VARCHAR(200)",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1",
            "ALTER TABLE books ADD COLUMN IF NOT EXISTS shelf_id INTEGER",
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL DEFAULT 5",
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text TEXT",
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE",
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1",
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS book_id INTEGER NOT NULL DEFAULT 1",
        ]

        try:
            with db.engine.begin() as connection:
                for statement in repairs:
                    connection.execute(text(statement))
        except Exception as exc:
            app.logger.warning("Legacy schema repair skipped: %s", exc)


def _ensure_catalog_seeded():
    # Seed catalog books only when the shared catalog is empty.
    if os.getenv("AUTO_SEED_CATALOG", "true").lower() != "true":
        return

    with app.app_context():
        try:
            catalog_count = Book.query.filter_by(shelf_id=None).count()
            if catalog_count > 0:
                return

            # Lazy import avoids startup circular imports while reusing canonical seed data.
            from seed import BOOKS_TO_SEED

            admin = User.query.filter_by(username="admin").first()
            if not admin:
                admin = User(
                    username=os.getenv("DEFAULT_ADMIN_USERNAME", "admin"),
                    email=os.getenv("DEFAULT_ADMIN_EMAIL", "admin@example.com"),
                    password_hash=bcrypt.generate_password_hash(
                        os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
                    ).decode("utf-8"),
                    role="admin",
                )
                db.session.add(admin)
                db.session.flush()

            inserted = 0
            for entry in BOOKS_TO_SEED:
                db.session.add(
                    Book(
                        title=entry["title"],
                        author=entry["author"],
                        notes=entry.get("notes"),
                        status=entry.get("status", "want_to_read"),
                        first_published=entry.get("first_published"),
                        publisher=entry.get("publisher"),
                        cover_url=entry.get("cover_url"),
                        external_id=entry.get("external_id"),
                        user_id=admin.id,
                        shelf_id=None,
                    )
                )
                inserted += 1

            db.session.commit()
            app.logger.info("Auto-seeded %s catalog books.", inserted)
        except Exception as exc:
            db.session.rollback()
            app.logger.warning("Catalog auto-seed skipped: %s", exc)


def _sync_default_users():
    # Upsert a known set of demo users for deterministic QA and demos.
    if os.getenv("AUTO_SYNC_DEFAULT_USERS", "true").lower() != "true":
        return

    with app.app_context():
        try:
            synced = 0

            for entry in DEFAULT_USERS:
                user = User.query.filter(
                    (User.username == entry["username"]) | (User.email == entry["email"])
                ).first()

                if not user:
                    user = User(
                        username=entry["username"],
                        email=entry["email"],
                        role=entry["role"],
                        password_hash=bcrypt.generate_password_hash(entry["password"]).decode("utf-8"),
                    )
                    db.session.add(user)
                else:
                    user.username = entry["username"]
                    user.email = entry["email"]
                    user.role = entry["role"]
                    user.password_hash = bcrypt.generate_password_hash(entry["password"]).decode("utf-8")

                _ensure_user_shelf(user)

                synced += 1

            db.session.commit()
            app.logger.info("Default user credentials synced for %s users.", synced)
        except Exception as exc:
            db.session.rollback()
            app.logger.warning("Default user sync skipped: %s", exc)


def _auth_user_or_401():
    # Resolve the JWT identity into a concrete user account.
    identity = get_jwt_identity()
    if identity is None:
        return None, (jsonify({"error": "authentication required"}), 401)

    user = User.query.get(int(identity))
    if not user:
        return None, (jsonify({"error": "user not found"}), 404)

    session["user_id"] = user.id
    session.permanent = True
    session.modified = True

    return user, None


def _admin_required_or_403(user):
    # Centralized admin-authorization guard for privileged routes.
    if user.role != "admin":
        return jsonify({"error": "admin access required"}), 403
    return None


def _ensure_user_shelf(user):
    # Guarantee every user has one personal shelf for reading workflow features.
    shelf = Shelf.query.filter_by(user_id=user.id).order_by(Shelf.id.asc()).first()
    if shelf:
        return shelf, False

    shelf = Shelf(
        name=f"{user.username}'s Shelf",
        description="Personal reading shelf",
        user_id=user.id,
    )
    db.session.add(shelf)
    db.session.flush()
    return shelf, True


_initialize_database()
_repair_legacy_schema()
_sync_default_users()
_ensure_catalog_seeded()


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "message": "OpenLibrary Hub backend is running",
        "health": "/health",
        "environment": os.getenv("FLASK_ENV", "production"),
        "routes": {
            "auth": ["/auth/register", "/auth/login", "/auth/me"],
            "books": ["/books", "/books/<book_id>"],
            "shelves": ["/shelves", "/shelves/<shelf_id>/books"],
            "favorites": ["/favorites"],
            "reviews": ["/reviews", "/books/<book_id>/reviews"],
            "book_club": ["/book-club/recommendations"],
        },
    })


@app.route("/health", methods=["GET"])
def health():
    try:
        db.session.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as exc:
        app.logger.warning("Health DB probe failed: %s", exc)
        db_status = "error"

    return jsonify({"status": "ok", "database": db_status})


@app.route("/auth/register", methods=["POST"])
def register():
    # Public signup endpoint with uniqueness validation by username/email.
    payload = request.get_json(silent=True) or {}
    username = payload.get("username", "").strip()
    email = payload.get("email", "").strip()
    password = payload.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "user already exists"}), 409

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, email=email, password_hash=hashed, role="user")
    db.session.add(user)
    db.session.flush()
    _ensure_user_shelf(user)
    db.session.commit()

    return jsonify({"message": "user registered"}), 201


@app.route("/auth/login", methods=["POST"])
def login():
    # Authenticate by username/email and return a short-lived JWT access token.
    payload = request.get_json(silent=True) or {}
    identifier = payload.get("identifier", "").strip()
    password = payload.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "identifier and password are required"}), 400

    try:
        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({"error": "invalid credentials"}), 401

        _, created = _ensure_user_shelf(user)
        if created:
            db.session.commit()
    except Exception as exc:
        db.session.rollback()
        app.logger.warning("Login failed because database is not ready: %s", exc)
        return jsonify({"error": "database not ready"}), 503

    session["user_id"] = user.id
    session.permanent = True
    session.modified = True

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
        }
    )


@app.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_access_token():
    # New access tokens are only issued through refresh-token flow.
    identity = get_jwt_identity()
    user = User.query.get(int(identity)) if identity is not None else None
    if not user:
        session.clear()
        return jsonify({"error": "user not found"}), 404

    session["user_id"] = user.id
    session.permanent = True
    session.modified = True

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token})


@app.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    # Return the authenticated profile used for session restoration in the UI.
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    return jsonify({"id": user.id, "username": user.username, "email": user.email, "role": user.role})


@app.route("/admin/users", methods=["GET"])
@jwt_required()
def admin_users():
    # Admin-only account listing for management workflows.
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    admin_error = _admin_required_or_403(user)
    if admin_error:
        return admin_error

    users = User.query.order_by(User.id.asc()).all()
    return jsonify(
        [
            {
                "id": account.id,
                "username": account.username,
                "email": account.email,
                "role": account.role,
                "shelf_count": len(account.shelves or []),
                "favorite_count": len(account.favorites or []),
            }
            for account in users
        ]
    )


@app.route("/admin/users/<int:user_id>", methods=["PUT", "DELETE"])
@jwt_required()
def admin_user_detail(user_id):
    # Admin-only user role updates and account deletions.
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    admin_error = _admin_required_or_403(user)
    if admin_error:
        return admin_error

    target_user = User.query.filter_by(id=user_id).first_or_404(description="User not found")

    if request.method == "PUT":
        payload = request.get_json(silent=True) or {}
        role = str(payload.get("role") or "").strip().lower()
        if role not in {"admin", "user"}:
            return jsonify({"error": "role must be admin or user"}), 400

        target_user.role = role
        db.session.commit()
        return jsonify(
            {
                "id": target_user.id,
                "username": target_user.username,
                "email": target_user.email,
                "role": target_user.role,
                "shelf_count": len(target_user.shelves or []),
                "favorite_count": len(target_user.favorites or []),
            }
        )

    if target_user.id == user.id:
        return jsonify({"error": "You cannot delete your own admin account"}), 400

    db.session.delete(target_user)
    db.session.commit()
    return jsonify({"message": "user deleted"})


@app.route("/favorites", methods=["GET", "POST"])
@jwt_required()
def favorites():
    # Persisted user favorites (non-browser-local) for cross-device continuity.
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    if request.method == "GET":
        favorites = Favorite.query.filter_by(user_id=user.id).order_by(Favorite.created_at.desc()).all()
        return jsonify(favorite_schema_many.dump(favorites))

    payload = request.get_json(silent=True) or {}
    external_id = str(payload.get("external_id", "")).strip()
    title = str(payload.get("title", "")).strip()
    author = str(payload.get("author", "")).strip()
    cover_url = payload.get("cover_url")

    if not external_id or not title or not author:
        return jsonify({"error": "external_id, title, and author are required"}), 400

    existing = Favorite.query.filter_by(user_id=user.id, external_id=external_id).first()
    if existing:
        return jsonify(favorite_schema.dump(existing)), 200

    favorite = Favorite(
        external_id=external_id,
        title=title,
        author=author,
        cover_url=cover_url,
        user_id=user.id,
    )
    db.session.add(favorite)
    db.session.commit()
    return jsonify(favorite_schema.dump(favorite)), 201


@app.route("/favorites/<path:external_id>", methods=["DELETE"])
@jwt_required()
def delete_favorite(external_id):
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    normalized_external_id = str(external_id).strip()
    if not normalized_external_id:
        return jsonify({"error": "external_id is required"}), 400

    favorite = Favorite.query.filter_by(user_id=user.id, external_id=normalized_external_id).first_or_404(
        description="Favorite not found"
    )
    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "favorite removed"})


@app.route("/shelves", methods=["GET", "POST"])
@jwt_required()
def shelves():
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    user_id = user.id

    if request.method == "GET":
        _, created = _ensure_user_shelf(user)
        if created:
            db.session.commit()
        shelves = Shelf.query.filter_by(user_id=user_id).all()
        return jsonify(shelf_schema_many.dump(shelves))

    payload = request.get_json(silent=True) or {}
    if not payload.get("name"):
        return jsonify({"error": "name is required"}), 400

    shelf = Shelf(name=payload["name"], description=payload.get("description"), user_id=user_id)
    db.session.add(shelf)
    db.session.commit()
    return jsonify(shelf_schema.dump(shelf)), 201


@app.route("/shelves/<int:shelf_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def shelf_detail(shelf_id):
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    shelf = Shelf.query.filter_by(id=shelf_id, user_id=user.id).first_or_404(description="Shelf not found")

    if request.method == "GET":
        return jsonify(shelf_schema.dump(shelf))

    if request.method == "PUT":
        payload = request.get_json(silent=True) or {}
        if payload.get("name"):
            shelf.name = payload["name"]
        if "description" in payload:
            shelf.description = payload.get("description")
        db.session.commit()
        return jsonify(shelf_schema.dump(shelf))

    db.session.delete(shelf)
    db.session.commit()
    return jsonify({"message": "shelf deleted"})


@app.route("/shelves/<int:shelf_id>/books", methods=["POST"])
@jwt_required()
def add_book_to_shelf(shelf_id):
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    shelf = Shelf.query.filter_by(id=shelf_id, user_id=user.id).first_or_404(description="Shelf not found")
    payload = request.get_json(silent=True) or {}
    source_book_id = payload.get("book_id")
    if not source_book_id:
        return jsonify({"error": "book_id is required"}), 400

    source_book = Book.query.filter_by(id=source_book_id, shelf_id=None).first()
    if not source_book:
        return jsonify({"error": "Catalog book not found"}), 404

    source_external_id = source_book.external_id or str(source_book.id)
    existing = Book.query.filter_by(
        user_id=user.id,
        shelf_id=shelf.id,
        external_id=source_external_id,
    ).first()
    if existing:
        return jsonify(book_schema.dump(existing)), 200

    user_book = Book(
        title=source_book.title,
        author=source_book.author,
        notes=payload.get("notes"),
        comment=payload.get("comment"),
        status=payload.get("status", "want_to_read"),
        first_published=source_book.first_published,
        publisher=source_book.publisher,
        cover_url=source_book.cover_url,
        external_id=source_external_id,
        shelf_id=shelf.id,
        user_id=user.id,
    )
    db.session.add(user_book)
    db.session.commit()
    return jsonify(book_schema.dump(user_book)), 201


@app.route("/shelves/<int:shelf_id>/books", methods=["GET"])
@jwt_required()
def shelf_books(shelf_id):
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    Shelf.query.filter_by(id=shelf_id, user_id=user.id).first_or_404(description="Shelf not found")
    books = Book.query.filter_by(user_id=user.id, shelf_id=shelf_id).order_by(Book.created_at.desc()).all()
    return jsonify(book_schema_many.dump(books))


@app.route("/shelves/<int:shelf_id>/books/<int:book_id>", methods=["PUT", "DELETE"])
@jwt_required()
def remove_book_from_shelf(shelf_id, book_id):
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    Shelf.query.filter_by(id=shelf_id, user_id=user.id).first_or_404(description="Shelf not found")
    book = Book.query.filter_by(id=book_id, user_id=user.id, shelf_id=shelf_id).first_or_404(
        description="Shelf book not found"
    )

    if request.method == "PUT":
        payload = request.get_json(silent=True) or {}

        if "status" in payload:
            status_value = str(payload.get("status") or "").strip().lower()
            if status_value == "in_progress":
                status_value = "want_to_read"
            if status_value not in {"want_to_read", "completed"}:
                return jsonify({"error": "status must be in progress or completed"}), 400
            book.status = status_value

        if "comment" in payload:
            book.comment = payload.get("comment")

        db.session.commit()
        return jsonify(book_schema.dump(book))

    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "book removed from shelf"})


@app.route("/books", methods=["GET", "POST"])
@jwt_required()
def books():
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    if request.method == "GET":
        if user.role == "admin":
            books = Book.query.filter_by(shelf_id=None).order_by(Book.created_at.desc()).all()
        else:
            books = Book.query.filter_by(shelf_id=None).order_by(Book.created_at.desc()).all()
        return jsonify(book_schema_many.dump(books))

    admin_error = _admin_required_or_403(user)
    if admin_error:
        return admin_error

    payload = request.get_json(silent=True) or {}
    if not payload.get("title") or not payload.get("author"):
        return jsonify({"error": "title and author are required"}), 400

    book = Book(
        title=payload["title"],
        author=payload["author"],
        notes=payload.get("notes"),
        comment=payload.get("comment"),
        status=payload.get("status", "want_to_read"),
        first_published=payload.get("first_published"),
        publisher=payload.get("publisher"),
        cover_url=payload.get("cover_url"),
        external_id=payload.get("external_id"),
        shelf_id=None,
        user_id=user.id,
    )
    db.session.add(book)
    db.session.commit()
    return jsonify(book_schema.dump(book)), 201


@app.route("/books/<int:book_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def book_detail(book_id):
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    if request.method == "GET":
        if user.role == "admin":
            book = Book.query.filter_by(id=book_id).first_or_404(description="Book not found")
        else:
            book = Book.query.filter_by(id=book_id, shelf_id=None).first_or_404(description="Book not found")
        return jsonify(book_schema.dump(book))

    admin_error = _admin_required_or_403(user)
    if admin_error:
        return admin_error

    book = Book.query.filter_by(id=book_id, shelf_id=None).first_or_404(description="Catalog book not found")

    if request.method == "PUT":
        payload = request.get_json(silent=True) or {}
        for field in ["title", "author", "notes", "comment", "status", "first_published", "publisher", "external_id", "cover_url"]:
            if field in payload:
                setattr(book, field, payload[field])
        db.session.commit()
        return jsonify(book_schema.dump(book))

    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "book deleted"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
