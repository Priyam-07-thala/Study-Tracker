from datetime import datetime, date
from sqlalchemy import (
    Integer, String, Boolean, DateTime, Date, Float,
    ForeignKey, UniqueConstraint, Index, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    subjects: Mapped[list["Subject"]] = relationship("Subject", back_populates="user", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    is_paused: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    paused_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    user: Mapped["User"] = relationship("User", back_populates="subjects")
    lectures: Mapped[list["Lecture"]] = relationship("Lecture", back_populates="subject", cascade="all, delete-orphan", order_by="Lecture.lecture_order")
    progress_snapshots: Mapped[list["ProgressSnapshot"]] = relationship("ProgressSnapshot", back_populates="subject", cascade="all, delete-orphan")
    study_plan: Mapped["StudyPlan"] = relationship("StudyPlan", back_populates="subject", cascade="all, delete-orphan", uselist=False)


class Lecture(Base):
    __tablename__ = "lectures"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    video_id: Mapped[str] = mapped_column(String(50), nullable=False)
    lecture_order: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    subject: Mapped["Subject"] = relationship("Subject", back_populates="lectures")
    __table_args__ = (
        UniqueConstraint("subject_id", "video_id", name="uq_subject_video"),
        Index("ix_lectures_subject_id", "subject_id"),
    )


class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    completion_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    subject: Mapped["Subject"] = relationship("Subject", back_populates="progress_snapshots")
    __table_args__ = (
        UniqueConstraint("subject_id", "snapshot_date", name="uq_subject_date"),
        Index("ix_progress_subject_date", "subject_id", "snapshot_date"),
    )


class StudyPlan(Base):
    __tablename__ = "study_plans"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, unique=True)
    hours_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    subject: Mapped["Subject"] = relationship("Subject", back_populates="study_plan")
    days: Mapped[list["StudyPlanDay"]] = relationship("StudyPlanDay", back_populates="plan", cascade="all, delete-orphan", order_by="StudyPlanDay.day_number")


class StudyPlanDay(Base):
    __tablename__ = "study_plan_days"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plan_id: Mapped[int] = mapped_column(Integer, ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    lecture_ids: Mapped[list] = mapped_column(JSON, nullable=False)
    total_duration: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    plan: Mapped["StudyPlan"] = relationship("StudyPlan", back_populates="days")
    __table_args__ = (
        UniqueConstraint("plan_id", "day_number", name="uq_plan_day"),
    )


class DailyGoal(Base):
    __tablename__ = "daily_goals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, default=1)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
