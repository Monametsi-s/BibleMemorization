import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { recordPracticeSession } from '../../services/database';

const TypeFirstLetterScreen = ({ route, navigation }) => {
  const { verses } = route.params;
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [failureCount, setFailureCount] = useState(0);
  const [wordResults, setWordResults] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, failed: 0 });

  const currentVerse = verses[currentVerseIndex];

  useEffect(() => {
    if (currentVerse) {
      setWords(currentVerse.text.split(' '));
      setCurrentWordIndex(0);
      setUserInput('');
      setFailureCount(0);
      setWordResults([]);
    }
  }, [currentVerseIndex, currentVerse]);

  const handleInputChange = (text) => {
    if (text.length === 0) {
      setUserInput('');
      return;
    }

    const firstLetter = words[currentWordIndex][0].toLowerCase();
    const inputLetter = text[0].toLowerCase();

    if (inputLetter === firstLetter) {
      // Correct! Reveal the word and move to next
      const newResults = [...wordResults, {
        word: words[currentWordIndex],
        status: 'correct',
        failures: failureCount,
      }];
      setWordResults(newResults);
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));

      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setUserInput('');
        setFailureCount(0);
      } else {
        // Verse complete
        recordPracticeSession(currentVerse.id, 'type_first_letter', true, 0);
        handleNextVerse();
      }
    } else {
      // Wrong letter
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);
      setUserInput('');

      if (newFailureCount >= 3) {
        // Failed this word - reveal it
        const newResults = [...wordResults, {
          word: words[currentWordIndex],
          status: 'failed',
          failures: 3,
        }];
        setWordResults(newResults);
        setSessionStats(prev => ({ ...prev, failed: prev.failed + 1 }));

        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setFailureCount(0);
        } else {
          // Verse complete
          recordPracticeSession(currentVerse.id, 'type_first_letter', false, 0);
          handleNextVerse();
        }
      }
    }
  };

  const handleNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const getWordColor = (result) => {
    if (result.status === 'correct' && result.failures === 0) {
      return '#10b981'; // Green - perfect
    } else if (result.status === 'correct' && result.failures <= 2) {
      return '#eab308'; // Yellow - correct but with failures
    } else {
      return '#ef4444'; // Red - failed
    }
  };

  const getFailureIndicators = () => {
    return [1, 2, 3].map(num => (
      <View
        key={num}
        style={[
          styles.failureDot,
          failureCount >= num && styles.failureDotActive,
        ]}
      />
    ));
  };

  if (!currentVerse) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No verses available</Text>
      </View>
    );
  }

  if (isComplete) {
    return (
      <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
        <Card style={styles.completeCard}>
          <Card.Content>
            <Text style={styles.completeTitle}>✨ Session Complete! ✨</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{sessionStats.correct}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>
                  {sessionStats.failed}
                </Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.doneButton}
              buttonColor="#10b981"
            >
              Done
            </Button>
          </Card.Content>
        </Card>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.reference}>
          {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse_number}
        </Text>
        <Text style={styles.gameTitle}>Type First Letter</Text>
        <Text style={styles.progress}>
          Verse {currentVerseIndex + 1} of {verses.length}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.wordsDisplay}>
            {words.map((word, index) => {
              const result = wordResults[index];
              const isCurrent = index === currentWordIndex;

              return (
                <View key={index} style={styles.wordContainer}>
                  {result ? (
                    <View
                      style={[
                        styles.completedWord,
                        { backgroundColor: getWordColor(result) },
                      ]}
                    >
                      <Text style={styles.completedWordText}>{word}</Text>
                    </View>
                  ) : isCurrent ? (
                    <View style={styles.currentWordPlaceholder}>
                      <Text style={styles.placeholderText}>?</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingWordPlaceholder}>
                      <Text style={styles.pendingPlaceholderText}>_</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.promptText}>
              Type the first letter of the next word
            </Text>

            <View style={styles.failureIndicators}>
              {getFailureIndicators()}
            </View>

            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={handleInputChange}
              maxLength={1}
              autoCapitalize="none"
              autoFocus
              placeholder=""
              placeholderTextColor="#d1d5db"
            />

            {failureCount > 0 && (
              <Text style={styles.hintText}>
                {failureCount === 1 && 'Try again! (2 attempts left)'}
                {failureCount === 2 && 'Last chance! (1 attempt left)'}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.statsBar}>
        <Chip style={styles.statChip} textStyle={{ color: '#fff' }}>
          ✓ {sessionStats.correct}
        </Chip>
        <Chip style={[styles.statChip, { backgroundColor: '#ef4444' }]} textStyle={{ color: '#fff' }}>
          ✗ {sessionStats.failed}
        </Chip>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  reference: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  progress: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  wordsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
    paddingVertical: 8,
  },
  wordContainer: {
    marginBottom: 8,
  },
  completedWord: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedWordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentWordPlaceholder: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    backgroundColor: '#eef2ff',
    minWidth: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  pendingWordPlaceholder: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    minWidth: 32,
    alignItems: 'center',
  },
  pendingPlaceholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  inputSection: {
    alignItems: 'center',
  },
  promptText: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  failureIndicators: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  failureDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  failureDotActive: {
    backgroundColor: '#ef4444',
  },
  input: {
    width: 100,
    height: 100,
    borderWidth: 4,
    borderColor: '#6366f1',
    borderRadius: 20,
    fontSize: 56,
    textAlign: 'center',
    backgroundColor: '#fff',
    fontWeight: 'bold',
    color: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hintText: {
    marginTop: 16,
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  statChip: {
    backgroundColor: '#10b981',
  },
  completeCard: {
    borderRadius: 16,
    elevation: 4,
    marginTop: 100,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  doneButton: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default TypeFirstLetterScreen;
