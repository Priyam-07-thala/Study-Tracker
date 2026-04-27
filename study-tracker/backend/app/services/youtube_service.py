import re
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.core.config import settings
from app.models.models import Lecture, Subject
from app.models.schemas import PlaylistImportRequest, PlaylistImportResponse

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
MAX_RESULTS_PER_PAGE = 50


def _extract_playlist_id(url: str) -> str:
    match = re.search(r"list=([A-Za-z0-9_\-]+)", url)
    if not match:
        raise HTTPException(status_code=422, detail="Could not extract playlist ID from URL")
    return match.group(1)

def _parse_iso_duration(duration_str: str) -> int:
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration_str)
    if not match:
        return 0
    h, m, s = match.groups()
    return int(h or 0) * 3600 + int(m or 0) * 60 + int(s or 0)


def _fetch_all_playlist_items(playlist_id: str) -> list[dict]:
    items: list[dict] = []
    next_page_token: str | None = None
    with httpx.Client(timeout=15.0) as client:
        while True:
            params = {
                "part": "snippet",
                "playlistId": playlist_id,
                "maxResults": MAX_RESULTS_PER_PAGE,
                "key": settings.YOUTUBE_API_KEY,
            }
            if next_page_token:
                params["pageToken"] = next_page_token
            resp = client.get(f"{YOUTUBE_API_BASE}/playlistItems", params=params)
            if resp.status_code == 403:
                raise HTTPException(status_code=502, detail="YouTube API quota exceeded or API key invalid")
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail=f"Playlist '{playlist_id}' not found on YouTube")
            resp.raise_for_status()
            data = resp.json()
            for item in data.get("items", []):
                snippet = item.get("snippet", {})
                video_id = snippet.get("resourceId", {}).get("videoId")
                title = snippet.get("title", "Untitled")
                position = snippet.get("position", 0)
                if not video_id or title in ("Deleted video", "Private video"):
                    continue
                items.append({"video_id": video_id, "title": title, "position": position, "duration": 0})
            next_page_token = data.get("nextPageToken")
            if not next_page_token:
                break
        
        # Batch fetch durations
        video_ids = [item["video_id"] for item in items]
        for i in range(0, len(video_ids), MAX_RESULTS_PER_PAGE):
            batch_ids = video_ids[i:i + MAX_RESULTS_PER_PAGE]
            resp = client.get(
                f"{YOUTUBE_API_BASE}/videos",
                params={"part": "contentDetails", "id": ",".join(batch_ids), "key": settings.YOUTUBE_API_KEY}
            )
            if resp.status_code == 200:
                videos_data = resp.json().get("items", [])
                duration_map = {
                    v["id"]: _parse_iso_duration(v.get("contentDetails", {}).get("duration", ""))
                    for v in videos_data
                }
                for item in items:
                    if item["video_id"] in duration_map:
                        item["duration"] = duration_map[item["video_id"]]

    return items


def import_playlist(db: Session, payload: PlaylistImportRequest) -> PlaylistImportResponse:
    subject = db.get(Subject, payload.subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail=f"Subject {payload.subject_id} not found")
    playlist_id = _extract_playlist_id(payload.playlist_url)
    raw_items = _fetch_all_playlist_items(playlist_id)
    if not raw_items:
        raise HTTPException(status_code=422, detail="Playlist appears to be empty or inaccessible")
    existing_max_order = db.scalar(
        select(Lecture.lecture_order).where(Lecture.subject_id == payload.subject_id)
        .order_by(Lecture.lecture_order.desc()).limit(1)
    )
    base_order = (existing_max_order + 1) if existing_max_order is not None else 0
    existing_video_ids: set[str] = set(
        db.scalars(select(Lecture.video_id).where(Lecture.subject_id == payload.subject_id)).all()
    )
    inserted = 0
    skipped = 0
    try:
        for item in raw_items:
            if item["video_id"] in existing_video_ids:
                skipped += 1
                continue
            lecture = Lecture(
                subject_id=payload.subject_id,
                title=item["title"],
                video_id=item["video_id"],
                lecture_order=base_order + item["position"],
                duration=item.get("duration", 0),
                completed=False,
            )
            db.add(lecture)
            existing_video_ids.add(item["video_id"])
            inserted += 1
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Duplicate video detected during import — partial import rolled back")
    return PlaylistImportResponse(
        inserted=inserted, skipped=skipped, total_fetched=len(raw_items),
        message=f"Imported {inserted} new lecture(s), skipped {skipped} duplicate(s)",
    )
