import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { getVersesDueForReview } from '../services/database';
import { getAdaptiveGameRecommendation } from '../services/memoryHealthService';

const HomeScreen = ({ navigation }) => {
  const { userProgress, statistics, loading, refreshData } = useApp();
  const [recommendedGame, setRecommendedGame] = useState(null);
  const [dueVerses, setDueVerses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const verses = getVersesDueForReview();
    setDueVerses(verses);

    if (verses.length > 0) {
      const recommendation = getAdaptiveGameRecommendation(verses[0]);
      setRecommendedGame(recommendation);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    loadData();
    setRefreshing(false);
  };

  if (loading || !userProgress || !statistics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  const xpToNextLevel = (userProgress.level * 100) - userProgress.total_xp;
  const xpProgress = (userProgress.total_xp % 100) / 100;

  const getGameInfo = (gameName) => {
    const gameMap = {
      'TapToReveal': { name: 'Tap to Reveal', icon: '👆', color: ['#6366f1', '#8b5cf6'] },
      'ListenGame': { name: 'Listen', icon: '🔊', color: ['#8b5cf6', '#ec4899'] },
      'ReorderGame': { name: 'Reorder Words', icon: '🔄', color: ['#ec4899', '#f43f5e'] },
      'TypeFirstLetter': { name: 'Type First Letter', icon: '⌨️', color: ['#6366f1', '#8b5cf6'] },
      'WordBank': { name: 'Word Bank', icon: '📝', color: ['#f43f5e', '#fb923c'] },
      'SpeakOut': { name: 'Speak Out', icon: '🎤', color: ['#14b8a6', '#06b6d4'] },
    };
    return gameMap[gameName] || { name: gameName, icon: '🎯', color: ['#6366f1', '#8b5cf6'] };
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
      }
    >
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

      {/* Recommended Game Card */}
      {recommendedGame && dueVerses.length > 0 && (
        <Card style={styles.recommendedCard}>
          <LinearGradient
            colors={getGameInfo(recommendedGame.primaryGame).color}
            style={styles.recommendedGradient}
          >
            <TouchableOpacity
              onPress={() => {
                const gameInfo = getGameInfo(recommendedGame.primaryGame);
                navigation.navigate(recommendedGame.primaryGame, {
                  verse: dueVerses[0],
                  verses: dueVerses,
                });
              }}
              style={styles.recommendedButton}
            >
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedBadgeText}>RECOMMENDED FOR YOU</Text>
              </View>
              <Text style={styles.recommendedIcon}>
                {getGameInfo(recommendedGame.primaryGame).icon}
              </Text>
              <Text style={styles.recommendedTitle}>
                {getGameInfo(recommendedGame.primaryGame).name}
              </Text>
              <Text style={styles.recommendedSubtitle}>
                {recommendedGame.phase} Phase • {dueVerses.length} verses ready
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Card>
      )}

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
            <Text style={styles.practiceTitle}>Choose a Game</Text>
            <Text style={styles.practiceSubtitle}>{dueVerses.length} verses ready to review</Text>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 100,
    justifyContent: 'center',
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
  recommendedCard: {
    margin: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  recommendedGradient: {
    padding: 24,
  },
  recommendedButton: {
    alignItems: 'center',
  },
  recommendedBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  recommendedBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  recommendedIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  recommendedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  recommendedSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.95,
  },
});

export default HomeScreen;
