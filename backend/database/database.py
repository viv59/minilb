from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # local dev fallback only - never used in production once
    # DATABASE_URL is set on Render
    DATABASE_URL = "sqlite:///./dev.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Render/Neon Postgres URLs sometimes come as "postgres://" - SQLAlchemy
    # needs "postgresql://" explicitly
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _bootstrap():
    """
    Runs once, when this module is first imported: creates all tables
    and seeds the default admin if one doesn't exist yet.

    Imports below are deliberately deferred to inside this function,
    not the top of the file - models/db_model.py does
    `from database.database import Base`, so importing it before Base
    is defined here would be a circular import. By this point in the
    file, Base already exists, so the circular reference resolves fine.
    """
    from models import db_model  # noqa: F401 - import registers models on Base.metadata
    from core.bootstrap import create_default_admin

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        create_default_admin(db)
    finally:
        db.close()


_bootstrap()