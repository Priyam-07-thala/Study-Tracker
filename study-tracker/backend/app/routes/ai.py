from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import AINoteOut, AIChatMessageOut, AIChatRequest, AINoteGenerateRequest
from app.services import ai_service

router = APIRouter()

@router.get("/subjects/{subject_id}/notes", response_model=list[AINoteOut])
def get_notes(subject_id: int, db: Session = Depends(get_db)):
    return ai_service.get_notes(db, subject_id)

@router.post("/subjects/{subject_id}/notes", response_model=AINoteOut)
def generate_note(subject_id: int, payload: AINoteGenerateRequest, db: Session = Depends(get_db)):
    return ai_service.generate_notes(db, subject_id, payload.prompt_type)

@router.get("/subjects/{subject_id}/chat", response_model=list[AIChatMessageOut])
def get_chat(subject_id: int, db: Session = Depends(get_db)):
    return ai_service.get_chat_history(db, subject_id)

@router.post("/subjects/{subject_id}/chat", response_model=AIChatMessageOut)
def send_chat(subject_id: int, payload: AIChatRequest, db: Session = Depends(get_db)):
    return ai_service.send_chat_message(db, subject_id, payload.message)
