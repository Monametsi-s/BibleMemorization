import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const HomeScreen = ({ navigation }) => {
  const { userProgress, statistics, loading } = useApp();

  if (loading || !userProgress || !statistics) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const xpToNextLevel = (userProgress.level * 100) - userProgress.total_xp;
  const xpProgress = (userProgress.total_xp % 100) / 100;

  return (
    <ScrollView style={styles.container}>
      {/* Header with Level and Streak */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.level}>Level {userProgress.level}</Text>
          </View>
          <View style={styles.streakContainer}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{userProgress.current_streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        <View style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpText}>{userProgress.total_xp % 100} / 100 XP</Text>
            <Text style={styles.xpNextLevel}>{xpToNextLevel} to next level</Text>
          </View>
          <ProgressBar
            progress={xpProgress}
            color="#fff"
            style={styles.xpBar}
          />
        </View>
      </LinearGradient>

      {/* Daily Practice Button */}
      <Card style={styles.practiceCard}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.practiceGradient}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Practice')}
            style={styles.practiceButton}
          >
            <Text style={styles.practiceIcon}>📖</Text>
            <Text style={styles.practiceTitle}>Start Daily Practice</Text>
            <Text style={styles.practiceSubtitle}>10 verses ready to review</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Card>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{statistics.totalVerses}</Text>
            <Text style={styles.statLabel}>Total Verses</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{statistics.masteredVerses}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{statistics.accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{userProgress.longest_streak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Library')}
        >
          <Text style={styles.actionIcon}>📚</Text>
          <Text style={styles.actionText}>My Verses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Progress')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Text style={styles.actionIcon}>🏆</Text>
          <Text style={styles.actionText}>Achievements</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Goal */}
      <Card style={styles.goalCard}>
        <Card.Content>
          <Text style={styles.goalTitle}>Daily Goal</Text>
          <Text style={styles.goalDescription}>
            Practice 10 verses to maintain your streak!
          </Text>
          <ProgressBar
            progress={0.6}
            color="#6366f1"
            style={styles.goalProgress}
          />
          <Text style={styles.goalProgressText}>6 / 10 verses completed today</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

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
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  level: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 32,
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  xpContainer: {
    marginTop: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpNextLevel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  xpBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  practiceCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  practiceGradient: {
    padding: 24,
  },
  practiceButton: {
    alignItems: 'center',
  },
  practiceIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  practiceSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  goalCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  goalProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
