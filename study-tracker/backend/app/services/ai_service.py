import json
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from google import genai
from google.genai import types

from app.core.config import settings
from app.models.models import Lecture, Subject, AINote, AIChatMessage

def _get_playlist_transcript(db: Session, subject_id: int) -> str:
    lectures = db.scalars(select(Lecture).where(Lecture.subject_id == subject_id).order_by(Lecture.lecture_order)).all()
    if not lectures:
        raise HTTPException(status_code=404, detail="No lectures found for this subject")

    video_ids = [lecture.video_id for lecture in lectures]
    
    full_transcript = []
    
    # Try fetching batch transcripts or individual
    # We will fetch individually to handle errors gracefully per video
    for video_id in video_ids:
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            text = " ".join([t['text'] for t in transcript_list])
            full_transcript.append(f"Video {video_id}:\n{text}\n")
        except Exception:
            # Some videos might not have transcripts, ignore them
            continue

    if not full_transcript:
        raise HTTPException(status_code=400, detail="Could not extract any transcripts from this playlist.")

    return "\n".join(full_transcript)

def _get_genai_client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    return genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_notes(db: Session, subject_id: int, prompt_type: str) -> AINote:
    transcript = _get_playlist_transcript(db, subject_id)
    
    prompt_map = {
        "full": "Please generate detailed, comprehensive notes for the following playlist transcript.",
        "short": "Please generate concise short notes summarizing the key concepts from the following playlist transcript.",
        "qna": "Please generate a set of Questions and Answers (Q&A) covering the important topics in the following playlist transcript."
    }
    
    system_instruction = prompt_map.get(prompt_type)
    if not system_instruction:
        raise HTTPException(status_code=400, detail="Invalid prompt_type")
        
    client = _get_genai_client()
    
    prompt = f"{system_instruction}\n\nTranscript:\n{transcript}"
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-pro',
            contents=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating AI content: {str(e)}")

    note_title = f"{prompt_type.capitalize()} Notes"
    note = AINote(
        subject_id=subject_id,
        title=note_title,
        content=response.text
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def get_notes(db: Session, subject_id: int) -> list[AINote]:
    return db.scalars(select(AINote).where(AINote.subject_id == subject_id).order_by(AINote.created_at.desc())).all()

def get_chat_history(db: Session, subject_id: int) -> list[AIChatMessage]:
    return db.scalars(select(AIChatMessage).where(AIChatMessage.subject_id == subject_id).order_by(AIChatMessage.created_at)).all()

def send_chat_message(db: Session, subject_id: int, message: str) -> AIChatMessage:
    transcript = _get_playlist_transcript(db, subject_id)
    chat_history = get_chat_history(db, subject_id)
    
    client = _get_genai_client()
    
    # Construct conversation history
    contents = []
    
    # System context
    system_instruction = "You are a helpful AI assistant specialized in tutoring the user on the subject of the following playlist transcript. Use the transcript provided as your main source of truth."
    
    # We'll just provide the transcript as the first user message, then model ACK, then history.
    # But wait, google.genai has `types.Content` and `system_instruction` in generate_content config.
    # Alternatively, we can start a chat session.
    
    # Let's use the Chat session feature:
    chat = client.chats.create(
        model="gemini-1.5-pro",
        config=types.GenerateContentConfig(
            system_instruction=f"{system_instruction}\n\nTranscript:\n{transcript}"
        )
    )
    
    # Send history (not supported perfectly by simple chats.create without passing history, let's just pass context directly)
    history = []
    for msg in chat_history:
        role = "user" if msg.role == "user" else "model"
        history.append(types.Content(role=role, parts=[types.Part.from_text(msg.content)]))
    
    # Send message using standard generate_content if we want to pass history manually.
    contents = history + [types.Content(role="user", parts=[types.Part.from_text(message)])]
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-pro',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=f"{system_instruction}\n\nTranscript:\n{transcript}"
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during AI chat: {str(e)}")
        
    # Save user message
    user_msg = AIChatMessage(subject_id=subject_id, role="user", content=message)
    db.add(user_msg)
    
    # Save model message
    model_msg = AIChatMessage(subject_id=subject_id, role="model", content=response.text)
    db.add(model_msg)
    
    db.commit()
    db.refresh(model_msg)
    
    return model_msg
