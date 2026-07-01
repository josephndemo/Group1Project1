import os
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from sqlalchemy import inspect
from models import db, User, Shelf, Book
from schemas import book_schema, book_schema_many, shelf_schema, shelf_schema_many
from reviews_routes import reviews_bp
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "*"}})
db.init_app(app)
Bcrypt(app)
login_manager = LoginManager(app)
jwt = JWTManager(app)
app.register_blueprint(reviews_bp)

with app.app_context():
    db.create_all()
    inspector = inspect(db.engine)
    if 'books' in inspector.get_table_names():
        columns = {col['name'] for col in inspector.get_columns('books')}
        for column_name in ['first_published', 'publisher', 'cover_url', 'external_id']:
            if column_name not in columns:
                try:
                    db.session.execute(db.text(f'ALTER TABLE books ADD COLUMN {column_name} VARCHAR(255)'))
                except Exception:
                    pass
        if 'comment' not in columns:
            try:
                db.session.execute(db.text('ALTER TABLE books ADD COLUMN comment TEXT'))
            except Exception:
                pass
        db.session.commit()


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


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

    hashed = Bcrypt().generate_password_hash(password).decode("utf-8")
    user = User(username=username, email=email, password_hash=hashed)
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
    if not user or not Bcrypt().check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token, "user": {"id": user.id, "username": user.username, "email": user.email}})


@app.route("/shelves", methods=["GET", "POST"])
@jwt_required(optional=True)
def shelves():
    # Login is disabled for now, so unauthenticated requests fall back to the demo user.
    identity = get_jwt_identity()
    user_id = int(identity) if identity is not None else 1

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
    user_id = int(get_jwt_identity())
    shelf = Shelf.query.filter_by(id=shelf_id, user_id=user_id).first_or_404(description="Shelf not found")

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


@app.route("/books", methods=["GET", "POST"])
@jwt_required(optional=True)
def books():
    # Login is disabled for now, so unauthenticated requests fall back to the demo user.
    identity = get_jwt_identity()
    user_id = int(identity) if identity is not None else 1

    if request.method == "GET":
        books = Book.query.filter_by(user_id=user_id).all()
        return jsonify(book_schema_many.dump(books))

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
        shelf_id=payload.get("shelf_id"),
        user_id=user_id,
    )
    db.session.add(book)
    db.session.commit()
    return jsonify(book_schema.dump(book)), 201


@app.route("/books/<int:book_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required(optional=True)
def book_detail(book_id):
    # Login is disabled for now, so unauthenticated requests fall back to the demo user.
    identity = get_jwt_identity()
    user_id = int(identity) if identity is not None else 1
    book = Book.query.filter_by(id=book_id, user_id=user_id).first_or_404(description="Book not found")

    if request.method == "GET":
        return jsonify(book_schema.dump(book))

    if request.method == "PUT":
        payload = request.get_json(silent=True) or {}
        for field in ["title", "author", "notes", "comment", "status", "shelf_id", "first_published", "publisher", "external_id", "cover_url"]:
            if field in payload:
                setattr(book, field, payload[field])
        db.session.commit()
        return jsonify(book_schema.dump(book))

    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "book deleted"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
