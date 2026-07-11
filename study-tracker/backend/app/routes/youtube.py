from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import PlaylistImportRequest, PlaylistImportResponse
from app.services import youtube_service, subject_service
from app.routes.auth import get_current_user_id

router = APIRouter(prefix="/youtube", tags=["YouTube"])

@router.post("/import", response_model=PlaylistImportResponse, status_code=201)
def import_playlist(payload: PlaylistImportRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, payload.subject_id, user_id)
    return youtube_service.import_playlist(db, payload)
