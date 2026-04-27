from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import ProgressResponse
from app.services import progress_service

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("/{subject_id}", response_model=ProgressResponse)
def get_progress(subject_id: int, db: Session = Depends(get_db)):
    return progress_service.get_progress(db, subject_id)
