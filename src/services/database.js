import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('scripture_mastery.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      text TEXT NOT NULL,
      translation TEXT DEFAULT 'NKJV',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id INTEGER NOT NULL,
      mastery_level INTEGER DEFAULT 0,
      last_reviewed TIMESTAMP,
      next_review TIMESTAMP,
      times_practiced INTEGER DEFAULT 0,
      consecutive_correct INTEGER DEFAULT 0,
      FOREIGN KEY (verse_id) REFERENCES verses(id)
    );

    CREATE TABLE IF NOT EXISTS practice_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id INTEGER NOT NULL,
      practice_type TEXT NOT NULL,
      correct BOOLEAN NOT NULL,
      time_taken INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (verse_id) REFERENCES verses(id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_practice_date DATE,
      freeze_days INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      requirement TEXT NOT NULL,
      unlocked BOOLEAN DEFAULT 0,
      unlocked_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS collection_verses (
      collection_id INTEGER NOT NULL,
      verse_id INTEGER NOT NULL,
      FOREIGN KEY (collection_id) REFERENCES collections(id),
      FOREIGN KEY (verse_id) REFERENCES verses(id),
      PRIMARY KEY (collection_id, verse_id)
    );
  `);

  // Initialize user progress if not exists
  const progressCount = db.getFirstSync('SELECT COUNT(*) as count FROM user_progress');
  if (progressCount.count === 0) {
    db.runSync('INSERT INTO user_progress (total_xp, level) VALUES (0, 1)');
  }

  // Initialize achievements
  const achievementsCount = db.getFirstSync('SELECT COUNT(*) as count FROM achievements');
  if (achievementsCount.count === 0) {
    const achievements = [
      { name: 'First Steps', description: 'Complete your first practice session', icon: 'star', requirement: 'practice_1' },
      { name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'fire', requirement: 'streak_7' },
      { name: 'Memory Master', description: 'Reach mastery level 5 on any verse', icon: 'trophy', requirement: 'mastery_5' },
      { name: 'Romans Scholar', description: 'Complete all of Romans', icon: 'book', requirement: 'book_romans' },
      { name: 'Centurion', description: 'Practice 100 verses', icon: 'medal', requirement: 'practice_100' },
    ];

    achievements.forEach(ach => {
      db.runSync(
        'INSERT INTO achievements (name, description, icon, requirement) VALUES (?, ?, ?, ?)',
        [ach.name, ach.description, ach.icon, ach.requirement]
      );
    });
  }
};

// Verse operations
export const addVerse = (book, chapter, verseNumber, text, translation = 'NKJV') => {
  const result = db.runSync(
    'INSERT INTO verses (book, chapter, verse_number, text, translation) VALUES (?, ?, ?, ?, ?)',
    [book, chapter, verseNumber, text, translation]
  );

  // Add to user_verses for tracking
  db.runSync(
    'INSERT INTO user_verses (verse_id, next_review) VALUES (?, datetime("now"))',
    [result.lastInsertRowId]
  );

  return result.lastInsertRowId;
};

export const getAllVerses = () => {
  return db.getAllSync(`
    SELECT v.*, uv.mastery_level, uv.times_practiced, uv.next_review
    FROM verses v
    LEFT JOIN user_verses uv ON v.id = uv.verse_id
    ORDER BY v.book, v.chapter, v.verse_number
  `);
};

export const getVersesDueForReview = () => {
  return db.getAllSync(`
    SELECT v.*, uv.mastery_level, uv.times_practiced
    FROM verses v
    INNER JOIN user_verses uv ON v.id = uv.verse_id
    WHERE datetime(uv.next_review) <= datetime('now')
    ORDER BY RANDOM()
    LIMIT 10
  `);
};

// Practice session operations
export const recordPracticeSession = (verseId, practiceType, correct, timeTaken) => {
  db.runSync(
    'INSERT INTO practice_sessions (verse_id, practice_type, correct, time_taken) VALUES (?, ?, ?, ?)',
    [verseId, practiceType, correct ? 1 : 0, timeTaken]
  );

  // Update user_verses
  const userVerse = db.getFirstSync('SELECT * FROM user_verses WHERE verse_id = ?', [verseId]);

  const newConsecutive = correct ? (userVerse.consecutive_correct + 1) : 0;
  const newMastery = Math.min(5, correct ? Math.floor(newConsecutive / 3) : Math.max(0, userVerse.mastery_level - 1));
  const nextReview = calculateNextReview(newMastery);

  db.runSync(`
    UPDATE user_verses
    SET mastery_level = ?,
        consecutive_correct = ?,
        times_practiced = times_practiced + 1,
        last_reviewed = datetime('now'),
        next_review = ?
    WHERE verse_id = ?
  `, [newMastery, newConsecutive, nextReview, verseId]);

  // Award XP
  const xpGained = correct ? (10 + newMastery * 5) : 5;
  updateUserProgress(xpGained);

  return { xpGained, newMastery };
};

// Spaced repetition algorithm
const calculateNextReview = (masteryLevel) => {
  const intervals = [0, 1, 3, 7, 14, 30]; // days
  const days = intervals[masteryLevel] || 30;
  return `datetime('now', '+${days} days')`;
};

// User progress operations
export const getUserProgress = () => {
  return db.getFirstSync('SELECT * FROM user_progress WHERE id = 1');
};

export const updateUserProgress = (xpGained) => {
  const progress = getUserProgress();
  const newXP = progress.total_xp + xpGained;
  const newLevel = Math.floor(newXP / 100) + 1;

  // Check streak
  const today = new Date().toISOString().split('T')[0];
  const lastPractice = progress.last_practice_date;
  let newStreak = progress.current_streak;

  if (lastPractice !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastPractice === yesterday) {
      newStreak += 1;
    } else if (progress.freeze_days > 0) {
      db.runSync('UPDATE user_progress SET freeze_days = freeze_days - 1 WHERE id = 1');
    } else {
      newStreak = 1;
    }
  }

  const longestStreak = Math.max(progress.longest_streak, newStreak);

  db.runSync(`
    UPDATE user_progress
    SET total_xp = ?,
        level = ?,
        current_streak = ?,
        longest_streak = ?,
        last_practice_date = ?
    WHERE id = 1
  `, [newXP, newLevel, newStreak, longestStreak, today]);

  checkAchievements();
};

// Achievements
export const checkAchievements = () => {
  const progress = getUserProgress();
  const totalPractices = db.getFirstSync('SELECT COUNT(*) as count FROM practice_sessions').count;
  const maxMastery = db.getFirstSync('SELECT MAX(mastery_level) as max FROM user_verses').max || 0;

  const achievements = [
    { requirement: 'practice_1', condition: totalPractices >= 1 },
    { requirement: 'streak_7', condition: progress.current_streak >= 7 },
    { requirement: 'mastery_5', condition: maxMastery >= 5 },
    { requirement: 'practice_100', condition: totalPractices >= 100 },
  ];

  achievements.forEach(({ requirement, condition }) => {
    if (condition) {
      db.runSync(`
        UPDATE achievements
        SET unlocked = 1, unlocked_at = datetime('now')
        WHERE requirement = ? AND unlocked = 0
      `, [requirement]);
    }
  });
};

export const getAchievements = () => {
  return db.getAllSync('SELECT * FROM achievements ORDER BY unlocked DESC, id');
};

// Statistics
export const getStatistics = () => {
  const totalVerses = db.getFirstSync('SELECT COUNT(*) as count FROM verses').count;
  const masteredVerses = db.getFirstSync('SELECT COUNT(*) as count FROM user_verses WHERE mastery_level >= 4').count;
  const totalPractices = db.getFirstSync('SELECT COUNT(*) as count FROM practice_sessions').count;
  const accuracy = db.getFirstSync(`
    SELECT
      CAST(SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100 as accuracy
    FROM practice_sessions
  `).accuracy || 0;

  return {
    totalVerses,
    masteredVerses,
    totalPractices,
    accuracy: Math.round(accuracy),
  };
};

export default db;
