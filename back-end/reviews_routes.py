from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError

from models import Book, Review, db
from schemas import review_schema, review_schema_many

reviews_bp = Blueprint("reviews", __name__)


def _request_user_id():
 identity = get_jwt_identity()
 return int(identity) if identity is not None else 1


def _parse_rating(payload):
 try:
  rating = int(payload.get("rating"))
 except (TypeError, ValueError):
  return None, (jsonify({"error": "rating must be an integer from 1 to 5"}), 400)

 if rating < 1 or rating > 5:
  return None, (jsonify({"error": "rating must be between 1 and 5"}), 400)

 return rating, None


@reviews_bp.route("/reviews", methods=["GET", "POST"])
@jwt_required(optional=True)
def reviews_collection():
 user_id = _request_user_id()

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

 book = Book.query.filter_by(id=book_id, user_id=user_id).first()
 if not book:
  return jsonify({"error": "Book not found for this user"}), 404

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
@jwt_required(optional=True)
def review_detail(review_id):
 user_id = _request_user_id()
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
@jwt_required(optional=True)
def reviews_for_book(book_id):
 user_id = _request_user_id()
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
