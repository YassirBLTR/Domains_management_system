"""
Script to create all database tables.
Run this before init_data.py
"""
from app.db.session import engine
from app.db.base import Base


def main():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ All tables created successfully!")


if __name__ == "__main__":
    main()
