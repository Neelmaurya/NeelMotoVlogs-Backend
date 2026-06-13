# 🏍️ Neel MotoVlogs — AI-Powered Travel Creator Platform

A fully open-source, AI-powered platform built for motorcycle travel vloggers and bloggers. Features a FastAPI backend, a Next.js frontend, AI Bike Reviews, an AI Route Planner, and a full CMS dashboard.

---

## 🌐 Live Deployment

| Service    | Platform | URL                                               |
|------------|----------|---------------------------------------------------|
| Frontend   | Vercel   | [neelmotovlogs.vercel.app](https://neelmotovlogs.vercel.app) |
| Backend API | Railway  | [neelmotovlogs-production.up.railway.app](https://neelmotovlogs-production.up.railway.app) |
| API Docs   | Railway  | [/docs](https://neelmotovlogs-production.up.railway.app/docs) |
| Admin Panel | Railway  | [/admin](https://neelmotovlogs-production.up.railway.app/admin) |

---

## ✨ Features

- ✅ **Personal Brand Website** — Premium dark-mode design with animations.
- ✅ **AI Bike Review Generator** — Auto-generates in-depth bike reviews using Wikipedia, Reddit, YouTube transcripts, and Groq AI.
- ✅ **AI Route Planner** — Intelligent moto-trip route generator with real-time weather, AQI, emergency info, and photography spots.
- ✅ **Blog System** — Full CMS with rich text editor, SEO metadata, categories, and tags.
- ✅ **Video Management** — YouTube integration with auto-fetching of video metadata.
- ✅ **Destination System** — Hierarchical Country → State → City structure.
- ✅ **Authentication** — JWT-based Login/Signup with role-based access control.
- ✅ **CMS Dashboard** — Analytics and full content management interface.
- ✅ **Image Proxy** — Secure server-side proxy for external bike images.
- ✅ **SQLAdmin Panel** — Backend admin UI for managing users, blogs, videos, and destinations.

---

## 🏗️ Tech Stack

### Frontend
| Technology          | Purpose                                |
|---------------------|----------------------------------------|
| **Next.js 16**      | Framework, SSR, file-based routing     |
| **React 19**        | UI component library                   |
| **Tailwind CSS 4**  | Utility-first styling                  |
| **Framer Motion**   | Animations and page transitions        |
| **Redux Toolkit**   | Global state management                |
| **Axios**           | HTTP client                            |
| **React Hook Form** | Form state management                  |
| **Zod**             | Schema validation                      |
| **Lucide React**    | Icon library                           |
| **js-cookie**       | Cookie management for JWT tokens       |

### Backend
| Technology            | Purpose                                    |
|-----------------------|--------------------------------------------|
| **FastAPI**           | Async REST API framework                   |
| **SQLAlchemy**        | ORM for database models                    |
| **PostgreSQL**        | Production relational database             |
| **Redis**             | Caching layer for API responses            |
| **Pydantic**          | Data validation and settings management    |
| **python-jose**       | JWT token generation and verification      |
| **Passlib (bcrypt)**  | Password hashing                           |
| **SQLAdmin**          | Admin panel UI                             |
| **Groq AI**           | LLM API for generating AI reviews/routes   |
| **BeautifulSoup4**    | Wikipedia web scraping                     |
| **PRAW (Reddit)**     | Reddit API for owner opinions              |
| **youtube-transcript-api** | YouTube transcript fetching          |
| **Pillow / OpenCV**   | Image processing                           |
| **uvicorn**           | ASGI server                                |

### Infrastructure
| Component       | Platform              |
|-----------------|-----------------------|
| Frontend hosting | **Vercel**           |
| Backend hosting  | **Railway**          |
| Database         | **Railway PostgreSQL** |
| Cache            | **Railway Redis**    |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Python 3.12+**
- **Node.js 20+**
- **PostgreSQL** running locally (or use the Docker Compose setup)
- **Redis** running locally (or use the Docker Compose setup)

### Option A — Docker Compose (Recommended)
Spin up the backend, PostgreSQL, and Redis together:

```bash
docker-compose up --build
```

Then separately start the frontend:
```bash
cd frontend
npm install
npm run dev
```

### Option B — Manual Setup

#### Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# PowerShell
.\venv\Scripts\Activate.ps1

# Git Bash / MINGW64
source venv/Scripts/activate

# CMD
.\venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Set local environment variable
# Create frontend/.env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

### Admin Access (Local)
| Field    | Value                       |
|----------|-----------------------------|
| URL      | `http://localhost:8000/admin` |
| Email    | `admin@neelmotovlogs.com`   |
| Password | `adminpassword`             |

> ⚠️ **Important**: Run `python seed_admin.py` from the `backend` directory to create the admin user on first setup.

---

## 📦 Environment Variables

### Backend (`backend/.env`)

| Variable            | Description                                |
|---------------------|--------------------------------------------|
| `SECRET_KEY`        | JWT secret key                             |
| `DB_NAME`           | PostgreSQL database name                   |
| `DB_USER`           | PostgreSQL username                        |
| `DB_PASSWORD`       | PostgreSQL password                        |
| `DB_HOST`           | PostgreSQL host                            |
| `DB_PORT`           | PostgreSQL port                            |
| `REDIS_URL`         | Redis connection URL                       |
| `GROQ_API_KEY`      | Groq AI API key for review generation      |
| `YOUTUBE_API_KEY`   | YouTube Data API v3 key                    |
| `REDDIT_CLIENT_ID`  | Reddit app client ID                       |
| `REDDIT_CLIENT_SECRET` | Reddit app client secret              |
| `OPENWEATHER_API_KEY` | OpenWeather API key (optional)          |
| `ORS_API_KEY`       | OpenRouteService key for route planning (optional) |
| `OPENAQ_API_KEY`    | OpenAQ key for AQI data (optional)         |

### Frontend (`frontend/.env.production`)

| Variable              | Description                                |
|-----------------------|--------------------------------------------|
| `NEXT_PUBLIC_API_URL` | Full URL to the backend API (e.g., `https://neelmotovlogs-production.up.railway.app/api`) |

---

## 🤖 AI Bike Review Module Architecture

The Bike Review system uses asynchronous task processing and multiple data sources to generate comprehensive AI-driven reviews.

### Backend Process
1. **`POST /api/ai-reviews/generate/`** — Checks the database cache first. If not cached, spawns a FastAPI `BackgroundTask` and returns a `job_id` immediately.
2. **Background Pipeline** — Concurrently scrapes Wikipedia (specs/images), Reddit (owner opinions), and YouTube (transcript reviews) using `asyncio.gather()` and a `ThreadPoolExecutor`.
3. **Groq AI** — The aggregated raw data is sent to Groq's LLM to produce structured JSON (scores, pros/cons, specs, verdict).
4. **`GET /api/ai-reviews/status/{job_id}`** — The client polls this endpoint every 4 seconds until status is `completed` or `failed`.

### Frontend Process
1. User types a bike name and clicks **Generate**.
2. `useBikeReview.ts` hook calls the generate endpoint. If `status: cached`, shows the review instantly. If `status: generating`, initiates polling.
3. `LoadingScreen` component cycles through messages ("Fetching bike specs...", "Searching Reddit...") while waiting.
4. On `status: completed`, Framer Motion animates in the full review page.

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

## 🧩 Packages & Modules Summary

### Frontend
- **Framework & Core:** `next`, `react`, `react-dom`
- **State Management:** `@reduxjs/toolkit`, `react-redux`
- **Styling & UI:** `tailwindcss`, `framer-motion`, `clsx`, `tailwind-merge`, `lucide-react`
- **Forms & Validation:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **HTTP Client:** `axios`
- **Utilities:** `date-fns`, `js-cookie`, `nprogress`

### Backend
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

## 💬 Tech Stack Decision Q&A

**Q: Why Next.js over vanilla React?**
Next.js provides SSR and SSG which are critical for SEO in a blog/vlog platform. It also offers built-in routing, image optimization, and better first-page load performance.

**Q: Why FastAPI instead of Django?**
FastAPI is built on ASGI and uses async programming, making it incredibly fast for high concurrent loads. It provides automatic Swagger docs and seamless Pydantic validation, speeding up development significantly.

**Q: Why Redux Toolkit over React Context?**
A CMS platform handles complex global states (user sessions, draft saving, video statuses). Redux Toolkit provides a scalable, structured approach with built-in optimizations to prevent unnecessary re-renders.

**Q: Why combine Tailwind CSS with Framer Motion?**
Tailwind enables rapid utility-first UI development. Framer Motion adds declarative, physics-based animations that Tailwind alone cannot provide, creating a premium interactive experience.

**Q: Why SQLAlchemy?**
SQLAlchemy is database-agnostic, flexible, and supports complex queries and relationships (Country → State → City). It allows seamless switching between SQLite (dev) and PostgreSQL (production).

**Q: Why Zod with React Hook Form?**
React Hook Form manages form state efficiently with minimal re-renders. Zod defines strict validation schemas, catching errors client-side before they ever reach the API.

**Q: Why Groq AI for the review generator?**
Groq provides extremely fast inference (tokens per second) for LLM-based structured JSON generation, which is critical for a good user experience when generating bike reviews in near real-time.

---

## 📄 License

Open Source — MIT License
