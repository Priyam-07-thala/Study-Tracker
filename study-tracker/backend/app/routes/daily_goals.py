from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import DailyGoal
from app.models.schemas import DailyGoalCreate, DailyGoalEditRequest, DailyGoalOut
from app.routes.auth import get_current_user_id

router = APIRouter(prefix="/daily_goals", tags=["Daily Goals"])

@router.get("", response_model=list[DailyGoalOut])
def get_daily_goals(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    goals = db.scalars(
        select(DailyGoal)
        .where(DailyGoal.user_id == user_id)
        .order_by(DailyGoal.created_at.desc())
    ).all()
    return goals

@router.post("", response_model=DailyGoalOut, status_code=status.HTTP_201_CREATED)
def create_daily_goal(goal_in: DailyGoalCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    new_goal = DailyGoal(title=goal_in.title, user_id=user_id)
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.put("/{goal_id}", response_model=DailyGoalOut)
def update_daily_goal(goal_id: int, goal_in: DailyGoalEditRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    goal = db.get(DailyGoal, goal_id)
    if not goal or goal.user_id != user_id:
        raise HTTPException(status_code=404, detail="Daily goal not found")
    
    if goal_in.title is not None:
        goal.title = goal_in.title
    if goal_in.completed is not None:
        goal.completed = goal_in.completed
        
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_daily_goal(goal_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    goal = db.get(DailyGoal, goal_id)
    if not goal or goal.user_id != user_id:
        raise HTTPException(status_code=404, detail="Daily goal not found")
    
    db.delete(goal)
    db.commit()
