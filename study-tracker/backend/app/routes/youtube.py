from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import PlaylistImportRequest, PlaylistImportResponse
from app.services import youtube_service

router = APIRouter(prefix="/youtube", tags=["YouTube"])

@router.post("/import", response_model=PlaylistImportResponse, status_code=201)
def import_playlist(payload: PlaylistImportRequest, db: Session = Depends(get_db)):
    return youtube_service.import_playlist(db, payload)
