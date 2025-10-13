import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { getVersesDueForReview, getAllVerses } from '../services/database';

const GAMES = [
  {
    id: 'tap_to_reveal',
    name: 'Tap to Reveal',
    description: 'Learn phrase by phrase',
    icon: '👆',
    phase: 'Absorb',
    color: ['#6366f1', '#8b5cf6'],
    screen: 'TapToReveal',
    requiresSingleVerse: true,
  },
  {
    id: 'listen',
    name: 'Listen',
    description: 'Hear the verse with highlighting',
    icon: '🔊',
    phase: 'Absorb',
    color: ['#8b5cf6', '#ec4899'],
    screen: 'ListenGame',
    requiresSingleVerse: true,
  },
  {
    id: 'reorder',
    name: 'Reorder Words',
    description: 'Put the words in correct order',
    icon: '🔄',
    phase: 'Memorize',
    color: ['#ec4899', '#f43f5e'],
    screen: 'ReorderGame',
    requiresSingleVerse: true,
  },
  {
    id: 'type_first_letter',
    name: 'Type First Letter',
    description: 'Type first letters to complete words',
    icon: '⌨️',
    phase: 'Memorize',
    color: ['#6366f1', '#8b5cf6'],
    screen: 'TypeFirstLetter',
    requiresSingleVerse: false,
  },
  {
    id: 'word_bank',
    name: 'Word Bank',
    description: 'Fill in the blanks with word choices',
    icon: '📝',
    phase: 'Recall',
    color: ['#f43f5e', '#fb923c'],
    screen: 'WordBank',
    requiresSingleVerse: true,
  },
  {
    id: 'speak_out',
    name: 'Speak Out',
    description: 'Recite the verse verbally',
    icon: '🎤',
    phase: 'Mastery',
    color: ['#14b8a6', '#06b6d4'],
    screen: 'SpeakOut',
    requiresSingleVerse: true,
  },
];

const GameSelectionScreen = ({ navigation }) => {
  const [verses, setVerses] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('All');

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = () => {
    const dueVerses = getVersesDueForReview();
    if (dueVerses.length === 0) {
      // If no verses due, get all verses
      const allVerses = getAllVerses();
      setVerses(allVerses.slice(0, 10));
    } else {
      setVerses(dueVerses);
    }
  };

  const handleGameSelect = (game) => {
    if (verses.length === 0) {
      alert('No verses available. Please add verses first.');
      return;
    }

    const params = game.requiresSingleVerse
      ? { verse: verses[0] }
      : { verses: verses };

    navigation.navigate(game.screen, params);
  };

  const phases = ['All', 'Absorb', 'Memorize', 'Recall', 'Mastery'];

  const filteredGames = selectedPhase === 'All'
    ? GAMES
    : GAMES.filter(game => game.phase === selectedPhase);

  const getRecommendedGame = () => {
    if (verses.length === 0) return null;

    const avgMastery = verses.reduce((sum, v) => sum + (v.mastery_level || 0), 0) / verses.length;

    if (avgMastery < 1) return GAMES[0]; // Tap to Reveal for beginners
    if (avgMastery < 2) return GAMES[2]; // Reorder for learning
    if (avgMastery < 4) return GAMES[4]; // Word Bank for recall
    return GAMES[5]; // Speak Out for mastery
  };

  const recommendedGame = getRecommendedGame();

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a Game</Text>
        <Text style={styles.subtitle}>
          {verses.length} verses ready to practice
        </Text>
      </View>

      {recommendedGame && (
        <TouchableOpacity
          style={styles.recommendedCard}
          onPress={() => handleGameSelect(recommendedGame)}
        >
          <LinearGradient
            colors={recommendedGame.color}
            style={styles.recommendedGradient}
          >
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
            </View>
            <Text style={styles.recommendedIcon}>{recommendedGame.icon}</Text>
            <Text style={styles.recommendedName}>{recommendedGame.name}</Text>
            <Text style={styles.recommendedDescription}>
              {recommendedGame.description}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.phaseFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {phases.map(phase => (
            <TouchableOpacity
              key={phase}
              style={[
                styles.phaseChip,
                selectedPhase === phase && styles.phaseChipActive,
              ]}
              onPress={() => setSelectedPhase(phase)}
            >
              <Text
                style={[
                  styles.phaseChipText,
                  selectedPhase === phase && styles.phaseChipTextActive,
                ]}
              >
                {phase}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.gamesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.gamesGrid}>
          {filteredGames.map(game => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => handleGameSelect(game)}
            >
              <LinearGradient
                colors={game.color}
                style={styles.gameGradient}
              >
                <View style={styles.gamePhase}>
                  <Text style={styles.gamePhaseText}>{game.phase}</Text>
                </View>
                <Text style={styles.gameIcon}>{game.icon}</Text>
                <Text style={styles.gameName}>{game.name}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  recommendedCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
  },
  recommendedGradient: {
    padding: 24,
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
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendedIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  recommendedName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  recommendedDescription: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  phaseFilter: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  phaseChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  phaseChipActive: {
    backgroundColor: '#fff',
  },
  phaseChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  phaseChipTextActive: {
    color: '#6366f1',
  },
  gamesContainer: {
    flex: 1,
  },
  gamesGrid: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  gameGradient: {
    padding: 20,
    minHeight: 180,
  },
  gamePhase: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  gamePhaseText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gameIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 18,
  },
});

export default GameSelectionScreen;
