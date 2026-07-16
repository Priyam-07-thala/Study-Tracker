from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.models.models import LectureBookmark, Lecture
from app.models.schemas import BookmarkCreate


def create_bookmark(db: Session, lecture_id: int, payload: BookmarkCreate) -> LectureBookmark:
    # Verify lecture exists
    lecture = db.get(Lecture, lecture_id)
    if not lecture:
        raise HTTPException(status_code=404, detail=f"Lecture {lecture_id} not found")
        
    bookmark = LectureBookmark(
        lecture_id=lecture_id,
        timestamp=payload.timestamp,
        note=payload.note
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark


def get_bookmarks_for_lecture(db: Session, lecture_id: int) -> list[LectureBookmark]:
    return db.scalars(
        select(LectureBookmark)
        .where(LectureBookmark.lecture_id == lecture_id)
        .order_by(LectureBookmark.timestamp.asc())
    ).all()


def delete_bookmark(db: Session, bookmark_id: int):
    bookmark = db.get(LectureBookmark, bookmark_id)
    if not bookmark:
        raise HTTPException(status_code=404, detail=f"Bookmark {bookmark_id} not found")
    db.delete(bookmark)
    db.commit()
    return {"message": "Bookmark deleted successfully"}
