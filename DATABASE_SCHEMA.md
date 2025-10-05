# Database Schema

## Tables

### verses
- id: INTEGER PRIMARY KEY
- book: TEXT
- chapter: INTEGER
- verse_number: INTEGER
- text: TEXT
- translation: TEXT (KJV, NIV, ESV, etc.)
- created_at: TIMESTAMP

### user_verses
- id: INTEGER PRIMARY KEY
- verse_id: INTEGER (FK)
- mastery_level: INTEGER (0-5)
- last_reviewed: TIMESTAMP
- next_review: TIMESTAMP
- times_practiced: INTEGER
- consecutive_correct: INTEGER

### practice_sessions
- id: INTEGER PRIMARY KEY
- verse_id: INTEGER (FK)
- practice_type: TEXT (fill_blank, multiple_choice, typing, audio)
- correct: BOOLEAN
- time_taken: INTEGER (seconds)
- created_at: TIMESTAMP

### user_progress
- id: INTEGER PRIMARY KEY
- total_xp: INTEGER
- level: INTEGER
- current_streak: INTEGER
- longest_streak: INTEGER
- last_practice_date: DATE
- freeze_days: INTEGER

### achievements
- id: INTEGER PRIMARY KEY
- name: TEXT
- description: TEXT
- icon: TEXT
- requirement: TEXT
- unlocked: BOOLEAN
- unlocked_at: TIMESTAMP

### collections
- id: INTEGER PRIMARY KEY
- name: TEXT
- description: TEXT
- created_at: TIMESTAMP

### collection_verses
- collection_id: INTEGER (FK)
- verse_id: INTEGER (FK)
