from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.models import ProgressSnapshot
from app.models.schemas import ProgressResponse, ProgressSnapshotOut
from app.services.lecture_service import _compute_progress


def get_progress(db: Session, subject_id: int) -> ProgressResponse:
    snapshots = db.scalars(
        select(ProgressSnapshot).where(ProgressSnapshot.subject_id == subject_id)
        .order_by(ProgressSnapshot.snapshot_date.asc())
    ).all()
    current_pct = _compute_progress(db, subject_id)
    predicted = _predict_completion(snapshots, current_pct)
    return ProgressResponse(
        subject_id=subject_id,
        snapshots=[ProgressSnapshotOut.model_validate(s) for s in snapshots],
        current_completion=current_pct,
        predicted_completion_date=predicted,
    )


def _predict_completion(snapshots, current_pct: float) -> date | None:
    if current_pct >= 100.0 or len(snapshots) < 2:
        return None
    recent = snapshots[-7:]
    if len(recent) < 2:
        return None
    first = recent[0]
    last = recent[-1]
    days_elapsed = (last.snapshot_date - first.snapshot_date).days
    if days_elapsed == 0:
        return None
    pct_gained = last.completion_percentage - first.completion_percentage
    daily_rate = pct_gained / days_elapsed
    if daily_rate <= 0:
        return None
    remaining = 100.0 - current_pct
    days_needed = remaining / daily_rate
    return date.today() + timedelta(days=int(days_needed))
