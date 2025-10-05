import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card } from 'react-native-paper';
import { useApp } from '../context/AppContext';

const AchievementsScreen = () => {
  const { achievements } = useApp();

  const getIconEmoji = (icon) => {
    const emojiMap = {
      star: '⭐',
      fire: '🔥',
      trophy: '🏆',
      book: '📖',
      medal: '🏅',
    };
    return emojiMap[icon] || '🎯';
  };

  const renderAchievement = ({ item }) => (
    <Card style={[styles.card, item.unlocked ? styles.unlockedCard : styles.lockedCard]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, !item.unlocked && styles.lockedIcon]}>
            {getIconEmoji(item.icon)}
          </Text>
          {item.unlocked && <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.name, !item.unlocked && styles.lockedText]}>
            {item.name}
          </Text>
          <Text style={styles.description}>{item.description}</Text>
          {item.unlocked && item.unlocked_at && (
            <Text style={styles.unlockedDate}>
              Unlocked: {new Date(item.unlocked_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <Text style={styles.headerSubtitle}>
          {unlockedCount} / {achievements.length} Unlocked
        </Text>
      </View>

      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAchievement}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No achievements yet!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  unlockedCard: {
    backgroundColor: '#fff',
  },
  lockedCard: {
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  icon: {
    fontSize: 48,
  },
  lockedIcon: {
    opacity: 0.3,
  },
  checkmark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#10b981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lockedText: {
    color: '#999',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unlockedDate: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default AchievementsScreen;
