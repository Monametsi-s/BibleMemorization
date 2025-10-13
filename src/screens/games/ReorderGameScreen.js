import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const ReorderGameScreen = ({ route, navigation }) => {
  const { verse } = route.params;
  const [words, setWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const correctOrder = verse.text.split(' ');

  useEffect(() => {
    // Shuffle words
    const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
    setWords(shuffled);
  }, [verse]);

  const handleWordPress = (word, index) => {
    setSelectedWords([...selectedWords, { word, originalIndex: index }]);
    setWords(words.filter((_, i) => i !== index));
  };

  const handleSelectedWordPress = (index) => {
    const wordToReturn = selectedWords[index];
    setWords([...words, wordToReturn.word]);
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    const userAnswer = selectedWords.map(w => w.word).join(' ');
    const correct = userAnswer === verse.text;
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleReset = () => {
    const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setSelectedWords([]);
    setIsCorrect(null);
    setShowResult(false);
  };

  return (
    <LinearGradient colors={['#ec4899', '#f43f5e']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.reference}>
          {verse.book} {verse.chapter}:{verse.verse_number}
        </Text>
        <Text style={styles.gameTitle}>Reorder the Words</Text>
        <Text style={styles.instruction}>
          Tap words in the correct order to rebuild the verse
        </Text>
      </View>

      <Card style={styles.selectedCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Your Answer:</Text>
          <ScrollView style={styles.selectedContainer}>
            <View style={styles.selectedWordsWrap}>
              {selectedWords.length === 0 ? (
                <Text style={styles.emptyText}>Tap words below to build the verse</Text>
              ) : (
                selectedWords.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.selectedWord}
                    onPress={() => !showResult && handleSelectedWordPress(index)}
                  >
                    <Text style={styles.selectedWordText}>{item.word}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      <Card style={styles.wordsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Available Words:</Text>
          <View style={styles.wordsContainer}>
            {words.map((word, index) => (
              <TouchableOpacity
                key={index}
                style={styles.wordChip}
                onPress={() => !showResult && handleWordPress(word, index)}
              >
                <Text style={styles.wordText}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {showResult && (
        <Card style={[styles.resultCard, isCorrect ? styles.correctCard : styles.incorrectCard]}>
          <Card.Content>
            <Text style={styles.resultText}>
              {isCorrect ? '✓ Perfect!' : '✗ Not quite right'}
            </Text>
            {!isCorrect && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerLabel}>Correct order:</Text>
                <Text style={styles.correctAnswerText}>{verse.text}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        {!showResult ? (
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.button}
              textColor="#fff"
            >
              Reset
            </Button>
            <Button
              mode="contained"
              onPress={handleCheck}
              style={styles.button}
              buttonColor="#10b981"
              disabled={selectedWords.length !== correctOrder.length}
            >
              Check Answer
            </Button>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.button}
              textColor="#fff"
            >
              Try Again
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.button}
              buttonColor="#10b981"
            >
              Continue
            </Button>
          </View>
        )}
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
    marginBottom: 16,
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
    fontWeight: '600',
    marginBottom: 4,
  },
  instruction: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  selectedCard: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
    minHeight: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  selectedContainer: {
    maxHeight: 100,
  },
  selectedWordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  selectedWord: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedWordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  wordsCard: {
    borderRadius: 12,
    elevation: 4,
    flex: 1,
    marginBottom: 16,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  wordText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  resultCard: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  correctCard: {
    backgroundColor: '#10b981',
  },
  incorrectCard: {
    backgroundColor: '#ef4444',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  correctAnswerContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default ReorderGameScreen;
