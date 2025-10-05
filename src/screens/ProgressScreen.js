import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
  const { userProgress, statistics } = useApp();

  if (!userProgress || !statistics) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const xpProgress = (userProgress.total_xp % 100) / 100;

  return (
    <ScrollView style={styles.container}>
      {/* Level Progress Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Level Progress</Text>
          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{userProgress.level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.xpText}>
                {userProgress.total_xp % 100} / 100 XP
              </Text>
              <ProgressBar
                progress={xpProgress}
                color="#6366f1"
                style={styles.progressBar}
              />
              <Text style={styles.nextLevelText}>
                {100 - (userProgress.total_xp % 100)} XP to Level {userProgress.level + 1}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Streak Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Streak Statistics</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakValue}>{userProgress.current_streak}</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakIcon}>⭐</Text>
              <Text style={styles.streakValue}>{userProgress.longest_streak}</Text>
              <Text style={styles.streakLabel}>Longest Streak</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakIcon}>❄️</Text>
              <Text style={styles.streakValue}>{userProgress.freeze_days}</Text>
              <Text style={styles.streakLabel}>Freeze Days</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Mastery Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Mastery Overview</Text>
          <View style={styles.masteryContainer}>
            <View style={styles.masteryRow}>
              <Text style={styles.masteryLabel}>Total Verses</Text>
              <Text style={styles.masteryValue}>{statistics.totalVerses}</Text>
            </View>
            <View style={styles.masteryRow}>
              <Text style={styles.masteryLabel}>Mastered Verses</Text>
              <Text style={[styles.masteryValue, { color: '#10b981' }]}>
                {statistics.masteredVerses}
              </Text>
            </View>
            <ProgressBar
              progress={statistics.totalVerses > 0 ? statistics.masteredVerses / statistics.totalVerses : 0}
              color="#10b981"
              style={styles.progressBar}
            />
            <Text style={styles.percentageText}>
              {statistics.totalVerses > 0
                ? Math.round((statistics.masteredVerses / statistics.totalVerses) * 100)
                : 0}% Complete
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Performance Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Performance</Text>
          <View style={styles.performanceContainer}>
            <View style={styles.performanceItem}>
              <View style={[styles.performanceCircle, { backgroundColor: '#6366f1' }]}>
                <Text style={styles.performanceValue}>{statistics.accuracy}%</Text>
              </View>
              <Text style={styles.performanceLabel}>Accuracy</Text>
            </View>
            <View style={styles.performanceItem}>
              <View style={[styles.performanceCircle, { backgroundColor: '#8b5cf6' }]}>
                <Text style={styles.performanceValue}>{statistics.totalPractices}</Text>
              </View>
              <Text style={styles.performanceLabel}>Total Practices</Text>
            </View>
            <View style={styles.performanceItem}>
              <View style={[styles.performanceCircle, { backgroundColor: '#ec4899' }]}>
                <Text style={styles.performanceValue}>{userProgress.total_xp}</Text>
              </View>
              <Text style={styles.performanceLabel}>Total XP</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Milestones */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Upcoming Milestones</Text>
          <View style={styles.milestoneContainer}>
            <MilestoneItem
              icon="🎯"
              title="Next Level"
              progress={(userProgress.total_xp % 100) / 100}
              current={userProgress.total_xp % 100}
              target={100}
            />
            <MilestoneItem
              icon="🏆"
              title="100 Practices"
              progress={statistics.totalPractices / 100}
              current={statistics.totalPractices}
              target={100}
            />
            <MilestoneItem
              icon="📚"
              title="50 Verses Mastered"
              progress={statistics.masteredVerses / 50}
              current={statistics.masteredVerses}
              target={50}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const MilestoneItem = ({ icon, title, progress, current, target }) => (
  <View style={styles.milestoneItem}>
    <View style={styles.milestoneHeader}>
      <Text style={styles.milestoneIcon}>{icon}</Text>
      <View style={styles.milestoneInfo}>
        <Text style={styles.milestoneTitle}>{title}</Text>
        <Text style={styles.milestoneProgress}>
          {Math.min(current, target)} / {target}
        </Text>
      </View>
    </View>
    <ProgressBar
      progress={Math.min(progress, 1)}
      color={progress >= 1 ? '#10b981' : '#6366f1'}
      style={styles.milestoneBar}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 0,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelInfo: {
    flex: 1,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  nextLevelText: {
    fontSize: 12,
    color: '#666',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  masteryContainer: {
    paddingVertical: 8,
  },
  masteryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  masteryLabel: {
    fontSize: 16,
    color: '#666',
  },
  masteryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  milestoneContainer: {
    paddingVertical: 8,
  },
  milestoneItem: {
    marginBottom: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  milestoneProgress: {
    fontSize: 14,
    color: '#666',
  },
  milestoneBar: {
    height: 8,
    borderRadius: 4,
  },
});

export default ProgressScreen;
