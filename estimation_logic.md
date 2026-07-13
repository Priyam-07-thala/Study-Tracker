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

When generating a study plan, the application partitions lectures into balanced daily study blocks using one of two algorithms:

### Algorithm A: Greedy Packing (Based on Hours per Day)
Used when the student selects a **Target Study Hours/Day** constraint (e.g., 2 hours/day).
* **Logic:** Sequentially adds lectures to "Day 1". If adding the next lecture exceeds the user's daily study duration limit, the algorithm seals "Day 1" and starts packing "Day 2".

```python
hours_per_day = hours_per_day or 2.0
max_seconds_per_day = int(hours_per_day * 3600)

day_lectures = []
current_day = []
current_duration = 0

for lecture in lectures:
    duration = lecture.duration or 0
    # If adding this video exceeds the daily target limit, create a new day
    if current_duration + duration > max_seconds_per_day and current_day:
        day_lectures.append(current_day)
        current_day = []
        current_duration = 0
    current_day.append(lecture)
    current_duration += duration
if current_day:
    day_lectures.append(current_day)
```

### Algorithm B: Balanced Load Partitioning (Based on Target Days Count)
Used when the student selects a **Total Target Days** constraint (e.g., finish the subject in exactly 7 days).
* **Objective:** Find partition lines that split the lectures into $D$ days so that the daily study load is as balanced and close to the mathematical average as possible.
* **Logic:** 
  1. Computes the total course duration ($T$) and calculates the target average daily study duration: $\text{Target Avg} = T / D$.
  2. Creates a cumulative sum array of lecture durations.
  3. Uses a optimization pass to find partition boundary indices ($0 \dots N$) where the cumulative sum is closest to multiples of the daily target average ($d \times \text{Target Avg}$).

```python
target_avg = total_duration / D
cum = [0] * (N + 1)
for i in range(N):
    cum[i + 1] = cum[i] + durations[i]

partition_ends = []
idx = 0
for d in range(1, D):
    target_cum = d * target_avg
    best_end = idx + 1
    min_diff = float('inf')
    
    # Locate the lecture boundary index that gets closest to the target load
    for end in range(idx + 1, N - D + d + 1):
        diff = abs(cum[end] - target_cum)
        if diff < min_diff:
            min_diff = diff
            best_end = end
            
    partition_ends.append(best_end)
    idx = best_end
partition_ends.append(N)
```

---

## 3. Adaptive Planning (Adjust Plan Logic)
* **Location in Code:** [plan_service.py](file:///c:/Users/User/Desktop/study-tracker2/study-tracker/backend/app/services/plan_service.py) (`adjust_plan` function)

If a student falls behind schedule (creating a negative deviation), they can click **Adjust Schedule**.
* **Logic:** Instead of forcing the student to study extra hours to catch up, the system recalculates the plan. It gathers all **uncompleted lectures**, resets the start date of the plan to **today**, and runs the partitioning algorithm again starting with Day 1. This redistributes the remaining load gracefully over the remaining time.

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
