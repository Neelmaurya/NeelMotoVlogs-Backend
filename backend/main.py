from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin, ModelView
from database import engine, Base
from routes import auth, users, blogs, videos, destinations, dashboard, ai_reviews, image_proxy, route_planner, auth_oauth, story
from models import User, Blog, Category, Tag, Video, Country
from admin_auth import authentication_backend
from starlette.middleware.sessions import SessionMiddleware
from config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Neel MotoVlogs API",
    description="High-performance FastAPI backend for travel creators",
    version="2.0.0"
)

# CORS Configuration — must list explicit origins when allow_credentials=True
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session Middleware (Required for SQLAdmin Auth)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Admin Panel Setup (SqlAdmin)
admin = Admin(app, engine, authentication_backend=authentication_backend)

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.role, User.is_active]
    icon = "fa-solid fa-user"

class BlogAdmin(ModelView, model=Blog):
    column_list = [Blog.id, Blog.title, Blog.status, Blog.created_at]
    icon = "fa-solid fa-blog"

class CategoryAdmin(ModelView, model=Category):
    column_list = [Category.id, Category.name, Category.slug]
    icon = "fa-solid fa-list"

class VideoAdmin(ModelView, model=Video):
    column_list = [Video.id, Video.title, Video.youtube_id]
    icon = "fa-solid fa-video"

class DestinationAdmin(ModelView, model=Country):
    column_list = [Country.id, Country.name]
    icon = "fa-solid fa-earth-americas"

admin.add_view(UserAdmin)
admin.add_view(BlogAdmin)
admin.add_view(CategoryAdmin)
admin.add_view(VideoAdmin)
admin.add_view(DestinationAdmin)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(blogs.router, prefix="/api")
app.include_router(videos.router, prefix="/api")
app.include_router(destinations.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(ai_reviews.router, prefix="/api")
app.include_router(image_proxy.router, prefix="/api")
app.include_router(route_planner.router, prefix="/api")
app.include_router(auth_oauth.router, prefix="/api")
app.include_router(story.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Neel MotoVlogs API (FastAPI Edition)"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
