from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func, text
from fastapi import HTTPException
from app.models.models import Lecture, Subject
from app.models.schemas import LectureOut, LectureEditRequest


def get_lectures_for_subject(db: Session, subject_id: int) -> list[LectureOut]:
    lectures = db.scalars(
        select(Lecture).where(Lecture.subject_id == subject_id).order_by(Lecture.lecture_order)
    ).all()
    return [LectureOut.from_orm_with_url(lec) for lec in lectures]


def _compute_progress(db: Session, subject_id: int) -> float:
    total = db.scalar(select(func.count(Lecture.id)).where(Lecture.subject_id == subject_id)) or 0
    if total == 0:
        return 0.0
    completed = db.scalar(select(func.count(Lecture.id)).where(
        Lecture.subject_id == subject_id, Lecture.completed == True
    )) or 0
    return round(completed / total * 100, 2)


def _upsert_progress_snapshot(db: Session, subject_id: int, pct: float) -> None:
    from datetime import date
    today = date.today().isoformat()
    db.execute(
        text(
            "INSERT INTO progress_snapshots (subject_id, snapshot_date, completion_percentage) "
            "VALUES (:subject_id, :dt, :pct) "
            "ON DUPLICATE KEY UPDATE completion_percentage = :pct"
        ),
        {"subject_id": subject_id, "dt": today, "pct": pct},
    )


def mark_lecture_complete(db: Session, lecture_id: int, completed: bool) -> LectureOut:
    lecture = db.get(Lecture, lecture_id)
    if not lecture:
        raise HTTPException(status_code=404, detail=f"Lecture {lecture_id} not found")
    if lecture.completed == completed:
        return LectureOut.from_orm_with_url(lecture)
    try:
        lecture.completed = completed
        lecture.completed_at = datetime.now(timezone.utc) if completed else None
        pct = _compute_progress(db, lecture.subject_id)
        _upsert_progress_snapshot(db, lecture.subject_id, pct)
        db.commit()
        db.refresh(lecture)
    except Exception:
        db.rollback()
        raise
    return LectureOut.from_orm_with_url(lecture)


def batch_mark_lectures(db: Session, lecture_ids: list[int], completed: bool) -> list[LectureOut]:
    lectures = db.scalars(select(Lecture).where(Lecture.id.in_(lecture_ids))).all()
    if not lectures:
        raise HTTPException(status_code=404, detail="No lectures found for given IDs")
    subject_ids = {lec.subject_id for lec in lectures}
    now = datetime.now(timezone.utc)
    try:
        for lec in lectures:
            if lec.completed != completed:
                lec.completed = completed
                lec.completed_at = now if completed else None
        for subject_id in subject_ids:
            pct = _compute_progress(db, subject_id)
            _upsert_progress_snapshot(db, subject_id, pct)
        db.commit()
        for lec in lectures:
            db.refresh(lec)
    except Exception:
        db.rollback()
        raise
    return [LectureOut.from_orm_with_url(lec) for lec in lectures]

def update_lecture(db: Session, lecture_id: int, payload: LectureEditRequest) -> LectureOut:
    lecture = db.get(Lecture, lecture_id)
    if not lecture:
        raise HTTPException(status_code=404, detail=f"Lecture {lecture_id} not found")
    lecture.title = payload.title
    db.commit()
    db.refresh(lecture)
    return LectureOut.from_orm_with_url(lecture)

def delete_lecture(db: Session, lecture_id: int):
    lecture = db.get(Lecture, lecture_id)
    if not lecture:
        raise HTTPException(status_code=404, detail=f"Lecture {lecture_id} not found")
    subject_id = lecture.subject_id
    db.delete(lecture)
    
    # reorder lectures? Not strictly necessary unless order is critical to be sequential, but we can just leave gaps.
    db.commit()
    
    pct = _compute_progress(db, subject_id)
    _upsert_progress_snapshot(db, subject_id, pct)
    db.commit()
    return {"message": "Lecture deleted successfully"}

def delete_all_lectures(db: Session, subject_id: int):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail=f"Subject {subject_id} not found")
    
    # Delete all lectures
    db.execute(text("DELETE FROM lectures WHERE subject_id = :sid"), {"sid": subject_id})
    db.commit()
    
    # Reset progress to 0 for today
    _upsert_progress_snapshot(db, subject_id, 0.0)
    db.commit()
    
    return {"message": "All lectures cleared"}

def reorder_lectures(db: Session, subject_id: int, lecture_ids: list[int]) -> list[LectureOut]:
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail=f"Subject {subject_id} not found")
        
    lectures = db.scalars(select(Lecture).where(Lecture.subject_id == subject_id)).all()
    lecture_map = {l.id: l for l in lectures}
    
    # Verify all provided IDs belong to the subject
    for lid in lecture_ids:
        if lid not in lecture_map:
            raise HTTPException(status_code=400, detail=f"Lecture {lid} does not belong to subject {subject_id}")
            
    # Update orders
    for order, lid in enumerate(lecture_ids):
        lecture_map[lid].lecture_order = order
        
    db.commit()
    
    # Return sorted updated lectures
    ordered_lectures = sorted(lectures, key=lambda l: l.lecture_order)
    return [LectureOut.from_orm_with_url(lec) for lec in ordered_lectures]
