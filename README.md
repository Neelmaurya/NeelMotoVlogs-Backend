# Neel_MotoVlogs - Travel Creator Platform

A fully free and open-source travel creator platform for travel vloggers and bloggers.

## Tech Stack
- **Frontend**: Next.js 15, React, Tailwind CSS, Framer Motion, Axios.
- **Backend**: FastAPI, SQLAlchemy, Pydantic, JWT (Jose), SQLAdmin, SQLite/PostgreSQL.
- **Media**: Local storage (dev), Cloud-ready structure.

## Features
- ✅ **Personal Brand Website**: Premium design with dark mode.
- ✅ **Blog System**: Rich text editor, SEO metadata, categories, tags.
- ✅ **Video Management**: YouTube integration with auto-fetching metadata.
- ✅ **Destination System**: Country -> State -> City hierarchy.
- ✅ **Authentication**: JWT Login/Signup with role-based access.
- ✅ **CMS Dashboard**: Modern analytics and content management.
- ✅ **AI-Ready Architecture**: Modular structure for future ML integrations.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Quick Start
1. **Clone the repository**
2. **Setup Backend**:
   - `cd backend`
   - `python -m venv venv`
   - **Activate Virtual Environment**:
     - *PowerShell*: `.\venv\Scripts\Activate.ps1`
     - *Git Bash / MINGW64*: `source venv/Scripts/activate`
     - *CMD*: `.\venv\Scripts\activate.bat`
   - `pip install -r requirements.txt`
   - `uvicorn main:app --reload`
3. **Setup Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

### Admin Access
- URL: `http://localhost:8000/admin`
- Email: `admin@neelmotovlogs.com`
- Password: `adminpassword`

## Packages and Modules Used

### Frontend (Next.js ecosystem)
- **Framework & Core:** `next`, `react`, `react-dom`
- **State Management:** `@reduxjs/toolkit`, `react-redux`
- **Styling & UI:** `tailwindcss`, `framer-motion`, `clsx`, `tailwind-merge`, `lucide-react`
- **Forms & Validation:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **HTTP Client:** `axios`
- **Utilities:** `date-fns`, `js-cookie`, `nprogress`

### Backend (FastAPI & Python ecosystem)
- **Web Framework & Server:** `fastapi`, `uvicorn`, `starlette`
- **Database & ORM:** `SQLAlchemy`, `alembic`, `psycopg2-binary`
- **Data Validation:** `pydantic`, `pydantic-settings`
- **Authentication & Security:** `python-jose`, `passlib`, `bcrypt`
- **Admin Panel:** `sqladmin`
- **Background Tasks & Caching:** `celery`, `redis`
- **Media & Processing:** `yt-dlp`, `openai-whisper`, `ffmpeg-python`, `opencv-python`, `pillow`
- **NLP & AI:** `spacy`, `vaderSentiment`
- **Web Scraping / Requests:** `beautifulsoup4`, `requests`

## Interview Cross-Questions and Answers (Tech Stack Decisions)

**Q1: Why did you choose Next.js over vanilla React for the frontend?**
**Answer:** Next.js provides out-of-the-box Server-Side Rendering (SSR) and Static Site Generation (SSG), which are critical for SEO in a blog/vlog platform. It also offers built-in file-system routing, image optimization, and better performance for first-page loads compared to standard client-side rendered React apps.

**Q2: Why use FastAPI instead of Django or Flask for the backend?**
**Answer:** FastAPI is built on ASGI and uses async programming, making it incredibly fast and capable of handling high concurrent loads (useful for media-heavy platforms). It also provides automatic interactive API documentation (Swagger UI) and seamless data validation using Pydantic, which significantly speeds up development and reduces bugs.

**Q3: For state management, why Redux Toolkit instead of React Context?**
**Answer:** While React Context is good for simple prop-drilling, a media/blog platform with CMS features handles complex global states (user sessions, draft saving, video processing statuses). Redux Toolkit provides a scalable, structured approach with built-in optimizations to prevent unnecessary re-renders that Context often suffers from.

**Q4: Why combine Tailwind CSS with Framer Motion?**
**Answer:** Tailwind CSS allows for rapid, utility-first UI development with a consistent design system. However, it lacks complex animation capabilities. Framer Motion bridges this gap by providing declarative, physics-based animations, allowing us to build a premium, dynamic, and interactive user experience.

**Q5: Why did you choose SQLAlchemy as your ORM?**
**Answer:** SQLAlchemy is robust, highly flexible, and supports complex queries and relationships (like Country -> State -> City hierarchies). It is database-agnostic, meaning we can easily switch between SQLite for local development and PostgreSQL for production without rewriting our data access layer.

**Q6: What is the role of Zod alongside React Hook Form?**
**Answer:** React Hook Form handles the form state and submission efficiently with minimal re-renders. Zod is a schema declaration and validation library. Together, they allow us to define strict validation rules for our inputs (e.g., strong passwords, valid URLs) and catch errors before they even reach our API, enhancing the user experience and data integrity.

**Q7: Why use Celery and Redis in the backend?**
**Answer:** The platform requires heavy background processing tasks, such as fetching YouTube metadata, transcribing audio with Whisper, or processing images/videos. Running these synchronously would block the main API threads. Celery manages these background queues, and Redis acts as the fast, in-memory message broker to coordinate them.

**Q8: Why use both Passlib (bcrypt) and python-jose?**
**Answer:** Passlib with bcrypt is used to securely hash and verify user passwords so we never store plain-text passwords in our database. `python-jose` is used to generate and decode JSON Web Tokens (JWT). JWTs are stateless and allow us to authenticate user API requests securely without maintaining session states on the server.

## AI Bike Review Module Architecture

The Bike Review system leverages asynchronous task processing and multiple data sources to generate comprehensive AI-driven reviews without blocking the user interface.

### Backend Process (FastAPI & Background Tasks)
1. **Initial Request (`POST /api/ai-reviews/generate/`)**:
   - The system first checks the `BikeReviewCache` (Database). If the review already exists, it returns immediately with `status: "cached"`.
   - If not cached, it checks if a generation job for this bike is already in progress (`GenerationJob` table) to avoid duplicate processing.
   - If no job exists, a new UUID `job_id` is generated, stored as `pending` in the database, and a FastAPI `BackgroundTask` (`run_generation_pipeline`) is triggered. The API immediately returns the `job_id` and `status: "generating"`.
2. **Background Generation Pipeline**:
   - The job status updates to `processing`.
   - `asyncio.gather()` with a `ThreadPoolExecutor` is used to scrape data concurrently from multiple sources:
     - **Wikipedia**: Fetches bike specs and images.
     - **Reddit**: Fetches real owner opinions and threads.
     - **YouTube**: Transcribes relevant video reviews using `youtube-transcript-api`.
   - The aggregated raw data is sent to the AI Model (via `services/groq_ai.py`) to generate structured JSON data (scores, pros/cons, specs, verdict).
   - Once completed, the final structured review is saved to the database cache, and the `GenerationJob` status is marked as `completed` with the result payload.
3. **Status Polling (`GET /api/ai-reviews/status/{job_id}`)**:
   - The client polls this endpoint to check the job status (`processing`, `completed`, or `failed`). If completed, it returns the final AI generated data.

### Frontend Process (Next.js & React Hooks)
1. **User Interaction (`page.tsx`)**:
   - The user enters a bike name in the search bar and clicks Generate.
2. **State Management & Polling (`useBikeReview.ts` hook)**:
   - The hook calls the `/generate/` endpoint. If the response status is `cached`, the data is immediately set into the state.
   - If the response is `generating`, the hook extracts the `job_id` and initiates a polling interval (`setInterval`).
3. **Loading State & Polling Loop**:
   - Every 4 seconds, the hook polls the `/status/{job_id}` endpoint.
   - While polling, the UI displays a `LoadingScreen` component that cycles through different loading messages ("Fetching bike specs...", "Searching Reddit...", etc.) to keep the user engaged.
4. **Completion & Rendering**:
   - Once the polling endpoint returns `status: "completed"`, the interval is cleared (`stopPolling`), the data state is populated, and Framer Motion handles the smooth transition from the loading screen to displaying the full AI review (Gallery, Performance Scores, Verdict, etc.).

## License
Open Source (MIT)
