from flask_bcrypt import Bcrypt
from app import app
from models import db, User, Shelf, Book


BOOKS_TO_SEED = [
    {
        "title": "Crimson Horizon",
        "author": "Ella Dawson",
        "notes": "An epic tale of survival across endless deserts.",
        "status": "completed",
        "first_published": "2018",
        "publisher": "Silver Oak Press",
        "cover_url": "https://picsum.photos/seed/book1/600/900",
    },
    {
        "title": "Beneath the Willow",
        "author": "James Porter",
        "notes": "A heartfelt story of friendship and forgiveness.",
        "status": "want_to_read",
        "first_published": "2020",
        "publisher": "Green Leaf Publishing",
        "cover_url": "https://picsum.photos/seed/book2/600/900",
    },
    {
        "title": "City of Echoes",
        "author": "Rachel Kim",
        "notes": "A detective uncovers secrets hidden beneath a modern city.",
        "status": "reading",
        "first_published": "2021",
        "publisher": "Urban House",
        "cover_url": "https://picsum.photos/seed/book3/600/900",
    },
    {
        "title": "Hidden Currents",
        "author": "Noah Bennett",
        "notes": "A thrilling maritime mystery.",
        "status": "completed",
        "first_published": "2017",
        "publisher": "Blue Ocean Press",
        "cover_url": "https://picsum.photos/seed/book4/600/900",
    },
    {
        "title": "The Sapphire Crown",
        "author": "Emily Carter",
        "notes": "A fantasy kingdom fights for its future.",
        "status": "want_to_read",
        "first_published": "2022",
        "publisher": "Dragon Ink",
        "cover_url": "https://picsum.photos/seed/book5/600/900",
    },
    {
        "title": "Morning Rain",
        "author": "Daniel Foster",
        "notes": "A quiet romance set in rural England.",
        "status": "reading",
        "first_published": "2016",
        "publisher": "Meadow Books",
        "cover_url": "https://picsum.photos/seed/book6/600/900",
    },
    {
        "title": "Beyond the Summit",
        "author": "Sarah Collins",
        "notes": "Mountaineers face impossible odds.",
        "status": "completed",
        "first_published": "2019",
        "publisher": "Peak Publishing",
        "cover_url": "https://picsum.photos/seed/book7/600/900",
    },
    {
        "title": "Forgotten Stars",
        "author": "Oliver Grant",
        "notes": "A science fiction journey through distant galaxies.",
        "status": "want_to_read",
        "first_published": "2023",
        "publisher": "Nova Books",
        "cover_url": "https://picsum.photos/seed/book8/600/900",
    },
    {
        "title": "The Golden Harbor",
        "author": "Victoria Lane",
        "notes": "A historical fiction novel set in the 1800s.",
        "status": "reading",
        "first_published": "2015",
        "publisher": "Heritage Press",
        "cover_url": "https://picsum.photos/seed/book9/600/900",
    },
    {
        "title": "Silent Footsteps",
        "author": "Nathan Brooks",
        "notes": "A suspense novel full of unexpected twists.",
        "status": "completed",
        "first_published": "2021",
        "publisher": "Shadow House",
        "cover_url": "https://picsum.photos/seed/book10/600/900",
    },
    {
        "title": "Wildfire Dreams",
        "author": "Grace Morgan",
        "notes": "A coming-of-age story in the American West.",
        "status": "want_to_read",
        "first_published": "2018",
        "publisher": "Prairie Books",
        "cover_url": "https://picsum.photos/seed/book11/600/900",
    },
    {
        "title": "The Crystal Key",
        "author": "Henry Walker",
        "notes": "Magic and mystery collide.",
        "status": "reading",
        "first_published": "2024",
        "publisher": "Fantasy Forge",
        "cover_url": "https://picsum.photos/seed/book12/600/900",
    },
    {
        "title": "Autumn Letters",
        "author": "Lucy Green",
        "notes": "A touching novel told through handwritten letters.",
        "status": "completed",
        "first_published": "2019",
        "publisher": "Maple Press",
        "cover_url": "https://picsum.photos/seed/book13/600/900",
    },
    {
        "title": "The Seventh Voyage",
        "author": "Michael Rivers",
        "notes": "Adventure across dangerous seas.",
        "status": "want_to_read",
        "first_published": "2017",
        "publisher": "Anchor Books",
        "cover_url": "https://picsum.photos/seed/book14/600/900",
    },
    {
        "title": "Broken Compass",
        "author": "Anna Price",
        "notes": "Finding purpose after loss.",
        "status": "reading",
        "first_published": "2020",
        "publisher": "Journey Press",
        "cover_url": "https://picsum.photos/seed/book15/600/900",
    },
    {
        "title": "Velvet Moon",
        "author": "Sophia Reed",
        "notes": "Romance beneath the stars.",
        "status": "completed",
        "first_published": "2022",
        "publisher": "Moonlight Publishing",
        "cover_url": "https://picsum.photos/seed/book16/600/900",
    },
    {
        "title": "Iron Forest",
        "author": "Logan Hughes",
        "notes": "A futuristic eco-thriller.",
        "status": "want_to_read",
        "first_published": "2023",
        "publisher": "Steel Leaf",
        "cover_url": "https://picsum.photos/seed/book17/600/900",
    },
    {
        "title": "The Painter's Secret",
        "author": "Megan Scott",
        "notes": "An artist discovers hidden messages in old paintings.",
        "status": "reading",
        "first_published": "2018",
        "publisher": "Canvas Press",
        "cover_url": "https://picsum.photos/seed/book18/600/900",
    },
    {
        "title": "Riverstone",
        "author": "Peter Long",
        "notes": "A family saga spanning generations.",
        "status": "completed",
        "first_published": "2016",
        "publisher": "Stonebridge Books",
        "cover_url": "https://picsum.photos/seed/book19/600/900",
    },
    {
        "title": "The Hidden Village",
        "author": "Olivia Young",
        "notes": "A mystery hidden deep in the mountains.",
        "status": "want_to_read",
        "first_published": "2021",
        "publisher": "Pine Hill Press",
        "cover_url": "https://picsum.photos/seed/book20/600/900",
    },
    {
        "title": "Fading Embers",
        "author": "Ryan Adams",
        "notes": "Hope rises from tragedy.",
        "status": "reading",
        "first_published": "2017",
        "publisher": "Ashwood Books",
        "cover_url": "https://picsum.photos/seed/book21/600/900",
    },
    {
        "title": "Moonlit Trail",
        "author": "Emma Foster",
        "notes": "A suspenseful camping adventure.",
        "status": "completed",
        "first_published": "2019",
        "publisher": "Forest House",
        "cover_url": "https://picsum.photos/seed/book22/600/900",
    },
    {
        "title": "The Silver Feather",
        "author": "Aaron White",
        "notes": "Fantasy meets folklore.",
        "status": "want_to_read",
        "first_published": "2020",
        "publisher": "Legend Press",
        "cover_url": "https://picsum.photos/seed/book23/600/900",
    },
    {
        "title": "Northern Lights",
        "author": "Isabella Moore",
        "notes": "Love blossoms under Arctic skies.",
        "status": "reading",
        "first_published": "2022",
        "publisher": "Aurora Books",
        "cover_url": "https://picsum.photos/seed/book24/600/900",
    },
    {
        "title": "The Clockmaker",
        "author": "Benjamin Hall",
        "notes": "A mystery built around an ancient clock.",
        "status": "completed",
        "first_published": "2015",
        "publisher": "Timeless Press",
        "cover_url": "https://picsum.photos/seed/book25/600/900",
    },
    {
        "title": "Echo Mountain",
        "author": "Charlotte Evans",
        "notes": "Nature reveals long-buried secrets.",
        "status": "want_to_read",
        "first_published": "2021",
        "publisher": "Evergreen House",
        "cover_url": "https://picsum.photos/seed/book26/600/900",
    },
    {
        "title": "Storm Chaser",
        "author": "Jason Bell",
        "notes": "Scientists race against powerful hurricanes.",
        "status": "reading",
        "first_published": "2019",
        "publisher": "Skyline Press",
        "cover_url": "https://picsum.photos/seed/book27/600/900",
    },
    {
        "title": "The Last Symphony",
        "author": "Natalie King",
        "notes": "Music changes lives forever.",
        "status": "completed",
        "first_published": "2018",
        "publisher": "Harmony Books",
        "cover_url": "https://picsum.photos/seed/book28/600/900",
    },
    {
        "title": "Whispering Pines",
        "author": "Ethan Lewis",
        "notes": "A chilling mystery in the woods.",
        "status": "want_to_read",
        "first_published": "2024",
        "publisher": "Pinecone Press",
        "cover_url": "https://picsum.photos/seed/book29/600/900",
    },
    {
        "title": "Sunrise Harbor",
        "author": "Lily Turner",
        "notes": "A seaside romance with unforgettable characters.",
        "status": "completed",
        "first_published": "2023",
        "publisher": "Coastal Reads",
        "cover_url": "https://picsum.photos/seed/book30/600/900",
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
