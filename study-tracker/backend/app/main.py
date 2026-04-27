from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base
from app.routes import subjects, lectures, youtube, progress, plan
import app.models.models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Study Tracker API",
    description="Track lecture progress with YouTube playlist integration.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for standalone HTML file usage
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subjects.router)
app.include_router(lectures.router)
app.include_router(youtube.router)
app.include_router(progress.router)
app.include_router(plan.router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(exc)}"})

@app.get("/health", tags=["Meta"])
def health():
    return {"status": "ok"}
