from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import User
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

class AuthPayload(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(payload: AuthPayload, db: Session = Depends(get_db)):
    # Check if username exists
    existing = db.scalar(select(User).where(User.username == payload.username))
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(username=payload.username, password=payload.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "username": new_user.username}

@router.post("/login")
def login(payload: AuthPayload, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == payload.username))
    if not user or user.password != payload.password:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    return {"id": user.id, "username": user.username}

def get_current_user_id(x_user_id: str | None = Header(default=None)) -> int:
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Unauthorized: User ID not provided"
        )
    try:
        return int(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Unauthorized: Invalid User ID"
        )
