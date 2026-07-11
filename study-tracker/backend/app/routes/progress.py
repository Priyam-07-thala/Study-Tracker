from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import ProgressResponse
from app.services import progress_service, subject_service
from app.routes.auth import get_current_user_id

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("/{subject_id}", response_model=ProgressResponse)
def get_progress(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return progress_service.get_progress(db, subject_id)
