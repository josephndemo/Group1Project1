from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")

    shelves = db.relationship(
        "Shelf",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    books = db.relationship(
        "Book",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reviews = db.relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    favorites = db.relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    book_club_comments = db.relationship(
        "BookClubComment",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


class Shelf(db.Model):
    __tablename__ = "shelves"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="shelves")
    books = db.relationship(
        "Book",
        back_populates="shelf",
        cascade="all, delete-orphan",
    )


class Book(db.Model):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    comment = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="want_to_read")
    first_published = db.Column(db.String(50), nullable=True)
    publisher = db.Column(db.String(200), nullable=True)
    cover_url = db.Column(db.String(500), nullable=True)
    external_id = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    shelf_id = db.Column(db.Integer, db.ForeignKey("shelves.id"), nullable=True)

    user = db.relationship("User", back_populates="books")
    shelf = db.relationship("Shelf", back_populates="books")
    reviews = db.relationship(
        "Review",
        back_populates="book",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Book {self.title}>"


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text, nullable=True)
    is_public = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)

    user = db.relationship("User", back_populates="reviews")
    book = db.relationship("Book", back_populates="reviews")

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "book_id",
            name="one_review_per_user_per_book",
        ),
    )

    def __repr__(self):
        return f"<Review book_id={self.book_id} rating={self.rating}>"


class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=False)
    cover_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="favorites")

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "external_id",
            name="one_favorite_per_user_per_book",
        ),
    )

    def __repr__(self):
        return f"<Favorite user_id={self.user_id} external_id={self.external_id}>"


class BookClubComment(db.Model):
    __tablename__ = "book_club_comments"

    id = db.Column(db.Integer, primary_key=True)
    book_key = db.Column(db.String(200), nullable=False, index=True)
    comment_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="book_club_comments")

    def __repr__(self):
        return f"<BookClubComment id={self.id} book_key={self.book_key}>"
