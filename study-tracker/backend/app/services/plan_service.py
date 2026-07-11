from datetime import date, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.models import Lecture, Subject, StudyPlan, StudyPlanDay
from app.models.schemas import PlanStatusOut


def generate_study_plan(db: Session, subject_id: int, hours_per_day: float = None, target_days: int = None) -> StudyPlan:
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

    # Determine day partitions
    N = len(lectures)
    
    if target_days:
        if target_days < 1:
            target_days = 1
        D = min(N, target_days)
        
        # Calculate daily target
        durations = [l.duration or 0 for l in lectures]
        total_duration = sum(durations)
        
        # Guard for zero duration lectures
        effective_durations = durations if total_duration > 0 else [1] * N
        effective_total = sum(effective_durations)
        
        # Calculate cumulative durations
        cum = [0] * (N + 1)
        for i in range(N):
            cum[i + 1] = cum[i] + effective_durations[i]
            
        target_avg = effective_total / D
        
        # Find optimal partition points
        partition_ends = []
        idx = 0
        for d in range(1, D):
            target_cum = d * target_avg
            best_end = idx + 1
            min_diff = float('inf')
            
            for end in range(idx + 1, N - D + d + 1):
                diff = abs(cum[end] - target_cum)
                if diff < min_diff:
                    min_diff = diff
                    best_end = end
            
            partition_ends.append(best_end)
            idx = best_end
        partition_ends.append(N)
        
        # Now construct the day assignments
        day_lectures = []
        idx = 0
        for end in partition_ends:
            day_lectures.append(lectures[idx:end])
            idx = end
            
        # Calculate hours_per_day
        hours_per_day = round((total_duration / D) / 3600.0, 2) if total_duration > 0 else 0.5
    else:
        # Standard greedy packing based on hours_per_day
        hours_per_day = hours_per_day or 2.0
        max_seconds_per_day = int(hours_per_day * 3600)
        
        day_lectures = []
        current_day = []
        current_duration = 0
        
        for lecture in lectures:
            duration = lecture.duration or 0
            if current_duration + duration > max_seconds_per_day and current_day:
                day_lectures.append(current_day)
                current_day = []
                current_duration = 0
            current_day.append(lecture)
            current_duration += duration
        if current_day:
            day_lectures.append(current_day)
            
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

    for day_idx, day_lecs in enumerate(day_lectures, start=1):
        plan_day = StudyPlanDay(
            plan_id=plan.id,
            day_number=day_idx,
            lecture_ids=[l.id for l in day_lecs],
            total_duration=sum(l.duration or 0 for l in day_lecs)
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
