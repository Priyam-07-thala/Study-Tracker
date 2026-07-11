from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.models.schemas import StudyPlanOut, PlanStatusOut, PlanGenerateRequest
from app.services import plan_service, subject_service
from app.routes.auth import get_current_user_id
from app.models.models import StudyPlan

router = APIRouter(prefix="/plan", tags=["Plan"])

@router.post("/generate/{subject_id}", response_model=StudyPlanOut)
def generate_plan(subject_id: int, payload: PlanGenerateRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return plan_service.generate_study_plan(db, subject_id, hours_per_day=payload.hours_per_day, target_days=payload.target_days)

@router.get("/{subject_id}", response_model=StudyPlanOut)
def get_plan(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    plan = db.scalar(select(StudyPlan).where(StudyPlan.subject_id == subject_id))
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.get("/status/{subject_id}", response_model=PlanStatusOut)
def get_status(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return plan_service.get_plan_status(db, subject_id)

@router.post("/adjust/{subject_id}", response_model=StudyPlanOut)
def adjust_plan(subject_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    subject_service.verify_subject_owner(db, subject_id, user_id)
    return plan_service.adjust_plan(db, subject_id)
