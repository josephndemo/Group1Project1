from flask_bcrypt import Bcrypt
from app import app
from models import db, User, Shelf, Book


BOOKS_TO_SEED = [
    {
        "title": "The Midnight Orchard",
        "author": "Elena Brooks",
        "notes": "A moody mystery set in a forgotten garden.",
        "status": "want_to_read",
        "first_published": "2019",
        "publisher": "Northwind Press",
        "cover_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "Neon Tides",
        "author": "Marcus Vale",
        "notes": "A fast-paced sci-fi adventure through a city of lights.",
        "status": "completed",
        "first_published": "2021",
        "publisher": "Orbit House",
        "cover_url": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "The Quiet Atlas",
        "author": "Nora Singh",
        "notes": "An atmospheric travel memoir with maps and hidden stories.",
        "status": "want_to_read",
        "first_published": "2017",
        "publisher": "Harbor Books",
        "cover_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "Glass Rivers",
        "author": "Darius Hale",
        "notes": "A reflective novel about memory and healing.",
        "status": "completed",
        "first_published": "2022",
        "publisher": "Blue Lantern",
        "cover_url": "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "Salt & Static",
        "author": "Mina Torres",
        "notes": "An intimate portrait of coastal life and change.",
        "status": "want_to_read",
        "first_published": "2018",
        "publisher": "Field Notes",
        "cover_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "The Lantern Keeper",
        "author": "Priya Nair",
        "notes": "A gentle fantasy about keeping light alive in dark seasons.",
        "status": "completed",
        "first_published": "2020",
        "publisher": "Cedar & Ink",
        "cover_url": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "Winter at Bracken House",
        "author": "Liam Hart",
        "notes": "A cozy historical drama with a strong sense of place.",
        "status": "want_to_read",
        "first_published": "2016",
        "publisher": "Willow Lane",
        "cover_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "Echoes of the Harbor",
        "author": "Sofia Kim",
        "notes": "A lyrical story about family and the sea.",
        "status": "completed",
        "first_published": "2023",
        "publisher": "Tide & Thorn",
        "cover_url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "Paper Maps",
        "author": "Jonas Reed",
        "notes": "A thoughtful coming-of-age novel about finding your path.",
        "status": "want_to_read",
        "first_published": "2015",
        "publisher": "Morrow & Co.",
        "cover_url": "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=600",
    },
    {
        "title": "The Last Ember",
        "author": "Ava Mercer",
        "notes": "A hopeful fantasy about rebuilding after loss.",
        "status": "completed",
        "first_published": "2024",
        "publisher": "Emberlight Press",
        "cover_url": "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=600",
    },
]


def seed_books():
    with app.app_context():
        db.create_all()

        user = User.query.get(1)
        if not user:
            user = User(
                id=1,
                username="demo",
                email="demo@example.com",
                password_hash=Bcrypt().generate_password_hash("demo123").decode("utf-8"),
            )
            db.session.add(user)
            db.session.flush()

        shelf = Shelf.query.filter_by(user_id=user.id).first()
        if not shelf:
            shelf = Shelf(name="Seeded Shelf", description="Books added by the seed script", user_id=user.id)
            db.session.add(shelf)
            db.session.flush()

        existing_titles = {book.title.lower() for book in Book.query.filter_by(user_id=user.id).all()}

        for entry in BOOKS_TO_SEED:
            if entry["title"].lower() in existing_titles:
                continue

            book = Book(
                title=entry["title"],
                author=entry["author"],
                notes=entry["notes"],
                status=entry["status"],
                first_published=entry["first_published"],
                publisher=entry["publisher"],
                cover_url=entry["cover_url"],
                user_id=user.id,
                shelf_id=shelf.id,
            )
            db.session.add(book)

        db.session.commit()
        print(f"Seeded {len(BOOKS_TO_SEED)} books for demo user.")


if __name__ == "__main__":
    seed_books()
