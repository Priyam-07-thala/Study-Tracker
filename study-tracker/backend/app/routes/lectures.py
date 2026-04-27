from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import LectureOut, LectureCompleteRequest
from app.services import lecture_service

router = APIRouter(prefix="/lectures", tags=["Lectures"])

@router.get("/{subject_id}", response_model=list[LectureOut])
def get_lectures(subject_id: int, db: Session = Depends(get_db)):
    return lecture_service.get_lectures_for_subject(db, subject_id)

@router.put("/complete/{lecture_id}", response_model=LectureOut)
def mark_complete(lecture_id: int, payload: LectureCompleteRequest, db: Session = Depends(get_db)):
    return lecture_service.mark_lecture_complete(db, lecture_id, payload.completed)

@router.put("/batch-complete", response_model=list[LectureOut])
def batch_complete(lecture_ids: list[int], completed: bool = True, db: Session = Depends(get_db)):
    return lecture_service.batch_mark_lectures(db, lecture_ids, completed)
