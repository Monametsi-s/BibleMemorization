import db from './database';

// Memory Health Service - Tracks retention and provides adaptive learning insights

export const calculateMemoryHealth = (verseId) => {
  // Get practice history for this verse
  const sessions = db.getAllSync(
    `SELECT * FROM practice_sessions WHERE verse_id = ? ORDER BY created_at DESC LIMIT 10`,
    [verseId]
  );

  if (sessions.length === 0) {
    return { score: 0, status: 'new', recommendation: 'Start practicing this verse' };
  }

  // Calculate success rate
  const successRate = sessions.filter(s => s.correct).length / sessions.length;

  // Check timing of reviews (spaced repetition adherence)
  const userVerse = db.getFirstSync('SELECT * FROM user_verses WHERE verse_id = ?', [verseId]);
  const lastReviewed = new Date(userVerse.last_reviewed);
  const nextReview = new Date(userVerse.next_review);
  const now = new Date();

  const isOnSchedule = now >= nextReview;
  const daysSinceReview = Math.floor((now - lastReviewed) / (1000 * 60 * 60 * 24));

  // Calculate memory health score (0-100)
  let score = successRate * 50; // 50% weight on success rate

  // Add points for consistency
  if (userVerse.consecutive_correct >= 3) score += 20;
  if (userVerse.times_practiced >= 5) score += 10;

  // Deduct points for overdue reviews
  if (!isOnSchedule && daysSinceReview > 7) {
    score -= 20;
  }

  // Add points for proper spacing
  if (isOnSchedule && daysSinceReview <= 2) {
    score += 20;
  }

  score = Math.max(0, Math.min(100, score));

  // Determine status
  let status = 'weak';
  if (score >= 80) status = 'strong';
  else if (score >= 60) status = 'good';
  else if (score >= 40) status = 'fair';

  // Generate recommendation
  let recommendation = '';
  if (score < 40) {
    recommendation = 'Practice more frequently with Absorb games';
  } else if (score < 60) {
    recommendation = 'Continue with Memorize games to strengthen recall';
  } else if (score < 80) {
    recommendation = 'Use Recall games to test your memory';
  } else {
    recommendation = 'Excellent! Try Mastery games to perfect it';
  }

  return {
    score: Math.round(score),
    status,
    recommendation,
    successRate: Math.round(successRate * 100),
    daysSinceReview,
    isOnSchedule,
  };
};

export const getOverallMemoryHealth = () => {
  const allVerses = db.getAllSync('SELECT * FROM user_verses');

  if (allVerses.length === 0) {
    return {
      averageScore: 0,
      totalVerses: 0,
      strongVerses: 0,
      weakVerses: 0,
      needsReview: 0,
    };
  }

  let totalScore = 0;
  let strongCount = 0;
  let weakCount = 0;
  let needsReviewCount = 0;

  allVerses.forEach(verse => {
    const health = calculateMemoryHealth(verse.verse_id);
    totalScore += health.score;

    if (health.score >= 80) strongCount++;
    if (health.score < 40) weakCount++;
    if (!health.isOnSchedule) needsReviewCount++;
  });

  return {
    averageScore: Math.round(totalScore / allVerses.length),
    totalVerses: allVerses.length,
    strongVerses: strongCount,
    weakVerses: weakCount,
    needsReview: needsReviewCount,
  };
};

export const getAdaptiveGameRecommendation = (verse) => {
  const health = calculateMemoryHealth(verse.id);
  const masteryLevel = verse.mastery_level || 0;

  // Recommend games based on memory health and mastery
  if (health.score < 40 || masteryLevel === 0) {
    // Absorb phase
    return {
      primaryGame: 'TapToReveal',
      secondaryGame: 'ListenGame',
      phase: 'Absorb',
    };
  } else if (health.score < 60 || masteryLevel < 2) {
    // Memorize phase
    return {
      primaryGame: 'ReorderGame',
      secondaryGame: 'TypeFirstLetter',
      phase: 'Memorize',
    };
  } else if (health.score < 80 || masteryLevel < 4) {
    // Recall phase
    return {
      primaryGame: 'WordBank',
      secondaryGame: 'TypeFirstLetter',
      phase: 'Recall',
    };
  } else {
    // Mastery phase
    return {
      primaryGame: 'SpeakOut',
      secondaryGame: 'WordBank',
      phase: 'Mastery',
    };
  }
};

export const trackPracticePattern = (userId = 1) => {
  // Analyze practice patterns over time
  const last30Days = db.getAllSync(`
    SELECT
      DATE(created_at) as practice_date,
      COUNT(*) as session_count,
      SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) as correct_count
    FROM practice_sessions
    WHERE created_at >= datetime('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY practice_date DESC
  `);

  const totalSessions = last30Days.reduce((sum, day) => sum + day.session_count, 0);
  const avgSessionsPerDay = totalSessions / 30;
  const activeDays = last30Days.length;

  // Calculate consistency score
  const consistencyScore = Math.min(100, (activeDays / 30) * 100);

  // Find best practice time (would need more data in real implementation)
  const bestPracticeTime = 'Morning'; // Placeholder

  return {
    totalSessions,
    avgSessionsPerDay: Math.round(avgSessionsPerDay * 10) / 10,
    activeDays,
    consistencyScore: Math.round(consistencyScore),
    bestPracticeTime,
    recentPattern: last30Days.slice(0, 7),
  };
};

export const getRetentionCurve = (verseId) => {
  // Get practice sessions with timestamps
  const sessions = db.getAllSync(`
    SELECT
      correct,
      created_at,
      practice_type
    FROM practice_sessions
    WHERE verse_id = ?
    ORDER BY created_at ASC
  `, [verseId]);

  if (sessions.length === 0) {
    return { dataPoints: [], trend: 'insufficient_data' };
  }

  // Calculate retention at each point
  const dataPoints = sessions.map((session, index) => {
    const recentSessions = sessions.slice(Math.max(0, index - 4), index + 1);
    const retentionRate = recentSessions.filter(s => s.correct).length / recentSessions.length;

    return {
      timestamp: session.created_at,
      retention: Math.round(retentionRate * 100), 
      correct: session.correct,
    };
  });

  // Determine trend
  const recentRetention = dataPoints.slice(-3).reduce((sum, p) => sum + p.retention, 0) / 3;
  const olderRetention = dataPoints.slice(0, 3).reduce((sum, p) => sum + p.retention, 0) / 3;

  let trend = 'stable';
  if (recentRetention > olderRetention + 10) trend = 'improving';
  else if (recentRetention < olderRetention - 10) trend = 'declining';

  return { dataPoints, trend };
};

export const suggestNextReviewTime = (verse) => {
  const masteryLevel = verse.mastery_level || 0;
  const health = calculateMemoryHealth(verse.id);

  // Adjust review interval based on health
  let baseIntervals = [0, 1, 3, 7, 14, 30]; // days per mastery level

  if (health.score < 40) {
    // Struggling - shorten intervals
    baseIntervals = baseIntervals.map(i => Math.max(0, Math.floor(i * 0.5)));
  } else if (health.score > 80) {
    // Strong - can extend intervals
    baseIntervals = baseIntervals.map(i => Math.floor(i * 1.5));
  }

  const interval = baseIntervals[masteryLevel] || 30;
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    interval,
    nextReviewDate: nextReviewDate.toISOString(),
    reason: health.score < 40 ? 'Needs frequent practice' :
            health.score > 80 ? 'Strong retention' : 'Standard interval',
  };
};

export default {
  calculateMemoryHealth,
  getOverallMemoryHealth,
  getAdaptiveGameRecommendation,
  trackPracticePattern,
  getRetentionCurve,
  suggestNextReviewTime,
};
