from datetime import datetime, date
from pydantic import BaseModel, field_validator
import re


class UserCreate(BaseModel):
    username: str

class UserOut(BaseModel):
    id: int
    username: str
    created_at: datetime
    model_config = {"from_attributes": True}


class SubjectCreate(BaseModel):
    name: str
    description: str | None = None
    user_id: int = 1

class SubjectEditRequest(BaseModel):
    name: str
    description: str | None = None

class SubjectOut(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None
    created_at: datetime
    total_lectures: int = 0
    completed_lectures: int = 0
    completion_percentage: float = 0.0
    is_paused: bool = False
    paused_at: datetime | None = None
    model_config = {"from_attributes": True}


class LectureOut(BaseModel):
    id: int
    subject_id: int
    title: str
    video_id: str
    lecture_order: int
    duration: int
    completed: bool
    completed_at: datetime | None
    youtube_url: str = ""
    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_url(cls, lecture):
        obj = cls.model_validate(lecture)
        obj.youtube_url = f"https://www.youtube.com/watch?v={lecture.video_id}"
        return obj

class LectureEditRequest(BaseModel):
    title: str

class LectureCompleteRequest(BaseModel):
    completed: bool = True

class LectureReorderRequest(BaseModel):
    lecture_ids: list[int]


class PlaylistImportRequest(BaseModel):
    subject_id: int
    playlist_url: str

    @field_validator("playlist_url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        if re.search(r"list=([A-Za-z0-9_\-]+)", v):
            return v
        raise ValueError("URL does not contain a YouTube playlist ID (list=...)")

class PlaylistImportResponse(BaseModel):
    inserted: int
    skipped: int
    total_fetched: int
    message: str


class ProgressSnapshotOut(BaseModel):
    snapshot_date: date
    completion_percentage: float
    model_config = {"from_attributes": True}

class ProgressResponse(BaseModel):
    subject_id: int
    snapshots: list[ProgressSnapshotOut]
    current_completion: float
    predicted_completion_date: date | None = None


class PlanGenerateRequest(BaseModel):
    hours_per_day: float | None = None
    target_days: int | None = None


class StudyPlanDayOut(BaseModel):
    id: int
    plan_id: int
    day_number: int
    lecture_ids: list[int]
    total_duration: int
    model_config = {"from_attributes": True}


class StudyPlanOut(BaseModel):
    id: int
    subject_id: int
    hours_per_day: float
    start_date: date
    created_at: datetime
    days: list[StudyPlanDayOut] = []
    model_config = {"from_attributes": True}


class PlanStatusOut(BaseModel):
    status: str  # "ahead", "behind", "on_track"
    deviation_minutes: int
    expected_duration: int
    actual_duration: int
    avg_time_per_day_minutes: float
    estimated_completion_date: date | None


class DailyGoalCreate(BaseModel):
    title: str

class DailyGoalEditRequest(BaseModel):
    title: str | None = None
    completed: bool | None = None

class DailyGoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    completed: bool
    created_at: datetime
    model_config = {"from_attributes": True}
