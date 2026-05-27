import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models.user import User, UserRole
from auth_utils import get_password_hash

def seed_admin():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user already exists
        admin_email = "admin@neelmotovlogs.com"
        existing_user = db.query(User).filter(User.email == admin_email).first()
        
        if existing_user:
            print(f"User {admin_email} already exists.")
            return

        # Create admin user
        hashed_pw = get_password_hash("adminpassword")
        admin_user = User(
            email=admin_email,
            hashed_password=hashed_pw,
            role=UserRole.ADMIN,
            is_superuser=True,
            bio="System Administrator"
        )
        
        db.add(admin_user)
        db.commit()
        print(f"Successfully created admin user: {admin_email}")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
