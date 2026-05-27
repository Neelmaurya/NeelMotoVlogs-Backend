from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User, UserRole
from auth_utils import verify_password

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        email, password = form.get("username"), form.get("password")

        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            if user and verify_password(password, user.hashed_password):
                if user.role == UserRole.ADMIN or user.is_superuser:
                    request.session.update({"token": email})
                    return True
            return False
        finally:
            db.close()

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        if not token:
            return False
        return True

from config import settings

authentication_backend = AdminAuth(secret_key=settings.SECRET_KEY)
