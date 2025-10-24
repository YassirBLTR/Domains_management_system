"""
Script to initialize the database with default data.
Run this after creating the database tables.
"""
from app.db.session import SessionLocal
from app.db.init_db import init_db


def main():
    db = SessionLocal()
    try:
        print("Initializing database with default data...")
        init_db(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
