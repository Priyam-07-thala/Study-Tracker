from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import LectureOut, LectureCompleteRequest, LectureEditRequest, LectureReorderRequest
from app.services import lecture_service, subject_service
from app.routes.auth import get_current_user_id

router = APIRouter(prefix="/lectures", tags=["Lectures"])

@router.get("/{subject_id}", response_model=list[LectureOut])
def get_lectures(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return lecture_service.get_lectures_for_subject(db, subject_id)

@router.put("/complete/{lecture_id}", response_model=LectureOut)
def mark_complete(lecture_id: int, payload: LectureCompleteRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_lecture_owner(db, lecture_id, user_id)
    return lecture_service.mark_lecture_complete(db, lecture_id, payload.completed)

@router.put("/batch-complete", response_model=list[LectureOut])
def batch_complete(lecture_ids: list[int], completed: bool = True, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    if lecture_ids:
        subject_service.verify_lecture_owner(db, lecture_ids[0], user_id)
    return lecture_service.batch_mark_lectures(db, lecture_ids, completed)

@router.put("/{lecture_id}", response_model=LectureOut)
def update_lecture(lecture_id: int, payload: LectureEditRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_lecture_owner(db, lecture_id, user_id)
    return lecture_service.update_lecture(db, lecture_id, payload)

@router.delete("/{lecture_id}")
def delete_lecture(lecture_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_lecture_owner(db, lecture_id, user_id)
    return lecture_service.delete_lecture(db, lecture_id)

@router.put("/subject/{subject_id}/reorder", response_model=list[LectureOut])
def reorder_lectures(subject_id: int, payload: LectureReorderRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return lecture_service.reorder_lectures(db, subject_id, payload.lecture_ids)

@router.delete("/subject/{subject_id}")
def delete_all_lectures(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return lecture_service.delete_all_lectures(db, subject_id)
