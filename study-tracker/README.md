# StudyScribbles ✏️
### *The Smart, Handwritten Doodle Study Planner & AI Assistant*

StudyScribbles is a full-stack, highly interactive learning planner designed to help students organize, schedule, and study self-paced coursework. Styled as an open, tactile study sketchbook, it turns intimidating YouTube playlists and slide decks into bite-sized daily tasks, complete with automated progression tracking, an adaptive calendar, and a 24/7 AI tutor mascot.

---

## 📖 What is StudyScribbles?

Self-directed learning (especially from YouTube tutorials) is often disorganized and lacks a feedback loop. StudyScribbles resolves this by centralizing your educational materials:
1. **Interactive Notebook workspaces**: Group your coursework into custom subjects styled like physical study folders.
2. **Automated Curriculum Imports**: Paste a YouTube playlist URL, and the app automatically parses the playlist metadata (sequence, titles, durations) to construct an interactive checklist.
3. **Smart Study Planner**: Generates balanced daily study blocks tailored to your available study hours or target deadlines. If you get ahead or fall behind, the planner dynamically adjusts and redistributes the remaining load.
4. **Ruled Daily Checklist**: Tracks focused micro-goals and tasks on a yellow legal pad widget, kept right next to your study tools.
5. **AI Tutor Companion**: Powered by Gemini, the assistant extracts video transcripts to compile summaries, cheat sheets, exam Q&As, or answer doubt-clearing questions in a chat interface.
6. **Progress Velocity Analytics**: Plots your learning velocity on graph paper charts and estimates your exact completion dates based on historical speed.

---

## ⚙️ How It Works

```mermaid
graph TD
    A[User Inputs Playlist URL] --> B[YouTube Data API parses Videos]
    B --> C[Create Subject & Lecture Database Checklists]
    C --> D[Adaptive Planner Calculates Daily Study Blocks]
    C --> E[AI Assistant pulls Video Transcripts]
    E --> F[Gemini Generates Summaries & Chat Context]
    D --> G[User Tracks & Completes Lectures]
    G --> H[Progress Snapshots update Velocity Charts]
```

1. **Workspace Creation**: The student creates a Subject, optionally pasting a YouTube playlist.
2. **Data Parsing**: The backend fetches playlist content and populates the `lectures` table.
3. **Daily Schedule Generation**: The algorithm sums total video minutes and distributes lectures into balanced days according to the target pace.
4. **Active Learning**: While watching videos in the desk frame player, the student can check them off, chat with **Doodly** (our mascot) about the video transcript, or generate written notes cards.
5. **Visual Progress Loop**: Checking off tasks logs statistics, plots progress, and triggers Doodly to react with encouraging remarks!

---

## 🛠️ The Tech Stack

### Frontend
- **React 18**: Component-driven UI library for single-page application reactivity.
- **Vite**: Ultra-fast next-generation frontend bundler (configured with manual chunk splitting to keep chunks under 85kB for fast page loads).
- **Recharts**: Responsive SVG graphing library used to display learning velocity.
- **Axios**: HTTP client for clean backend routing and request intercepting.
- **Vanilla CSS**: Custom styling variables implementing doodle textures, sketchy borders, and neobrutalist offset shadows.

### Backend
- **FastAPI**: Asynchronous Python web framework chosen for high performance, ease of use, and native data validation.
- **SQLAlchemy (ORM)**: Object Relational Mapper for handling relational MySQL queries cleanly.
- **MySQL**: Relational database engine storing persistent user profiles, plans, goals, and history.
- **Pydantic**: Robust data validation and settings management.
- **Uvicorn**: Lightning-fast ASGI web server.

### AI & Media Integrations
- **Google GenAI SDK (Gemini 1.5 Flash)**: Leveraged for generating notes and powering the tutor chatbot.
- **YouTube Transcript API**: Scrapes video caption transcripts dynamically to feed as context into the LLM.
- **YouTube Data API v3**: Imports playlist metadata.

---

## 💡 Why Choose This Tech Stack?

* **FastAPI vs. Flask/Django**: FastAPI provides asynchronous handlers out of the box, which is critical when scraping YouTube transcripts and making third-party API calls concurrently. It also auto-generates interactive API Swagger docs at `/docs` using OpenAPI.
* **Vite manual chunk splitting**: Standard React builds result in massive bundles. By splitting vendor charting components (`recharts`, `d3`) from the core bundle in `vite.config.js`, the app initial load speed dropped from 4.04s to **2.19s**.
* **MySQL + SQLAlchemy ORM**: The application requires highly structured relational schemas (e.g., users own subjects, subjects own lectures, study plans map to plan days, and days contain list arrays of lectures). A relational DB with transactional integrity ensures stats never fall out of sync.
* **Gemini 1.5 Flash**: Chosen for its **1-million token context window**. Scraped transcripts of a 50-video playlist easily exceed 300,000 characters. Gemini Flash parses this massive transcript context in under 4 seconds at a fraction of the cost of other models.
* **No-Asset Web Audio API**: Sound triggers are generated synthetically in raw Javascript. This ensures retro chimes ring instantly in any browser without needing to fetch `.mp3` files across the network.

---

## 🚀 How to Implement & Run Locally

### Prerequisites
* **Python 3.11+**
* **Node.js 18+**
* **MySQL Server**
* **YouTube Data API v3 Key** (Generate on [Google Cloud Console](https://console.cloud.google.com/))
* **Gemini API Key** (Generate free on [Google AI Studio](https://aistudio.google.com/))

---

### Step-by-Step Setup

#### 1. Database Initialization
Open your MySQL Workbench/Terminal and create a database:
```sql
CREATE DATABASE study_tracker CHARACTER SET utf8mb4;
```

#### 2. Backend Configuration
Navigate to the backend directory, copy the configuration template, and fill in your keys:
```bash
cd study-tracker/backend
cp .env.example .env
```
Update your `.env`:
```ini
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/study_tracker
YOUTUBE_API_KEY=your_youtube_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=http://localhost:3000
```

#### 3. Run Backend Server
Set up a Python virtual environment, install dependencies, and start the FastAPI server:
```bash
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1       # Windows PowerShell
source .venv/bin/activate          # macOS/Linux

# Install packages
pip install -r requirements.txt

# Start the web server (Tables are auto-created on first run)
uvicorn app.main:app --reload --port 8000
```
*API docs will be available at: http://localhost:8000/docs*

#### 4. Run Frontend Dev Client
Open a new terminal window, navigate to the frontend directory, install npm packages, and start the dev server:
```bash
cd study-tracker/frontend
npm install
npm run dev
```
*Open your browser and navigate to: http://localhost:3000*

---

## 🐳 Docker Deployment (Alternative)

To build and launch the entire stack (FastAPI, MySQL, and React) automatically inside isolated containers, run the following command in the root folder:

```bash
YOUTUBE_API_KEY=your_key GEMINI_API_KEY=your_key docker-compose up --build
```
This automatically initializes the database tables, links backend proxies, and hosts the application on port `3000`.
