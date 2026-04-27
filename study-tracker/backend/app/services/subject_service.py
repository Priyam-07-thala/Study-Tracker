from sqlalchemy.orm import Session
from sqlalchemy import func, select
from fastapi import HTTPException
from app.models.models import Subject, Lecture, User
from app.models.schemas import SubjectCreate, SubjectOut


def _ensure_default_user(db: Session) -> User:
    user = db.get(User, 1)
    if not user:
        user = User(id=1, username="demo")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def _enrich_subject(db: Session, subject: Subject) -> SubjectOut:
    total = db.scalar(select(func.count(Lecture.id)).where(Lecture.subject_id == subject.id)) or 0
    completed = db.scalar(select(func.count(Lecture.id)).where(
        Lecture.subject_id == subject.id, Lecture.completed == True
    )) or 0
    pct = round(completed / total * 100, 2) if total > 0 else 0.0
    out = SubjectOut.model_validate(subject)
    out.total_lectures = total
    out.completed_lectures = completed
    out.completion_percentage = pct
    return out


def create_subject(db: Session, payload: SubjectCreate) -> SubjectOut:
    _ensure_default_user(db)
    subject = Subject(user_id=payload.user_id, name=payload.name, description=payload.description)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return _enrich_subject(db, subject)


def list_subjects(db: Session, user_id: int = 1) -> list[SubjectOut]:
    _ensure_default_user(db)
    subjects = db.scalars(select(Subject).where(Subject.user_id == user_id).order_by(Subject.created_at.desc())).all()
    return [_enrich_subject(db, s) for s in subjects]


def get_subject_or_404(db: Session, subject_id: int) -> Subject:
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail=f"Subject {subject_id} not found")
    return subject
