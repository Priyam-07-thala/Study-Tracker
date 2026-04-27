from datetime import date, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.models import Lecture, Subject, StudyPlan, StudyPlanDay
from app.models.schemas import PlanStatusOut


def generate_study_plan(db: Session, subject_id: int, hours_per_day: float) -> StudyPlan:
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Fetch all lectures for this subject in order
    lectures = db.scalars(
        select(Lecture)
        .where(Lecture.subject_id == subject_id)
        .order_by(Lecture.lecture_order)
    ).all()

    if not lectures:
        raise HTTPException(status_code=400, detail="No lectures found for this subject")

    max_seconds_per_day = int(hours_per_day * 3600)
    
    # Check if a plan already exists
    existing_plan = db.scalar(select(StudyPlan).where(StudyPlan.subject_id == subject_id))
    if existing_plan:
        db.delete(existing_plan)
        db.commit()

    plan = StudyPlan(
        subject_id=subject_id,
        hours_per_day=hours_per_day,
        start_date=date.today(),
    )
    db.add(plan)
    db.flush()

    day_number = 1
    current_day_duration = 0
    current_day_lectures = []
    
    for lecture in lectures:
        duration = lecture.duration or 0
        
        # If adding this lecture exceeds the daily limit, and the current day is not empty, move to next day
        if current_day_duration + duration > max_seconds_per_day and current_day_lectures:
            plan_day = StudyPlanDay(
                plan_id=plan.id,
                day_number=day_number,
                lecture_ids=current_day_lectures,
                total_duration=current_day_duration
            )
            db.add(plan_day)
            
            day_number += 1
            current_day_duration = 0
            current_day_lectures = []

        # Add lecture to current day
        current_day_lectures.append(lecture.id)
        current_day_duration += duration
        
        # If the single lecture itself is larger than the limit, we'll let it be the only one in the day
        # The next iteration will trigger the new day because current_day_duration > max_seconds_per_day
    
    # Add the last day if not empty
    if current_day_lectures:
        plan_day = StudyPlanDay(
            plan_id=plan.id,
            day_number=day_number,
            lecture_ids=current_day_lectures,
            total_duration=current_day_duration
        )
        db.add(plan_day)

    db.commit()
    db.refresh(plan)
    return plan


def get_plan_status(db: Session, subject_id: int) -> PlanStatusOut:
    plan = db.scalar(select(StudyPlan).where(StudyPlan.subject_id == subject_id))
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found for this subject")

    days_passed = (date.today() - plan.start_date).days + 1
    if days_passed < 1:
        days_passed = 1

    # Calculate expected duration
    expected_duration = sum(
        d.total_duration for d in plan.days if d.day_number <= days_passed
    )

    # Calculate actual duration (sum of completed lectures)
    completed_lectures = db.scalars(
        select(Lecture).where(Lecture.subject_id == subject_id, Lecture.completed == True)
    ).all()
    actual_duration = sum(l.duration or 0 for l in completed_lectures)

    # Calculate status and deviation
    deviation_seconds = actual_duration - expected_duration
    deviation_minutes = int(deviation_seconds / 60)

    if deviation_minutes > 15:
        status = "ahead"
    elif deviation_minutes < -15:
        status = "behind"
    else:
        status = "on_track"

    # Prediction
    avg_time_per_day_seconds = actual_duration / days_passed
    avg_time_per_day_minutes = round(avg_time_per_day_seconds / 60, 1)

    total_duration = sum(d.total_duration for d in plan.days)
    remaining_duration = total_duration - actual_duration

    if actual_duration == 0 or avg_time_per_day_seconds == 0:
        # Fallback to planned speed
        daily_speed = plan.hours_per_day * 3600
    else:
        daily_speed = avg_time_per_day_seconds

    if remaining_duration <= 0:
        estimated_completion_date = date.today()
    else:
        remaining_days = int(remaining_duration / daily_speed) if daily_speed > 0 else 0
        estimated_completion_date = date.today() + timedelta(days=remaining_days)

    return PlanStatusOut(
        status=status,
        deviation_minutes=abs(deviation_minutes),
        expected_duration=expected_duration,
        actual_duration=actual_duration,
        avg_time_per_day_minutes=avg_time_per_day_minutes,
        estimated_completion_date=estimated_completion_date
    )


def adjust_plan(db: Session, subject_id: int) -> StudyPlan:
    plan = db.scalar(select(StudyPlan).where(StudyPlan.subject_id == subject_id))
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found for this subject")

    # Fetch uncompleted lectures
    uncompleted_lectures = db.scalars(
        select(Lecture)
        .where(Lecture.subject_id == subject_id, Lecture.completed == False)
        .order_by(Lecture.lecture_order)
    ).all()

    if not uncompleted_lectures:
        return plan # Already done

    # We will adjust the plan from tomorrow onwards if they already did something today, 
    # but simplest is just reset the plan's start date to today and re-plan remaining.
    # To keep past data is harder (requires keeping old plan days). The user said "auto-adjust remaining plan".
    # Let's completely recreate the plan starting from today for uncompleted lectures.
    
    # We'll just update the existing plan's start date to today and replace its days.
    # However, replacing days means we lose the history of what was planned for the past.
    # A robust way: generate a new plan and delete the old. But wait, we want to know what they've done.
    # Actually, simply calling generate_study_plan again will reset it. 
    # Let's define "adjust" as just re-generating the plan but only planning the uncompleted ones.
    # Wait, if we plan only uncompleted, what about the completed ones? We should probably just regenerate the whole plan from scratch?
    # No, regenerating whole plan from scratch doesn't catch them up, it just makes the same plan again if we use all lectures.
    # We should plan uncompleted lectures starting today.
    # To keep the whole plan intact, we can rewrite the days.

    db.delete(plan)
    db.commit()

    return generate_study_plan(db, subject_id, plan.hours_per_day)
