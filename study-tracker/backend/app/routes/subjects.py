from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import SubjectCreate, SubjectOut
from app.services import subject_service

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.post("", response_model=SubjectOut, status_code=201)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db)):
    return subject_service.create_subject(db, payload)

@router.get("", response_model=list[SubjectOut])
def list_subjects(user_id: int = 1, db: Session = Depends(get_db)):
    return subject_service.list_subjects(db, user_id=user_id)
