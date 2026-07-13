# Study Tracker: Core Application Logics & Algorithms

This document provides a comprehensive overview of the core algorithms, code structures, and mathematical models that power the Study Tracker application.

---

## 1. YouTube Import & Video Parsing Logic
* **Location in Code:** [youtube_service.py](file:///c:/Users/User/Desktop/study-tracker2/study-tracker/backend/app/services/youtube_service.py)

The import system parses a user's input, identifies whether they entered a single video, a playlist, or a list of multiple mixed links, fetches their metadata from the YouTube Data API v3, and inserts them as sequential lectures.

### A. Input Tokenization & Parsing
The input string is split by spaces, commas, or newlines, and matched against regex patterns to identify playlists and videos:

```python
def parse_import_input(input_str: str) -> list[dict]:
    # Split input by commas, newlines, or spaces
    tokens = re.split(r'[,\n\s]+', input_str)
    parsed_items = []
    for t in tokens:
        t = t.strip()
        if not t:
            continue
            
        # 1. Match Playlists
        playlist_match = re.search(r"list=([A-Za-z0-9_\-]+)", t)
        if playlist_match:
            parsed_items.append({"type": "playlist", "id": playlist_match.group(1)})
            continue
        if re.match(r"^PL[A-Za-z0-9_\-]+$", t):
            parsed_items.append({"type": "playlist", "id": t})
            continue
            
        # 2. Match Single Videos, Shorts, or Shared Links
        video_match = re.search(r"(?:v=|\/v\/|embed\/|youtu\.be\/|shorts\/)([A-Za-z0-9_\-]{11})", t)
        if video_match:
            parsed_items.append({"type": "video", "id": video_match.group(1)})
            continue
        if re.match(r"^[A-Za-z0-9_\-]{11}$", t):
            parsed_items.append({"type": "video", "id": t})
            continue
            
    return parsed_items
```

### B. ISO-8601 Duration Parser
YouTube returns video durations in the ISO-8601 format (e.g., `PT1H23M45S` for 1 hour, 23 minutes, and 45 seconds). The backend parses this string into total seconds:

```python
def _parse_iso_duration(duration_str: str) -> int:
    # Matches patterns like PT1H23M45S, PT45M, PT10S, etc.
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration_str)
    if not match:
        return 0
    h, m, s = match.groups()
    return int(h or 0) * 3600 + int(m or 0) * 60 + int(s or 0)
```

### C. Playlist Items Pagination & Batch Fetching
1. **Recursion via `nextPageToken`:** Fetches videos in blocks of 50 using YouTube's `playlistItems` endpoint, repeating the call as long as a pagination token is returned.
2. **Batch Durations Fetching:** To save API quota, the backend collects all extracted video IDs and makes a single batch call (up to 50 IDs at a time) to the `videos` endpoint to get their durations.

---

## 2. Study Plan Scheduling & Day Partitioning Algorithms
* **Location in Code:** [plan_service.py](file:///c:/Users/User/Desktop/study-tracker2/study-tracker/backend/app/services/plan_service.py) (`generate_study_plan` function)

When generating a study plan, the application partitions lectures into daily study blocks using one of two algorithms, taking into account completed vs. uncompleted lectures and backdating the plan start date to when the subject was created.

### A. Core Adaptive Partitioning Steps:
1. **Backdate Plan Start Date:** Sets the plan's `start_date` to `subject.created_at.date()` (so the user's progress naturally aligns with their study history).
2. **Calculate Days Passed:** Computes the number of days elapsed from `start_date` to today: `days_passed = (today - start_date).days + 1`.
3. **Partition Completed Lectures:** Places all already completed lectures on past days (Day 1 through Day `days_passed - 1`).
4. **Partition Uncompleted Lectures:** Packs remaining uncompleted lectures starting from Day `days_passed` (today) onwards.

---

### Algorithm A: Greedy Packing (Based on Hours per Day for Uncompleted Lectures)
Used when the student selects a **Target Study Hours/Day** constraint (e.g., 2 hours/day).
* **Logic:** Packs uncompleted lectures sequentially starting from `days_passed` (today). If adding the next lecture exceeds the daily target study limit, it seals that day and starts packing the next.

```python
hours_per_day = hours_per_day or 2.0
max_seconds_per_day = int(hours_per_day * 3600)

current_day = []
current_duration = 0
for lecture in uncompleted_lecs:
    duration = lecture.duration or 0
    if current_duration + duration > max_seconds_per_day and current_day:
        future_days_assignments.append(current_day)
        current_day = []
        current_duration = 0
    current_day.append(lecture)
    current_duration += duration
if current_day:
    future_days_assignments.append(current_day)
```

---

### Algorithm B: Balanced Load Partitioning (Based on Target Days Count)
Used when the student selects a **Total Target Days** constraint (e.g., finish the subject in exactly 7 days).
* **Logic:** Divides the remaining uncompleted lectures evenly over the remaining days of the plan (`target_days - num_past_days`) using cumulative sum average optimization.

```python
remaining_days = target_days - num_past_days
D = min(n_uncomp, remaining_days)

target_avg = effective_total / D
cum = [0] * (n_uncomp + 1)
for i in range(n_uncomp):
    cum[i + 1] = cum[i] + effective_durations[i]

partition_ends = []
idx = 0
for d in range(1, D):
    target_cum = d * target_avg
    best_end = idx + 1
    min_diff = float('inf')
    for end in range(idx + 1, n_uncomp - D + d + 1):
        diff = abs(cum[end] - target_cum)
        if diff < min_diff:
            min_diff = diff
            best_end = end
    partition_ends.append(best_end)
    idx = best_end
partition_ends.append(n_uncomp)
```

---

## 3. Adaptive Planning (Adjust Plan Logic)
* **Location in Code:** [plan_service.py](file:///c:/Users/User/Desktop/study-tracker2/study-tracker/backend/app/services/plan_service.py) (`adjust_plan` function)

If a student falls behind schedule, clicking **Adjust Schedule** deletes the current plan and regenerates it.
* **Logic:** Because `generate_study_plan` partitions completed lectures over the past days and uncompleted lectures starting from today onwards, calling it again automatically reschedules all remaining uncompleted lectures starting today, distributing them smoothly over the future days.

---

## 4. Completion Estimation Models

The system runs two distinct completion models in parallel:

### Model A: Study Planner (Time & Velocity Based)
* **Goal:** Estimate completion based on actual hours studied.
* **Math:** 
  1. $\text{Daily Velocity (sec/day)} = \frac{\text{Total seconds of completed lectures}}{\text{Days since plan started}}$
  2. $\text{Remaining Days} = \frac{\text{Remaining seconds of all lectures}}{\text{Daily Velocity}}$

### Model B: Progress Chart (Percentage & Trend Based)
* **Goal:** Estimate completion based on lecture count progress.
* **Math:**
  1. $\text{Daily Velocity (\%/day)} = \frac{\text{Latest snapshot completion \%} - \text{First snapshot completion \%}}{\text{Days elapsed between snapshots (last 7 days)}}$
  2. $\text{Remaining Days} = \frac{100\% - \text{Current completion \%}}{\text{Daily Velocity}}$

### Step-by-Step Comparative Example
If you have **10 lectures** (5 short videos of 5 mins, 5 long videos of 60 mins):
* Total course length = 5 hours and 25 mins.
* On **Day 1**, you complete the **5 short lectures** (50% of the course).

1. **Progress Chart Prediction:** Sees you finished **50%** in 1 day. It estimates you will finish the remaining 50% in **1 day**.
2. **Study Planner Prediction:** Sees you completed only **25 minutes** of video on Day 1. To watch the remaining **5 hours** of video at a speed of 25 mins/day, it estimates you will need **12 days**.

---

## 5. AI Study Assistant Context Logic
* **Location in Code:** [ai_service.py](file:///c:/Users/User/Desktop/study-tracker2/study-tracker/backend/app/services/ai_service.py)

The AI assistant reads transcripts and answers questions about the course material using Gemini.

### A. Transcript Truncation & Token Safeguard
To prevent running out of tokens (TPM) on the Google AI Studio free tier, transcripts are automatically truncated if they exceed a specific size:

```python
# Free tier safeguard: truncate to ~100k tokens (400,000 characters)
if len(transcript) > 400000:
    transcript = transcript[:400000] + "\n\n[Transcript truncated due to free tier API token limits...]"
```

### B. Prompt & Context Mapping
* **Notes Generation:** Maps the user's request (`full`, `short`, or `qna`) to structured instructions:
  * `"full"`: Detailed, comprehensive notebook summaries.
  * `"short"`: Key concepts, terms, and core takeaways.
  * `"qna"`: Exam-style practice questions and answers.
* **Chat Context Injection:** Initiates the Gemini chat by setting the system instructions dynamically:
  `"You are a helpful AI assistant specialized in tutoring the user on the subject of the following playlist transcript. Use the transcript provided as your main source of truth."`

---

## 6. How a "Day" is Counted in the System
The application calculates which study day you are currently on strictly by **local calendar date boundaries** (midnight-to-midnight), rather than a rolling 24-hour window.

### Calculation Logic:
1. **Normalization:** The system extracts the local year, month, and day of both the current date (`todayLocal`) and the plan's starting date (`planStartDateLocal`), setting their time components to `00:00:00` local time.
2. **Elapsed Days Difference:**
   $$\text{Days Passed} = \text{Math.max}\left(1, \text{Math.round}\left(\frac{\text{todayLocal} - \text{planStartDateLocal}}{1000 \times 60 \times 60 \times 24}\right) + 1\right)$$
3. **Behavior:**
   * **Day 1:** Starts the moment you create the plan (e.g. July 11th from 12:00 AM to 11:59 PM).
   * **Day 2:** Begins exactly at **12:00 AM midnight local time** on the next calendar day (July 12th).
   * **Day 3:** Begins at **12:00 AM midnight local time** on July 13th.
   * This ensures your daily study assignment rolls over at midnight local time, regardless of what hour of the day you study.

