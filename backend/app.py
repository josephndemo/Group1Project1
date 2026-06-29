from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, User, Book, BookshelfItem, Comment
from sqlalchemy.sql import func
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookshelf_hub.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'super_secret_session_encryption_key_matrix'

CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])
db.init_app(app)

# --- AUTHENTICATION ENGINES ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing entry parameters"}), 400
        
    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Username or Email identity record already exists"}), 422
        
    if len(data['password']) < 8:
        return jsonify({"error": "Password length must be at least 8 characters"}), 400

    new_user = User(username=data['username'], email=data['email'], role=data.get('role', 'user'))
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    
    session['user_id'] = new_user.id
    return jsonify(new_user.to_dict()), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not user.check_password(data.get('password')):
        return jsonify({"error": "Invalid username or password credentials"}), 401
        
    session['user_id'] = user.id
    return jsonify(user.to_dict()), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Session cleanly revoked"}), 200

@app.route('/api/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized session status"}), 401
    user = User.query.get(user_id)
    return jsonify(user.to_dict()), 200


# --- ADMINISTRATIVE CORE CRUD (BOOK MASTER CONTROLLER) ---

@app.route('/api/books', methods=['GET', 'POST'])
def handle_books():
    if request.method == 'GET':
        try:
            books = Book.query.all()
            if not books:
                return jsonify([]), 200
            return jsonify([b.to_dict() for b in books]), 200
        except Exception as e:
            return jsonify({"error": "Failed to read database catalog records", "details": str(e)}), 500
        
    user_id = session.get('user_id')
    user = User.query.get(user_id) if user_id else None
    if not user or user.role != 'admin':
        return jsonify({"error": "Admin access authorization required"}), 403
        
    try:
        data = request.get_json()
        new_book = Book(
            title=data.get('title'), 
            author=data.get('author'), 
            genre=data.get('genre'),
            description=data.get('description'), 
            cover_image=data.get('cover_image'),
            publication_year=int(data.get('publication_year', 2026)), 
            total_pages=int(data.get('total_pages', 100))
        )
        db.session.add(new_book)
        db.session.commit()
        return jsonify(new_book.to_dict()), 201
    except Exception as e:
        return jsonify({"error": "Failed to append inventory record", "details": str(e)}), 400


@app.route('/api/books/<int:book_id>', methods=['PATCH', 'DELETE'])
def modify_master_book(book_id):
    user_id = session.get('user_id')
    user = User.query.get(user_id) if user_id else None
    if not user or user.role != 'admin':
        return jsonify({"error": "Admin access authorization required"}), 403

    book = Book.query.get_or_404(book_id)

    if request.method == 'DELETE':
        db.session.delete(book)
        db.session.commit()
        return jsonify({"message": "Book structure dropped clean."}), 200

    try:
        data = request.get_json()
        if 'title' in data: book.title = data['title']
        if 'author' in data: book.author = data['author']
        if 'genre' in data: book.genre = data['genre']
        if 'description' in data: book.description = data['description']
        if 'publication_year' in data: book.publication_year = int(data['publication_year'])
        if 'total_pages' in data: book.total_pages = int(data['total_pages'])
        
        db.session.commit()
        return jsonify(book.to_dict()), 200
    except Exception as e:
        return jsonify({"error": "Processing adjustment failed", "details": str(e)}), 400


# --- BOOKSHELF MANAGEMENT SYSTEM ---

@app.route('/api/bookshelf', methods=['GET', 'POST'])
def manage_bookshelf():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Login validation verified as missing"}), 401

    if request.method == 'POST':
        data = request.get_json()
        existing = BookshelfItem.query.filter_by(user_id=user_id, book_id=data.get('book_id')).first()
        if existing:
            return jsonify({"error": "Book profile already tracked on shelf"}), 422
            
        item = BookshelfItem(user_id=user_id, book_id=data.get('book_id'), status=data.get('status', 'Want to Read'))
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_dict()), 201

    status_filter = request.args.get('status')
    sort_by = request.args.get('sort', 'recently_added')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 8))

    query = BookshelfItem.query.filter_by(user_id=user_id)
    if status_filter:
        query = query.filter(BookshelfItem.status == status_filter)

    if sort_by == 'title':
        query = query.join(Book).order_by(Book.title.asc())
    else:
        query = query.order_by(BookshelfItem.date_added.desc())

    paginated_data = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "page": page,
        "per_page": per_page,
        "total": paginated_data.total,
        "data": [item.to_dict() for item in paginated_data.items]
    }), 200


@app.route('/api/bookshelf/<int:item_id>', methods=['PATCH', 'DELETE'])
def modify_bookshelf_item(item_id):
    user_id = session.get('user_id')
    item = BookshelfItem.query.get_or_404(item_id)
    if item.user_id != user_id:
        return jsonify({"error": "Ownership modification collision"}), 403

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Item cleanly dropped from registry"}), 200

    try:
        data = request.get_json()
        book = Book.query.get(item.book_id)

        if 'current_page' in data:
            curr_p = int(data['current_page'])
            if curr_p > book.total_pages:
                return jsonify({"error": "Progress cannot exceed total book pages"}), 400
            item.current_page = curr_p
            item.completion_percentage = round((curr_p / book.total_pages) * 100, 1)
            if item.current_page == book.total_pages:
                item.status = "Completed"

        if 'status' in data and item.status != "Completed":
            item.status = data['status']

        db.session.commit()
        return jsonify(item.to_dict()), 200
    except Exception as e:
        return jsonify({"error": "Failed to update progress", "details": str(e)}), 400


# --- BOOK CLUB DISCUSSION SYSTEM ---

@app.route('/api/comments', methods=['GET', 'POST'])
def handle_comments():
    if request.method == 'GET':
        book_id = request.args.get('book_id')
        if book_id:
            comments = Comment.query.filter_by(book_id=book_id).order_by(Comment.created_at.desc()).all()
        else:
            comments = Comment.query.order_by(Comment.created_at.desc()).all()
        return jsonify([c.to_dict() for c in comments]), 200

    # POST - Write new book club note string
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Authentication required to post comments"}), 401

    data = request.get_json()
    if not data or 'book_id' not in data or 'text' not in data or not data['text'].strip():
        return jsonify({"error": "Comment context can not be empty"}), 400

    try:
        new_comment = Comment(
            user_id=user_id,
            book_id=int(data['book_id']),
            text=data['text'].strip()
        )
        db.session.add(new_comment)
        db.session.commit()
        return jsonify(new_comment.to_dict()), 201
    except Exception as e:
        return jsonify({"error": "Failed to log message", "details": str(e)}), 400


@app.route('/api/dashboard/analytics', methods=['GET'])
def get_dashboard_analytics():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized access request"}), 401

    total_books = BookshelfItem.query.filter_by(user_id=user_id).count()
    completed = BookshelfItem.query.filter_by(user_id=user_id, status="Completed").count()
    reading = BookshelfItem.query.filter_by(user_id=user_id, status="Reading").count()
    
    genre_data = db.session.query(Book.genre, func.count(BookshelfItem.id))\
        .join(BookshelfItem, BookshelfItem.book_id == Book.id)\
        .filter(BookshelfItem.user_id == user_id)\
        .group_by(Book.genre).all()

    return jsonify({
        "metrics": {
            "total_books": total_books,
            "completed_books": completed,
            "currently_reading": reading,
            "favorites_count": 0,
            "average_rating": 5.0
        },
        "genre_distribution": [{"genre": g[0], "count": g[1]} for g in genre_data]
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5555, debug=True)