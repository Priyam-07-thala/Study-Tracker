# Study Tracker: Completion Estimation Logics

This document explains the core logic, formulas, and code snippets behind the two different completion estimation systems inside the Study Tracker application, along with a detailed comparative example.

---

## 1. Progress Chart Prediction Logic
* **Location in Code:** [progress_service.py](file:///c:/Users/User/Desktop/study-tracker2/study-tracker/backend/app/services/progress_service.py) (`_predict_completion` function)
* **Underlying Metric:** **Lecture count/completion percentage over time** (ignoring lecture durations).

### Mathematical Formula
1. **Calculate Daily Progress Rate (Velocity):**
   $$\text{Daily Rate (\%)} = \frac{\text{Latest Completion \%} - \text{Completion \% from 7 days ago}}{\text{Days Elapsed Between Snapshots}}$$

2. **Calculate Days Needed:**
   $$\text{Days Needed} = \frac{100\% - \text{Current Completion \%}}{\text{Daily Rate}}$$

3. **Estimate Date:**
   $$\text{Estimated Completion Date} = \text{Today} + \text{Days Needed}$$

### Python Code Logic
```python
def _predict_completion(snapshots, current_pct: float) -> date | None:
    if current_pct >= 100.0 or len(snapshots) < 2:
        return None
        
    # Look at the last 7 daily snapshots
    recent = snapshots[-7:]
    if len(recent) < 2:
        return None
        
    first = recent[0]
    last = recent[-1]
    
    # Calculate how many days passed between first and last snapshot
    days_elapsed = (last.snapshot_date - first.snapshot_date).days
    if days_elapsed == 0:
        return None
        
    # Calculate percentage gained
    pct_gained = last.completion_percentage - first.completion_percentage
    daily_rate = pct_gained / days_elapsed
    
    # If progress is negative or zero, we cannot estimate
    if daily_rate <= 0:
        return None
        
    remaining_pct = 100.0 - current_pct
    days_needed = remaining_pct / daily_rate
    
    return date.today() + timedelta(days=int(days_needed))
```

---

## 2. Study Planner Prediction Logic
* **Location in Code:** [plan_service.py](file:///c:/Users/User/Desktop/study-tracker2/study-tracker/backend/app/services/plan_service.py) (`get_plan_status` function)
* **Underlying Metric:** **Study hours / video duration** (incorporating video length and planned study hours limit).

### Mathematical Formula
1. **Calculate Average Daily Study Time (seconds/day):**
   $$\text{Daily Study Speed (sec/day)} = \frac{\text{Total seconds of completed lectures}}{\text{Days since study plan started}}$$
   * *Fallback:* If no study has occurred yet, it defaults to:
     $$\text{Daily Study Speed} = \text{Planned Hours Per Day} \times 3600 \text{ seconds}$$

2. **Calculate Remaining Video Duration:**
   $$\text{Remaining Duration (sec)} = \text{Total duration of all lectures} - \text{Duration of completed lectures}$$

3. **Calculate Days Needed:**
   $$\text{Days Needed} = \frac{\text{Remaining Duration}}{\text{Daily Study Speed}}$$

4. **Estimate Date:**
   $$\text{Estimated Completion Date} = \text{Today} + \text{Days Needed}$$

### Python Code Logic
```python
# Calculate actual duration of completed lectures
completed_lectures = db.scalars(
    select(Lecture).where(Lecture.subject_id == subject_id, Lecture.completed == True)
).all()
actual_duration = sum(l.duration or 0 for l in completed_lectures)

# Calculate elapsed days
days_passed = (date.today() - plan.start_date).days + 1
if days_passed < 1:
    days_passed = 1

# Calculate average daily study rate
avg_time_per_day_seconds = actual_duration / days_passed

# Calculate total and remaining plan duration
total_duration = sum(d.total_duration for d in plan.days)
remaining_duration = total_duration - actual_duration

# Determine velocity
if actual_duration == 0 or avg_time_per_day_seconds == 0:
    # If no progress yet, fall back to target plan speed
    daily_speed = plan.hours_per_day * 3600
else:
    daily_speed = avg_time_per_day_seconds

# Calculate remaining days
if remaining_duration <= 0:
    estimated_completion_date = date.today()
else:
    remaining_days = int(remaining_duration / daily_speed) if daily_speed > 0 else 0
    estimated_completion_date = date.today() + timedelta(days=remaining_days)
```

---

## 3. Detailed Comparative Example

Let's assume a student has a subject with **10 lectures** containing an uneven distribution of durations:
* **Lectures 1 to 5:** Short videos (5 minutes each $\rightarrow$ total of **25 minutes / 1,500 seconds**).
* **Lectures 6 to 10:** Long videos (1 hour each $\rightarrow$ total of **5 hours / 18,000 seconds**).
* **Total Course Length:** 5 hours and 25 minutes (19,500 seconds).
* **Planner Target Settings:** **2 hours per day** study plan.

The student starts their study plan on **Day 1** and completes all **5 short videos** on that same day.

### Prediction Case A: Progress Chart
* **Inputs:**
  * Total lectures = 10, Completed = 5 (Current Completion: **50%**).
  * Snapshots: 
    * Day 1 Start: 0%
    * Day 1 End: 50%
  * Elapsed Days between snapshots = 1 day.
* **Calculation:**
  * Daily Rate = $\frac{50\% - 0\%}{1 \text{ day}} = 50\% \text{ per day}$.
  * Remaining Progress = $100\% - 50\% = 50\%$.
  * Days Needed = $\frac{50\%}{50\% \text{/day}} = \mathbf{1 \text{ day}}$.
* **Est. Completion:** **Tomorrow** (1 day from now).

---

### Prediction Case B: Study Planner
* **Inputs:**
  * Total duration = 19,500 seconds.
  * Completed duration = 1,500 seconds (25 minutes).
  * Remaining duration = $19,500 - 1,500 = 18,000 \text{ seconds (5 hours)}$.
  * Days passed = 1 day.
* **Calculation:**
  * Daily Speed = $\frac{1,500 \text{ seconds}}{1 \text{ day}} = 1,500 \text{ seconds per day (25 mins/day)}$.
  * Days Needed = $\frac{18,000 \text{ seconds (remaining)}}{1,500 \text{ seconds/day (velocity)}} = \mathbf{12 \text{ days}}$.
* **Est. Completion:** **12 days from now**.

---

### Summary of Differences
* **The Progress Chart** assumes all lectures are equal. It predicts you will finish the remaining 5 long lectures just as fast as the 5 short ones (in **1 day**).
* **The Study Planner** realizes that the remaining 5 lectures are much longer (5 hours total) than the 25 minutes you did today. Based on your actual velocity of 25 minutes of video watched per day, it correctly predicts you will need **12 days** to finish the rest.
