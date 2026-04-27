# Study Tracker

Full-stack lecture progress tracker with YouTube playlist integration.

**Stack:** FastAPI · SQLAlchemy · MySQL · React · Recharts

---

## Folder Structure

```
study-tracker/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Settings from .env
│   │   │   └── database.py        # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── models.py          # ORM table definitions
│   │   │   └── schemas.py         # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── subjects.py        # POST/GET /subjects
│   │   │   ├── lectures.py        # GET/PUT /lectures
│   │   │   ├── youtube.py         # POST /youtube/import
│   │   │   └── progress.py        # GET /progress/{id}
│   │   ├── services/
│   │   │   ├── subject_service.py
│   │   │   ├── lecture_service.py
│   │   │   ├── youtube_service.py
│   │   │   └── progress_service.py
│   │   └── main.py                # FastAPI app entrypoint
│   ├── .env.example               # Copy to .env and fill in values
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios wrappers
│   │   ├── components/            # Reusable UI components
│   │   ├── hooks/                 # Data-fetching hooks
│   │   ├── pages/                 # Dashboard, SubjectPage
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── schema.sql                     # MySQL DDL (auto-created by SQLAlchemy)
├── docker-compose.yml
└── README.md
```

---

## HOW TO RUN (Manual - No Docker)

### Prerequisites
- Python 3.11+  →  https://python.org/downloads
- Node.js 18+   →  https://nodejs.org
- MySQL 8.0     →  https://dev.mysql.com/downloads/mysql/
- YouTube Data API v3 key  →  https://console.cloud.google.com/

---

### Step 1 — Create MySQL Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE study_tracker CHARACTER SET utf8mb4;
```

---

### Step 2 — Configure Backend

```bash
cd study-tracker/backend
cp .env.example .env
```

Open `.env` and set your values:

```
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/study_tracker
YOUTUBE_API_KEY=your_youtube_api_key_here
CORS_ORIGINS=http://localhost:3000
```

> Replace `YOUR_MYSQL_PASSWORD` with the password you set during MySQL installation.
> For YouTube API key: Google Cloud Console → Enable YouTube Data API v3 → Credentials → Create API Key

---

### Step 3 — Run Backend

```bash
cd study-tracker/backend

# Create virtual environment
python -m venv .venv

# Activate it
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac / Linux

# Install packages
pip install -r requirements.txt

# Start server (tables auto-created on first run)
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### Step 4 — Run Frontend (new terminal)

```bash
cd study-tracker/frontend
npm install
npm run dev
```

You should see:
```
  VITE ready in Xs
  ➜  Local:   http://localhost:3000/
```

---

### Open in Browser

| URL | What |
|-----|------|
| http://localhost:3000 | The app |
| http://localhost:8000/docs | API docs (Swagger UI) |

---

## HOW TO RUN (Docker)

```bash
# In study-tracker root folder:
YOUTUBE_API_KEY=your_key docker-compose up --build
```

Everything starts automatically — MySQL, backend, frontend.

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Access denied for user 'root'` | Wrong password in DATABASE_URL in .env |
| `Can't connect to MySQL server` | MySQL is not running — start it first |
| `Module not found` | Virtual environment not activated |
| `YouTube API 403` | API key invalid or YouTube Data API v3 not enabled |
| `Port 8000 in use` | Change port: `uvicorn app.main:app --port 8001` |
| `Port 3000 in use` | Change in vite.config.js: `port: 3001` |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /subjects | List all subjects with computed progress |
| POST | /subjects | Create a subject |
| GET | /lectures/{subject_id} | List lectures for a subject |
| PUT | /lectures/complete/{lecture_id} | Toggle lecture complete (idempotent) |
| PUT | /lectures/batch-complete | Batch toggle lectures |
| POST | /youtube/import | Import YouTube playlist |
| GET | /progress/{subject_id} | Progress history + completion prediction |
| GET | /health | Health check |
