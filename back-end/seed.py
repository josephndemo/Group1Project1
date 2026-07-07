from flask_bcrypt import Bcrypt
from sqlalchemy import text
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
    {
        "title": "Glass Lantern",
        "author": "Mira Bennett",
        "notes": "A journalist uncovers a forgotten city archive.",
        "status": "want_to_read",
        "first_published": "2021",
        "publisher": "North Star House",
        "cover_url": "https://picsum.photos/seed/book31/600/900",
    },
    {
        "title": "Marble Sky",
        "author": "Julian Park",
        "notes": "Artists and engineers race to rebuild a floating theater.",
        "status": "reading",
        "first_published": "2020",
        "publisher": "Harborline Press",
        "cover_url": "https://picsum.photos/seed/book32/600/900",
    },
    {
        "title": "The Ink Garden",
        "author": "Sofia Calder",
        "notes": "Letters planted in a garden bloom into old family secrets.",
        "status": "completed",
        "first_published": "2019",
        "publisher": "Juniper Books",
        "cover_url": "https://picsum.photos/seed/book33/600/900",
    },
    {
        "title": "Harbor of Moths",
        "author": "Gideon Lee",
        "notes": "A night ferry pilot follows mysterious light trails.",
        "status": "want_to_read",
        "first_published": "2024",
        "publisher": "Midnight Quill",
        "cover_url": "https://picsum.photos/seed/book34/600/900",
    },
    {
        "title": "Wild Mint Station",
        "author": "Nora Hale",
        "notes": "A chef opens a kitchen inside an abandoned train station.",
        "status": "reading",
        "first_published": "2018",
        "publisher": "Copper Pine",
        "cover_url": "https://picsum.photos/seed/book35/600/900",
    },
    {
        "title": "Paper Comet",
        "author": "Arun Malik",
        "notes": "Teen inventors launch a handmade observatory in the hills.",
        "status": "completed",
        "first_published": "2022",
        "publisher": "Skytrace Publishing",
        "cover_url": "https://picsum.photos/seed/book36/600/900",
    },
    {
        "title": "The Cobalt Reef",
        "author": "Lena Ortiz",
        "notes": "Marine biologists protect a reef tied to local folklore.",
        "status": "want_to_read",
        "first_published": "2017",
        "publisher": "Blue Current",
        "cover_url": "https://picsum.photos/seed/book37/600/900",
    },
    {
        "title": "Quiet Signal",
        "author": "Tobias Crane",
        "notes": "A radio hobbyist receives messages from a vanished expedition.",
        "status": "reading",
        "first_published": "2023",
        "publisher": "Signal House",
        "cover_url": "https://picsum.photos/seed/book38/600/900",
    },
    {
        "title": "Velvet Atlas",
        "author": "Priya Shah",
        "notes": "A cartographer maps dreams that start appearing in real life.",
        "status": "completed",
        "first_published": "2021",
        "publisher": "Golden Meridian",
        "cover_url": "https://picsum.photos/seed/book39/600/900",
    },
    {
        "title": "Lanterns at Noon",
        "author": "Elliot Marsh",
        "notes": "A village festival sparks an unexpected political uprising.",
        "status": "want_to_read",
        "first_published": "2016",
        "publisher": "Cedar Crown",
        "cover_url": "https://picsum.photos/seed/book40/600/900",
    },
    {
        "title": "Stonebird",
        "author": "Camila Dorsey",
        "notes": "An archaeologist deciphers songs carved in mountain stone.",
        "status": "reading",
        "first_published": "2019",
        "publisher": "Ridgeway Editions",
        "cover_url": "https://picsum.photos/seed/book41/600/900",
    },
    {
        "title": "The Orchard Cipher",
        "author": "Reed Lawson",
        "notes": "A hidden code in orchard ledgers leads to missing heirlooms.",
        "status": "completed",
        "first_published": "2020",
        "publisher": "Maple Ridge Press",
        "cover_url": "https://picsum.photos/seed/book42/600/900",
    },
    {
        "title": "Hollow Current",
        "author": "Amara Finch",
        "notes": "River divers chase relics through dangerous underground streams.",
        "status": "want_to_read",
        "first_published": "2022",
        "publisher": "Driftline Books",
        "cover_url": "https://picsum.photos/seed/book43/600/900",
    },
    {
        "title": "Salt & Stardust",
        "author": "Bennett Quill",
        "notes": "A baker and astronomer collaborate during a meteor season.",
        "status": "reading",
        "first_published": "2024",
        "publisher": "Moonbay Press",
        "cover_url": "https://picsum.photos/seed/book44/600/900",
    },
    {
        "title": "Crane Street Radio",
        "author": "Delia Monroe",
        "notes": "Late-night callers reveal clues to a decades-old mystery.",
        "status": "completed",
        "first_published": "2018",
        "publisher": "Evening Hour",
        "cover_url": "https://picsum.photos/seed/book45/600/900",
    },
    {
        "title": "The Amber Tides",
        "author": "Hugo Vance",
        "notes": "A coastal town tracks glowing tides tied to lost ships.",
        "status": "want_to_read",
        "first_published": "2017",
        "publisher": "Breakwater Books",
        "cover_url": "https://picsum.photos/seed/book46/600/900",
    },
    {
        "title": "Foxglove Alley",
        "author": "Ivy Rowan",
        "notes": "Neighbors on one street become unlikely detectives.",
        "status": "reading",
        "first_published": "2021",
        "publisher": "Garden Gate Press",
        "cover_url": "https://picsum.photos/seed/book47/600/900",
    },
    {
        "title": "The Longest Dawn",
        "author": "Marcus Vale",
        "notes": "A mountain rescue team endures a day that never seems to end.",
        "status": "completed",
        "first_published": "2023",
        "publisher": "Summit Line",
        "cover_url": "https://picsum.photos/seed/book48/600/900",
    },
    {
        "title": "Winterglass",
        "author": "Naomi Pierce",
        "notes": "A sculptor crafts ice monuments that predict coming events.",
        "status": "want_to_read",
        "first_published": "2020",
        "publisher": "Frost & Finch",
        "cover_url": "https://picsum.photos/seed/book49/600/900",
    },
    {
        "title": "Thread of Thunder",
        "author": "Owen Kade",
        "notes": "A tailor discovers a fabric that carries electric memory.",
        "status": "reading",
        "first_published": "2022",
        "publisher": "Stormbound Press",
        "cover_url": "https://picsum.photos/seed/book50/600/900",
    },
]


USERS_TO_SEED = [
    {"username": "josephndemo", "email": "joseph.ndemo@example.com", "password": "password123"},
    {"username": "markwarunge", "email": "mark.warunge@example.com", "password": "password123"},
    {"username": "gregorykipchumba", "email": "gregory.kipchumba@example.com", "password": "password123"},
    {"username": "abdirahmanabdisalah", "email": "abdirahman.abdisalah@example.com", "password": "password123"},
    {"username": "robertmaina", "email": "robert.maina@example.com", "password": "password123"},
    {"username": "rotichian", "email": "rotich.ian@example.com", "password": "password123"},
]


def seed_books():
    with app.app_context():
        db.create_all()

        for table_name in ["users", "shelves", "books", "reviews"]:
            db.session.execute(
                text(
                    f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), "
                    f"COALESCE((SELECT MAX(id) FROM {table_name}), 1), "
                    f"(SELECT COUNT(*) > 0 FROM {table_name}))"
                )
            )
        db.session.commit()

        admin = User.query.filter_by(username="admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                password_hash=Bcrypt().generate_password_hash("admin123").decode("utf-8"),
                role="admin",
            )
            db.session.add(admin)
            db.session.flush()

        user = User.query.filter_by(username="demo").first()
        if not user:
            user = User(
                username="demo",
                email="demo@example.com",
                password_hash=Bcrypt().generate_password_hash("demo123").decode("utf-8"),
                role="user",
            )
            db.session.add(user)
            db.session.flush()

        for entry in USERS_TO_SEED:
            existing_user = User.query.filter(
                (User.username == entry["username"]) | (User.email == entry["email"])
            ).first()
            if existing_user:
                continue

            seeded_user = User(
                username=entry["username"],
                email=entry["email"],
                password_hash=Bcrypt().generate_password_hash(entry["password"]).decode("utf-8"),
                role="user",
            )
            db.session.add(seeded_user)

        db.session.flush()

        shelf = Shelf.query.filter_by(user_id=user.id).first()
        if not shelf:
            shelf = Shelf(name="Seeded Shelf", description="Books added by the seed script", user_id=user.id)
            db.session.add(shelf)
            db.session.flush()

        existing_titles = {book.title.lower() for book in Book.query.filter_by(user_id=admin.id, shelf_id=None).all()}

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
                user_id=admin.id,
                shelf_id=None,
            )
            db.session.add(book)

        db.session.commit()


if __name__ == "__main__":
    print("Calling seed_books()")
    seed_books()
