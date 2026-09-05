import os
from sqlalchemy.orm import Session

from models.db_model import User, UserRole
from core.security import hash_password


def create_default_admin(db: Session):
    """
    Ensures exactly one admin account exists, seeded from environment
    variables. Safe to call on every startup - if an admin with this
    email already exists, this is a no-op. Never overwrites an existing
    password (so changing the .env value later doesn't silently reset
    a real admin's credentials on the next deploy).
    """
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_name = os.getenv("ADMIN_NAME", "Admin")

    if not admin_email or not admin_password:
        # no admin credentials configured - skip silently rather than
        # crashing startup, since this might be a local dev run where
        # you're seeding an admin manually instead
        return

    existing = db.query(User).filter(User.email == admin_email).first()
    if existing:
        # already exists - don't touch it, even if role/password env
        # vars changed since. Promotion/rotation should be a deliberate
        # separate action, not an automatic side effect of every restart.
        return

    admin = User(
        name=admin_name,
        email=admin_email,
        hashed_password=hash_password(admin_password),
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.commit()
    print(f"[bootstrap] Created default admin user: {admin_email}")