from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import SubjectCreate, SubjectOut, SubjectEditRequest
from app.services import subject_service
from app.routes.auth import get_current_user_id

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.post("", response_model=SubjectOut, status_code=201)
def create_subject(payload: SubjectCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    payload.user_id = user_id
    return subject_service.create_subject(db, payload)

@router.get("", response_model=list[SubjectOut])
def list_subjects(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return subject_service.list_subjects(db, user_id=user_id)

@router.put("/{subject_id}", response_model=SubjectOut)
def update_subject(subject_id: int, payload: SubjectEditRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return subject_service.update_subject(db, subject_id, payload)

@router.delete("/{subject_id}")
def delete_subject(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return subject_service.delete_subject(db, subject_id)

@router.put("/{subject_id}/pause", response_model=SubjectOut)
def pause_subject(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return subject_service.pause_subject(db, subject_id)

@router.put("/{subject_id}/resume", response_model=SubjectOut)
def resume_subject(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return subject_service.resume_subject(db, subject_id)
