from datetime import datetime, date
from sqlalchemy import (
    Integer, String, Boolean, DateTime, Date, Float,
    ForeignKey, UniqueConstraint, Index, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
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
    user: Mapped["User"] = relationship("User", back_populates="subjects")
    lectures: Mapped[list["Lecture"]] = relationship("Lecture", back_populates="subject", cascade="all, delete-orphan", order_by="Lecture.lecture_order")
    progress_snapshots: Mapped[list["ProgressSnapshot"]] = relationship("ProgressSnapshot", back_populates="subject", cascade="all, delete-orphan")


class Lecture(Base):
    __tablename__ = "lectures"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    video_id: Mapped[str] = mapped_column(String(50), nullable=False)
    lecture_order: Mapped[int] = mapped_column(Integer, nullable=False)
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
