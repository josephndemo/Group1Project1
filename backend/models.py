from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    serialize_rules = ('-password_hash', '-bookshelf_items.user', '-comments.user')

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # Relationships
    bookshelf_items = db.relationship('BookshelfItem', backref='user', lazy=True, cascade="all, delete-orphan")
    comments = db.relationship('Comment', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role
        }


class Book(db.Model, SerializerMixin):
    __tablename__ = 'books'
    
    serialize_rules = ('-bookshelf_instances', '-comments.book')

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(150), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cover_image = db.Column(db.String(300), nullable=True)
    publication_year = db.Column(db.Integer, default=2026)
    total_pages = db.Column(db.Integer, default=100)

    # Relationships
    bookshelf_instances = db.relationship('BookshelfItem', backref='book', lazy=True, cascade="all, delete-orphan")
    comments = db.relationship('Comment', backref='book', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "genre": self.genre,
            "description": self.description,
            "cover_image": self.cover_image or "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60",
            "publication_year": self.publication_year,
            "total_pages": self.total_pages
        }


class BookshelfItem(db.Model, SerializerMixin):
    __tablename__ = 'bookshelf_items'
    
    serialize_rules = ('-user.bookshelf_items', '-book.bookshelf_instances')

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    status = db.Column(db.String(30), default='Want to Read')
    current_page = db.Column(db.Integer, default=0)
    completion_percentage = db.Column(db.Float, default=0.0)
    date_added = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "status": self.status,
            "current_page": self.current_page,
            "completion_percentage": self.completion_percentage,
            "book": self.book.to_dict() if self.book else None
        }


class Comment(db.Model, SerializerMixin):
    __tablename__ = 'comments'
    
    serialize_rules = ('-user.comments', '-book.comments')

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "text": self.text,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "username": self.user.username if self.user else "Anonymous User",
            "book_title": self.book.title if self.book else "Unknown Book",
            "book_cover": self.book.cover_image if self.book else "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"
        }