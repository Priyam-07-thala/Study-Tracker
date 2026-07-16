-- Study Tracker - MySQL Schema
-- SQLAlchemy auto-creates these on startup via Base.metadata.create_all()
-- Run manually only if needed

CREATE DATABASE IF NOT EXISTS study_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE study_tracker;

CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    password    VARCHAR(100) NOT NULL DEFAULT 'demo',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB;

INSERT IGNORE INTO users (id, username, password) VALUES (1, 'demo', 'demo');

CREATE TABLE IF NOT EXISTS subjects (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    is_paused   TINYINT(1) NOT NULL DEFAULT 0,
    paused_at   DATETIME,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subjects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lectures (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    subject_id      INT NOT NULL,
    title           VARCHAR(500) NOT NULL,
    video_id        VARCHAR(50) NOT NULL,
    lecture_order   INT NOT NULL,
    duration        INT NOT NULL DEFAULT 0,
    completed       TINYINT(1) NOT NULL DEFAULT 0,
    completed_at    DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lectures_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT uq_subject_video UNIQUE (subject_id, video_id),
    INDEX ix_lectures_subject_id (subject_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS progress_snapshots (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    subject_id              INT NOT NULL,
    snapshot_date           DATE NOT NULL,
    completion_percentage   FLOAT NOT NULL,
    CONSTRAINT fk_progress_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT uq_subject_date UNIQUE (subject_id, snapshot_date),
    INDEX ix_progress_subject_date (subject_id, snapshot_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS study_plans (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    subject_id      INT NOT NULL,
    hours_per_day   FLOAT NOT NULL,
    start_date      DATE NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_plans_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY uq_study_plans_subject (subject_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS study_plan_days (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    plan_id         INT NOT NULL,
    day_number      INT NOT NULL,
    lecture_ids     JSON NOT NULL,
    total_duration  INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_study_plan_days_plan FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
    UNIQUE KEY uq_plan_day (plan_id, day_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS daily_goals (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL DEFAULT 1,
    title       VARCHAR(500) NOT NULL,
    completed   TINYINT(1) NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_daily_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_notes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT NOT NULL,
    title       VARCHAR(500) NOT NULL,
    content     TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_notes_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT NOT NULL,
    role        VARCHAR(50) NOT NULL,
    content     TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_chat_messages_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lecture_bookmarks (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    lecture_id  INT NOT NULL,
    timestamp   INT NOT NULL,
    note        VARCHAR(500) NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lecture_bookmarks_lecture FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
) ENGINE=InnoDB;

