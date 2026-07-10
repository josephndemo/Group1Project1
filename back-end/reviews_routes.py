from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError

from models import Book, BookClubComment, Review, User, db
from schemas import review_schema, review_schema_many

# Review and Book Club blueprint.
# Handles:
# - per-user review CRUD
# - public recommendation summaries
# - cross-user book club discussion feed and comments

reviews_bp = Blueprint("reviews", __name__)


def _request_user_id():
 # Convert JWT identity to int user id for downstream DB filters.
 identity = get_jwt_identity()
 if identity is None:
  return None
 return int(identity)


def _parse_rating(payload):
 # Shared validation helper to enforce rating bounds for review endpoints.
 try:
  rating = int(payload.get("rating"))
 except (TypeError, ValueError):
  return None, (jsonify({"error": "rating must be an integer from 1 to 5"}), 400)

 if rating < 1 or rating > 5:
  return None, (jsonify({"error": "rating must be between 1 and 5"}), 400)

 return rating, None


@reviews_bp.route("/reviews", methods=["GET", "POST"])
@jwt_required()
def reviews_collection():
 # GET: current user's own reviews
 # POST: create or update one review per user per book
 user_id = _request_user_id()
 if user_id is None:
    return jsonify({"error": "authentication required"}), 401

 if request.method == "GET":
  reviews = (
   Review.query
   .filter_by(user_id=user_id)
   .order_by(Review.updated_at.desc())
   .all()
  )
  return jsonify(review_schema_many.dump(reviews))

 payload = request.get_json(silent=True) or {}
 book_id = payload.get("book_id")
 if not book_id:
  return jsonify({"error": "book_id is required"}), 400

 book = Book.query.filter_by(id=book_id).first()
 if not book:
  return jsonify({"error": "Book not found"}), 404

 rating, error_response = _parse_rating(payload)
 if error_response:
  return error_response

 existing = Review.query.filter_by(user_id=user_id, book_id=book.id).first()
 if existing:
  existing.rating = rating
  existing.review_text = payload.get("review_text")
  existing.is_public = bool(payload.get("is_public", True))
  db.session.commit()
  return jsonify(review_schema.dump(existing)), 200

 review = Review(
  rating=rating,
  review_text=payload.get("review_text"),
  is_public=bool(payload.get("is_public", True)),
  user_id=user_id,
  book_id=book.id,
 )
 db.session.add(review)
 try:
  db.session.commit()
 except IntegrityError:
  db.session.rollback()
  return jsonify({"error": "review already exists for this book"}), 409

 return jsonify(review_schema.dump(review)), 201


@reviews_bp.route("/reviews/<int:review_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def review_detail(review_id):
 # Enforce per-user ownership for read/update/delete operations.
 user_id = _request_user_id()
 if user_id is None:
    return jsonify({"error": "authentication required"}), 401
 review = Review.query.filter_by(id=review_id, user_id=user_id).first_or_404(description="Review not found")

 if request.method == "GET":
  return jsonify(review_schema.dump(review))

 if request.method == "PUT":
  payload = request.get_json(silent=True) or {}

  if "rating" in payload:
   rating, error_response = _parse_rating(payload)
   if error_response:
    return error_response
   review.rating = rating

  if "review_text" in payload:
   review.review_text = payload.get("review_text")

  if "is_public" in payload:
   review.is_public = bool(payload.get("is_public"))

  db.session.commit()
  return jsonify(review_schema.dump(review))

 db.session.delete(review)
 db.session.commit()
 return jsonify({"message": "review deleted"})


@reviews_bp.route("/books/<int:book_id>/reviews", methods=["GET"])
@jwt_required()
def reviews_for_book(book_id):
 # Return public reviews plus the caller's private review (if present).
 user_id = _request_user_id()
 if user_id is None:
    return jsonify({"error": "authentication required"}), 401
 reviews = (
  Review.query
  .filter(
   Review.book_id == book_id,
   or_(Review.is_public.is_(True), Review.user_id == user_id),
  )
  .order_by(Review.updated_at.desc())
  .all()
 )
 return jsonify(review_schema_many.dump(reviews))


@reviews_bp.route("/book-club/recommendations", methods=["GET"])
def book_club_recommendations():
 # Lightweight public recommendations based on public review aggregates.
 try:
   rows = (
    db.session.query(
      Book.id.label("book_id"),
      Book.title,
      Book.author,
      Book.cover_url,
      Book.external_id,
      func.avg(Review.rating).label("average_rating"),
      func.count(Review.id).label("review_count"),
    )
    .join(Review, Review.book_id == Book.id)
    .filter(Review.is_public.is_(True))
    .group_by(Book.id, Book.title, Book.author, Book.cover_url, Book.external_id)
    .order_by(func.avg(Review.rating).desc(), func.count(Review.id).desc())
    .limit(20)
    .all()
   )
 except Exception:
   return jsonify([])

 return jsonify([
  {
   "book_id": row.book_id,
   "id": row.book_id,
   "title": row.title,
   "author": row.author,
   "cover_url": row.cover_url,
   "external_id": row.external_id,
   "average_rating": round(float(row.average_rating), 2) if row.average_rating is not None else 0,
   "review_count": int(row.review_count),
  }
  for row in rows
 ])


@reviews_bp.route("/book-club/books", methods=["GET"])
@jwt_required()
def book_club_books():
 # Build a cross-user discussion feed from books placed on personal shelves.
 # Each item reports who is reading/completed and attached comment thread data.
 user_books = (
  db.session.query(Book, User)
  .join(User, User.id == Book.user_id)
  .filter(Book.shelf_id.isnot(None))
  .order_by(Book.updated_at.desc(), Book.created_at.desc())
  .all()
 )

 aggregated = {}

 for shelf_book, owner in user_books:
  book_key = str(shelf_book.external_id or shelf_book.id)
  item = aggregated.get(book_key)
  if item is None:
   item = {
    "id": book_key,
    "book_key": book_key,
    "title": shelf_book.title,
    "author": shelf_book.author,
    "cover_url": shelf_book.cover_url,
    "first_published": shelf_book.first_published,
    "publisher": shelf_book.publisher,
    "users_reading": [],
    "users_completed": [],
    "reviews": [],
    "review_count": 0,
   }
   aggregated[book_key] = item

  identity = {
   "user_id": owner.id,
   "username": owner.username,
   "status": shelf_book.status,
  }

  if shelf_book.status == "completed":
   if all(entry["user_id"] != owner.id for entry in item["users_completed"]):
    item["users_completed"].append(identity)
  else:
   if all(entry["user_id"] != owner.id for entry in item["users_reading"]):
    item["users_reading"].append(identity)

 comments = (
  db.session.query(BookClubComment, User)
  .join(User, User.id == BookClubComment.user_id)
  .order_by(BookClubComment.created_at.desc())
  .all()
 )

 for comment, author in comments:
  item = aggregated.get(comment.book_key)
  if not item:
   continue

  item["reviews"].append(
   {
    "id": comment.id,
    "comment": comment.comment_text,
    "reviewerName": author.username,
    "createdAt": comment.created_at.isoformat() if comment.created_at else None,
   }
  )

 for item in aggregated.values():
  item["review_count"] = len(item["reviews"])
  item["recommendationScore"] = min(100, item["review_count"] * 8 + len(item["users_completed"]) * 10)
  item["averageRating"] = 5 if item["users_completed"] else 4 if item["users_reading"] else 0

 result = sorted(
  aggregated.values(),
  key=lambda entry: (entry["review_count"], len(entry["users_completed"]), len(entry["users_reading"])),
  reverse=True,
 )

 return jsonify(result)


@reviews_bp.route("/book-club/books/<path:book_key>/comments", methods=["GET", "POST"])
@jwt_required()
def book_club_comments(book_key):
 # Comment thread endpoint used by the Book Club UI (facebook-style discussion).
 user_id = _request_user_id()
 if user_id is None:
  return jsonify({"error": "authentication required"}), 401

 normalized_key = str(book_key).strip()
 if not normalized_key:
  return jsonify({"error": "book_key is required"}), 400

 if request.method == "GET":
  comments = (
   db.session.query(BookClubComment, User)
   .join(User, User.id == BookClubComment.user_id)
   .filter(BookClubComment.book_key == normalized_key)
   .order_by(BookClubComment.created_at.desc())
   .all()
  )
  return jsonify(
   [
    {
     "id": comment.id,
     "comment": comment.comment_text,
     "reviewerName": author.username,
     "createdAt": comment.created_at.isoformat() if comment.created_at else None,
    }
    for comment, author in comments
   ]
  )

 payload = request.get_json(silent=True) or {}
 comment_text = str(payload.get("comment") or "").strip()
 if not comment_text:
  return jsonify({"error": "comment is required"}), 400

 comment = BookClubComment(
  book_key=normalized_key,
  comment_text=comment_text,
  user_id=user_id,
 )
 db.session.add(comment)
 db.session.commit()

 user = User.query.get(user_id)
 return (
  jsonify(
   {
    "id": comment.id,
    "comment": comment.comment_text,
    "reviewerName": user.username if user else "Anonymous Reader",
    "createdAt": comment.created_at.isoformat() if comment.created_at else None,
   }
  ),
  201,
 )
