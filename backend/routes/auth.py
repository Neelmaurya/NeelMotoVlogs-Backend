from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models import User
from schemas.user import UserCreate, User as UserSchema, Token
from schemas.auth import LoginRequest
from auth_utils import verify_password, get_password_hash, create_access_token
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        bio=user.bio
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    # For now, we use the same token as refresh to keep it simple and compatible
    return {
        "access_token": access_token, 
        "access": access_token, 
        "refresh_token": access_token,
        "refresh": access_token,
        "token_type": "bearer"
    }

@router.post("/refresh/", response_model=Token)
def refresh_token(db: Session = Depends(get_db)):
    # This is a placeholder for a real refresh logic
    # In a real app, you would verify the refresh token from the request
    # For now, we just return a 401 if they hit this, or return a new token
    raise HTTPException(status_code=401, detail="Refresh logic not implemented, please login again")
