from app import app
from models import db, User, Book, BookshelfItem, Comment
import random

def seed_database():
    with app.app_context():
        print("💥 Purging old application database layers...")
        db.drop_all()
        db.create_all()

        print("👥 Seeding application user parameters...")
        users_data = [
            {"username": "joseph_ndemo", "email": "joseph.ndemo@example.com", "role": "admin"},
            {"username": "mark_warunge", "email": "mark.warunge@example.com", "role": "user"},
            {"username": "gregory_kipchumba", "email": "gregory.kipchumba@example.com", "role": "user"},
            {"username": "abdirahman_salah", "email": "abdirahman.salah@example.com", "role": "user"},
            {"username": "robert_maina", "email": "robert.maina@example.com", "role": "user"},
            {"username": "rotich_ian", "email": "rotich.ian@example.com", "role": "user"}
        ]

        created_users = []
        for user_info in users_data:
            user = User(
                username=user_info["username"],
                email=user_info["email"],
                role=user_info["role"]
            )
            user.set_password("Password123!")
            db.session.add(user)
            created_users.append(user)
        
        db.session.commit()

        print("📚 Seeding master books framework definitions (including 20 expansion books)...")
        books_data = [
            # Original Books
            {
                "title": "Clean Code",
                "author": "Robert C. Martin",
                "genre": "Technology",
                "description": "A handbook of agile software craftsmanship focusing on clean structure and readability.",
                "cover_image": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60",
                "total_pages": 464
            },
            {
                "title": "The Pragmatic Programmer",
                "author": "Andrew Hunt & David Thomas",
                "genre": "Technology",
                "description": "Your journey to mastery from journeyman to software engineer professional.",
                "cover_image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60",
                "total_pages": 352
            },
            # 20 Random Books Addition
            {
                "title": "Introduction to Algorithms",
                "author": "Thomas H. Cormen",
                "genre": "Technology",
                "description": "A comprehensive foundational guide to the analysis and design of computer algorithms.",
                "cover_image": "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500&auto=format&fit=crop&q=60",
                "total_pages": 1312
            },
            {
                "title": "Designing Data-Intensive Applications",
                "author": "Martin Kleppmann",
                "genre": "Technology",
                "description": "An analysis of the core principles and architectures underlying scalable, reliable backend storage engines.",
                "cover_image": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60",
                "total_pages": 611
            },
            {
                "title": "To Kill a Mockingbird",
                "author": "Harper Lee",
                "genre": "Fiction",
                "description": "A classic story exploring justice and racial equality through the eyes of young Scout Finch.",
                "cover_image": "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&auto=format&fit=crop&q=60",
                "total_pages": 281
            },
            {
                "title": "1984",
                "author": "George Orwell",
                "genre": "Fiction",
                "description": "A haunting dystopian novel detailing the dangers of totalitarian surveillance systems and state control.",
                "cover_image": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60",
                "total_pages": 328
            },
            {
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "genre": "Fiction",
                "description": "A profound exploration of the American Dream, romance, wealth, and illusion in the roaring twenties.",
                "cover_image": "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=500&auto=format&fit=crop&q=60",
                "total_pages": 180
            },
            {
                "title": "A Brief History of Time",
                "author": "Stephen Hawking",
                "genre": "Science",
                "description": "An accessible, landmark look at the origins, expansion, and eventual destiny of the universe.",
                "cover_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
                "total_pages": 212
            },
            {
                "title": "Cosmos",
                "author": "Carl Sagan",
                "genre": "Science",
                "description": "A sweeping journey tracing the 14 billion years of cosmic evolution and human scientific discovery.",
                "cover_image": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=60",
                "total_pages": 365
            },
            {
                "title": "Atomic Habits",
                "author": "James Clear",
                "genre": "Business",
                "description": "An easy and proven framework to build good habits, break bad ones, and achieve tiny continuous improvements.",
                "cover_image": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=60",
                "total_pages": 320
            },
            {
                "title": "The Lean Startup",
                "author": "Eric Ries",
                "genre": "Business",
                "description": "How today's entrepreneurs use continuous innovation and agile testing to build radically successful businesses.",
                "cover_image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=60",
                "total_pages": 296
            },
            {
                "title": "Meditations",
                "author": "Marcus Aurelius",
                "genre": "Philosophy",
                "description": "The personal stoic reflections and spiritual exercises composed by the Roman Emperor on duty, mortality, and virtue.",
                "cover_image": "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=500&auto=format&fit=crop&q=60",
                "total_pages": 256
            },
            {
                "title": "Sapiens",
                "author": "Yuval Noah Harari",
                "genre": "Science",
                "description": "A narrative overview tracking the historical breakthrough developments of humankind from ancient ancestors to global networks.",
                "cover_image": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=60",
                "total_pages": 512
            },
            {
                "title": "Zero to One",
                "author": "Peter Thiel",
                "genre": "Business",
                "description": "Notes on startups, engineering mindset, and how to construct unique monopolies to map future value loops.",
                "cover_image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
                "total_pages": 224
            },
            {
                "title": "Thinking, Fast and Slow",
                "author": "Daniel Kahneman",
                "genre": "Science",
                "description": "A detailed review detailing the two primary cognitive systems that drive our choices, logic, and assumptions.",
                "cover_image": "https://images.unsplash.com/photo-1576086213369-97a306dca665?w=500&auto=format&fit=crop&q=60",
                "total_pages": 499
            },
            {
                "title": "The Hobbit",
                "author": "J.R.R. Tolkien",
                "genre": "Fiction",
                "description": "The legendary adventure of Bilbo Baggins as he journeys across Middle-earth to reclaim a stolen treasure hoard.",
                "cover_image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
                "total_pages": 310
            },
            {
                "title": "The Infinite Machine",
                "author": "Camila Russo",
                "genre": "Technology",
                "description": "The chaotic history of how an army of crypto-hackers is building the next global decentralized internet architecture.",
                "cover_image": "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=60",
                "total_pages": 368
            },
            {
                "title": "Deep Work",
                "author": "Cal Newport",
                "genre": "Business",
                "description": "Rules for focused success and engineering performance metrics in a highly distracted digital landscape.",
                "cover_image": "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=500&auto=format&fit=crop&q=60",
                "total_pages": 304
            },
            {
                "title": "Dune",
                "author": "Frank Herbert",
                "genre": "Fiction",
                "description": "The definitive epic space opera centering on planetary resources, political betrayals, and messianic destiny lines.",
                "cover_image": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=60",
                "total_pages": 617
            },
            {
                "title": "The Myth of Sisyphus",
                "author": "Albert Camus",
                "genre": "Philosophy",
                "description": "An essential existential essay evaluating meaning, absurdity, and why one must imagine Sisyphus happy.",
                "cover_image": "https://images.unsplash.com/photo-1506466010722-395cc2ea877e?w=500&auto=format&fit=crop&q=60",
                "total_pages": 212
            },
            {
                "title": "Algorithms to Live By",
                "author": "Brian Christian & Tom Griffiths",
                "genre": "Technology",
                "description": "How the insights of computer science logic models can be applied to streamline human day-to-day scheduling dilemmas.",
                "cover_image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60",
                "total_pages": 368
            },
            {
                "title": "The Art of War",
                "author": "Sun Tzu",
                "genre": "Philosophy",
                "description": "Ancient military strategic treatises assessing conflicts, timing, organizational resource tracking, and tactical maneuvers.",
                "cover_image": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=60",
                "total_pages": 273
            }
        ]

        created_books = []
        for b_info in books_data:
            book = Book(
                title=b_info["title"],
                author=b_info["author"],
                genre=b_info["genre"],
                description=b_info["description"],
                cover_image=b_info["cover_image"],
                total_pages=b_info["total_pages"]
            )
            db.session.add(book)
            created_books.append(book)

        db.session.commit()

        print("📊 Populating dynamic reader bookshelves & user interactions...")
        # Assign 4 random books to users to generate natural looking data streams
        for user in created_users:
            assigned_books = random.sample(created_books, k=3)
            for idx, book in enumerate(assigned_books):
                status = ["Want to Read", "Reading", "Completed"][idx]
                curr_page = 0 if status == "Want to Read" else (book.total_pages if status == "Completed" else random.randint(15, book.total_pages - 10))
                
                shelf_item = BookshelfItem(
                    user_id=user.id,
                    book_id=book.id,
                    status=status,
                    current_page=curr_page,
                    completion_percentage=round((curr_page / book.total_pages) * 100, 1)
                )
                db.session.add(shelf_item)
        
        db.session.commit()

        print("💬 Broadcasting starting context feedback comments onto book club threads...")
        sample_comments = [
            "This particular chapter architectural paradigm completely changed how I track application loop configurations.",
            "Incredible pacing, though the middle analytical sections felt slightly dense for a casual reader context.",
            "Highly recommend this resource to anyone looking to optimize structural clean scaling workflows.",
            "An absolute masterpiece in terms of stylistic clarity, thematic depth, and technical soundness."
        ]

        # Ensure at least 6 books receive comment threads so the Book Club displays data automatically
        for book in created_books[:6]:
            conversing_users = random.sample(created_users, k=2)
            for user in conversing_users:
                comment = Comment(
                    user_id=user.id,
                    book_id=book.id,
                    text=random.choice(sample_comments)
                )
                db.session.add(comment)

        db.session.commit()
        print("🟢 Relational database instances successfully seeded with 22 master catalog records!")

if __name__ == "__main__":
    seed_database()