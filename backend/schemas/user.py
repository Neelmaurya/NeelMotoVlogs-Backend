from pydantic import BaseModel, EmailStr
from typing import Optional
from models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.VIEWER
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    access: str
    refresh_token: str
    refresh: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
