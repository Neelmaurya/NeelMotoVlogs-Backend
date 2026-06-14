# 🏍️ NeelMotoVlogs — Backend API

A high-performance **FastAPI** backend powering the Neel MotoVlogs platform — an AI-powered travel creator platform for motorcycle vloggers and bloggers.

> 🔗 **Frontend Repo**: [NeelMotoVlogs-Frontend](https://github.com/Neelmaurya/NeelMotoVlogs-Frontend)

---

## 🌐 Live Deployment

| Service     | Platform | URL                                                                                           |
|-------------|----------|-----------------------------------------------------------------------------------------------|
| Backend API | Railway  | [neelmotovlogs-production.up.railway.app](https://neelmotovlogs-production.up.railway.app)   |
| API Docs    | Railway  | [/docs](https://neelmotovlogs-production.up.railway.app/docs)                                 |
| Admin Panel | Railway  | [/admin](https://neelmotovlogs-production.up.railway.app/admin)                               |
| Frontend    | Vercel   | [neelmotovlogs.vercel.app](https://neelmotovlogs.vercel.app)                                  |

---

## ✨ Backend Features

- ✅ **AI Bike Review Generator** — Auto-generates in-depth bike reviews using Wikipedia, Reddit, YouTube transcripts, and Groq AI.
- ✅ **AI Route Planner** — Intelligent moto-trip route generator with real-time weather, AQI, emergency info, and photography spots.
- ✅ **Blog CMS API** — Full REST API with rich text, SEO metadata, categories, and tags.
- ✅ **Video Management** — YouTube integration with auto-fetching of video metadata.
- ✅ **Destination System** — Hierarchical Country → State → City structure.
- ✅ **JWT Authentication** — Login/Signup with role-based access control.
- ✅ **Dashboard Analytics** — Stats and content management endpoints.
- ✅ **Image Proxy** — Secure server-side proxy for external bike images.
- ✅ **SQLAdmin Panel** — Backend admin UI for managing users, blogs, videos, and destinations.
- ✅ **Redis Caching** — Fast caching layer for API responses.

---

## 🏗️ Tech Stack

| Technology                  | Purpose                                    |
|-----------------------------|--------------------------------------------|
| **FastAPI**                 | Async REST API framework                   |
| **SQLAlchemy**              | ORM for database models                    |
| **PostgreSQL**              | Production relational database             |
| **Redis**                   | Caching layer for API responses            |
| **Pydantic**                | Data validation and settings management    |
| **python-jose**             | JWT token generation and verification      |
| **Passlib (bcrypt)**        | Password hashing                           |
| **SQLAdmin**                | Admin panel UI                             |
| **Groq AI**                 | LLM API for generating AI reviews/routes   |
| **BeautifulSoup4**          | Wikipedia web scraping                     |
| **PRAW (Reddit)**           | Reddit API for owner opinions              |
| **youtube-transcript-api**  | YouTube transcript fetching                |
| **Pillow / OpenCV**         | Image processing                           |
| **uvicorn**                 | ASGI server                                |

### Infrastructure

| Component         | Platform               |
|-------------------|------------------------|
| Backend hosting   | **Railway**            |
| Database          | **Railway PostgreSQL** |
| Cache             | **Railway Redis**      |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Python 3.12+**
- **PostgreSQL** running locally (or use the Docker Compose setup)
- **Redis** running locally (or use the Docker Compose setup)

### Option A — Docker Compose (Recommended)

Spin up the backend, PostgreSQL, and Redis together:

```bash
docker-compose up --build
```

### Option B — Manual Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# PowerShell
.\\venv\\Scripts\\Activate.ps1

# Git Bash / MINGW64
source venv/Scripts/activate

# CMD
.\\venv\\Scripts\\activate.bat

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload
```

### Admin Access (Local)

| Field    | Value                         |
|----------|-------------------------------|
| URL      | `http://localhost:8000/admin` |
| Email    | `admin@neelmotovlogs.com`     |
| Password | `adminpassword`               |

> ⚠️ **Important**: Run `python seed_admin.py` from the `backend/` directory to create the admin user on first setup.

---

## 📦 Environment Variables

### `backend/.env`

| Variable                  | Description                                            |
|---------------------------|--------------------------------------------------------|
| `SECRET_KEY`              | JWT secret key                                         |
| `DB_NAME`                 | PostgreSQL database name                               |
| `DB_USER`                 | PostgreSQL username                                    |
| `DB_PASSWORD`             | PostgreSQL password                                    |
| `DB_HOST`                 | PostgreSQL host                                        |
| `DB_PORT`                 | PostgreSQL port                                        |
| `REDIS_URL`               | Redis connection URL                                   |
| `GROQ_API_KEY`            | Groq AI API key for review generation                  |
| `YOUTUBE_API_KEY`         | YouTube Data API v3 key                                |
| `REDDIT_CLIENT_ID`        | Reddit app client ID                                   |
| `REDDIT_CLIENT_SECRET`    | Reddit app client secret                               |
| `OPENWEATHER_API_KEY`     | OpenWeather API key (optional)                         |
| `ORS_API_KEY`             | OpenRouteService key for route planning (optional)     |
| `OPENAQ_API_KEY`          | OpenAQ key for AQI data (optional)                     |

---

## 🤖 AI Bike Review Module Architecture

The Bike Review system uses asynchronous task processing and multiple data sources.

### Backend Process
1. **`POST /api/ai-reviews/generate/`** — Checks the database cache first. If not cached, spawns a FastAPI `BackgroundTask` and returns a `job_id` immediately.
2. **Background Pipeline** — Concurrently scrapes Wikipedia (specs/images), Reddit (owner opinions), and YouTube (transcript reviews) using `asyncio.gather()` and a `ThreadPoolExecutor`.
3. **Groq AI** — The aggregated raw data is sent to Groq's LLM to produce structured JSON (scores, pros/cons, specs, verdict).
4. **`GET /api/ai-reviews/status/{job_id}`** — The client polls this endpoint every 4 seconds until status is `completed` or `failed`.

---

## 🗺️ AI Route Planner Module Architecture

The Route Planner generates intelligent, data-rich moto-trip itineraries.

### Backend Process
1. **`POST /api/routes/generate/`** — Accepts source, destination, transport mode, and user preferences. Checks cache first, then spawns a background job.
2. **Background Pipeline** — Concurrently fetches:
   - **Route geometry** from OSRM / OpenRouteService
   - **Weather data** from OpenWeatherMap
   - **AQI data** from OpenAQ / OpenWeatherMap fallback
   - **Places** (hotels, fuel stations, hospitals) from OpenStreetMap Nominatim
   - **Emergency info** scraped from Wikipedia
3. **Groq AI** — Generates a day-by-day itinerary, packing list, and travel tips from the aggregated data.
4. **`GET /api/routes/status/{job_id}`** — Polled by the frontend every 3 seconds.

---

## 🧩 Packages & Modules

- **Web Framework & Server:** `fastapi`, `uvicorn`, `starlette`
- **Database & ORM:** `sqlalchemy`, `psycopg2-binary`
- **Data Validation:** `pydantic`, `pydantic-settings`
- **Authentication & Security:** `python-jose`, `passlib`, `bcrypt`
- **Admin Panel:** `sqladmin`
- **Caching:** `redis`
- **AI & NLP:** `groq`, `youtube-transcript-api`, `vaderSentiment`
- **Web Scraping / Requests:** `beautifulsoup4`, `requests`, `praw`
- **Media & Processing:** `yt-dlp`, `openai-whisper`, `ffmpeg-python`, `opencv-python`, `pillow`

---

## 📄 License

Open Source — MIT License
