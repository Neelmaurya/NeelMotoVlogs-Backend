# Neel_MotoVlogs - Travel Creator Platform

A fully free and open-source travel creator platform for travel vloggers and bloggers.

## Tech Stack
- **Frontend**: Next.js 15, React, Tailwind CSS, Framer Motion, Axios.
- **Backend**: Django 5.x, Django REST Framework, JWT (SimpleJWT), SQLite/PostgreSQL.
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
   - `python manage.py migrate`
   - `python manage.py runserver`
3. **Setup Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

### Admin Access
- URL: `http://localhost:8000/admin`
- Email: `admin@neelmotovlogs.com`
- Password: `adminpassword`

## License
Open Source (MIT)
