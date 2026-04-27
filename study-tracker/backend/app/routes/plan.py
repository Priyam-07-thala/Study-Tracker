from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import StudyPlanOut, PlanStatusOut, PlanGenerateRequest
from app.services import plan_service

router = APIRouter(prefix="/plan", tags=["Plan"])

@router.post("/generate/{subject_id}", response_model=StudyPlanOut)
def generate_plan(subject_id: int, payload: PlanGenerateRequest, db: Session = Depends(get_db)):
    return plan_service.generate_study_plan(db, subject_id, payload.hours_per_day)

@router.get("/{subject_id}", response_model=StudyPlanOut)
def get_plan(subject_id: int, db: Session = Depends(get_db)):
    from app.models.models import StudyPlan
    from sqlalchemy import select
    from fastapi import HTTPException
    plan = db.scalar(select(StudyPlan).where(StudyPlan.subject_id == subject_id))
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.get("/status/{subject_id}", response_model=PlanStatusOut)
def get_status(subject_id: int, db: Session = Depends(get_db)):
    return plan_service.get_plan_status(db, subject_id)

@router.post("/adjust/{subject_id}", response_model=StudyPlanOut)
def adjust_plan(subject_id: int, db: Session = Depends(get_db)):
    return plan_service.adjust_plan(db, subject_id)
