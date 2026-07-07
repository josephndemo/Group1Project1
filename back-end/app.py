import os

from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_migrate import Migrate, upgrade
from sqlalchemy import inspect, text
from models import db, User, Shelf, Book
from schemas import book_schema, book_schema_many, shelf_schema, shelf_schema_many
from reviews_routes import reviews_bp
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

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


def _initialize_database():
    # Keep Render-like deployments resilient when migrations were not run manually.
    if os.getenv("AUTO_DB_UPGRADE", "true").lower() != "true":
        return

    with app.app_context():
        try:
            upgrade()
        except Exception as exc:
            app.logger.warning("Database upgrade failed, creating tables directly: %s", exc)

        # Ensure required tables exist even when migrations are partially applied.
        db.create_all()

        # Guard against older DBs that don't yet have the role column.
        try:
            inspector = inspect(db.engine)
            user_columns = {column["name"] for column in inspector.get_columns("users")}
            if "role" not in user_columns:
                db.session.execute(
                    text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'")
                )
                db.session.commit()
        except Exception as exc:
            db.session.rollback()
            app.logger.warning("Could not verify/repair users.role column: %s", exc)


_initialize_database()


def _auth_user_or_401():
    identity = get_jwt_identity()
    if identity is None:
        return None, (jsonify({"error": "authentication required"}), 401)

    user = User.query.get(int(identity))
    if not user:
        return None, (jsonify({"error": "user not found"}), 404)

    return user, None


def _admin_required_or_403(user):
    if user.role != "admin":
        return jsonify({"error": "admin access required"}), 403
    return None


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/auth/register", methods=["POST"])
def register():
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
    db.session.commit()

    return jsonify({"message": "user registered"}), 201


@app.route("/auth/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    identifier = payload.get("identifier", "").strip()
    password = payload.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "identifier and password are required"}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify(
        {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
        }
    )


@app.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    return jsonify({"id": user.id, "username": user.username, "email": user.email, "role": user.role})


@app.route("/shelves", methods=["GET", "POST"])
@jwt_required()
def shelves():
    user, error_response = _auth_user_or_401()
    if error_response:
        return error_response

    user_id = user.id

    if request.method == "GET":
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

    if user.role == "admin":
        return jsonify({"error": "Admins should manage catalog books via /books"}), 400

    shelf = Shelf.query.filter_by(id=shelf_id, user_id=user.id).first_or_404(description="Shelf not found")
    payload = request.get_json(silent=True) or {}
    source_book_id = payload.get("book_id")
    if not source_book_id:
        return jsonify({"error": "book_id is required"}), 400

    source_book = Book.query.filter_by(id=source_book_id, shelf_id=None).first()
    if not source_book:
        return jsonify({"error": "Catalog book not found"}), 404

    user_book = Book(
        title=source_book.title,
        author=source_book.author,
        notes=payload.get("notes"),
        comment=payload.get("comment"),
        status=payload.get("status", "want_to_read"),
        first_published=source_book.first_published,
        publisher=source_book.publisher,
        cover_url=source_book.cover_url,
        external_id=source_book.external_id or str(source_book.id),
        shelf_id=shelf.id,
        user_id=user.id,
    )
    db.session.add(user_book)
    db.session.commit()
    return jsonify(book_schema.dump(user_book)), 201


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
