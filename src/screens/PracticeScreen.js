import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Button, ProgressBar, Card } from 'react-native-paper';
import { getVersesDueForReview, recordPracticeSession } from '../services/database';
import { useApp } from '../context/AppContext';

const PRACTICE_TYPES = {
  FILL_BLANK: 'fill_blank',
  MULTIPLE_CHOICE: 'multiple_choice',
  TYPING: 'typing',
};

const PracticeScreen = ({ navigation }) => {
  const { refreshData } = useApp();
  const [verses, setVerses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceType, setPracticeType] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = () => {
    const dueVerses = getVersesDueForReview();
    if (dueVerses.length === 0) {
      // No verses due, show completion
      navigation.goBack();
      return;
    }
    setVerses(dueVerses);
    setCurrentIndex(0);
    selectRandomPracticeType();
    fadeIn();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const selectRandomPracticeType = () => {
    const types = Object.values(PRACTICE_TYPES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    setPracticeType(randomType);
  };

  const currentVerse = verses[currentIndex];

  const createFillBlankQuestion = () => {
    if (!currentVerse) return { question: '', answer: '' };

    const words = currentVerse.text.split(' ');
    const blankIndex = Math.floor(Math.random() * words.length);
    const answer = words[blankIndex];
    const question = words.map((w, i) => i === blankIndex ? '______' : w).join(' ');

    return { question, answer };
  };

  const createMultipleChoice = () => {
    if (!currentVerse) return { options: [], correctIndex: 0 };

    const words = currentVerse.text.split(' ');
    const correctAnswer = words[Math.floor(Math.random() * words.length)];

    // Generate similar-looking wrong answers (in real app, use more sophisticated generation)
    const wrongAnswers = ['faith', 'grace', 'love', 'peace', 'righteousness']
      .filter(w => w !== correctAnswer.toLowerCase())
      .slice(0, 3);

    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAnswer);

    return { options, correctIndex, question: `Which word appears in ${currentVerse.book} ${currentVerse.chapter}:${currentVerse.verse_number}?` };
  };

  const handleSubmit = () => {
    if (!currentVerse) return;

    const startTime = Date.now();
    let correct = false;

    if (practiceType === PRACTICE_TYPES.TYPING) {
      const similarity = calculateSimilarity(userAnswer.toLowerCase().trim(), currentVerse.text.toLowerCase());
      correct = similarity > 0.85; // 85% similarity threshold
    } else if (practiceType === PRACTICE_TYPES.FILL_BLANK) {
      const { answer } = createFillBlankQuestion();
      correct = userAnswer.toLowerCase().trim() === answer.toLowerCase();
    }

    const result = recordPracticeSession(currentVerse.id, practiceType, correct, 0);

    setIsCorrect(correct);
    setXpGained(result.xpGained);
    setShowResult(true);
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    // Animate result
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      handleNext();
    }, 2000);
  };

  const handleNext = () => {
    if (currentIndex < verses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowResult(false);
      selectRandomPracticeType();
      fadeIn();
    } else {
      // Practice session complete
      refreshData();
      navigation.goBack();
    }
  };

  const calculateSimilarity = (s1, s2) => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (s1, s2) => {
    const matrix = [];
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[s2.length][s1.length];
  };

  const renderPracticeContent = () => {
    if (!currentVerse) return null;

    if (practiceType === PRACTICE_TYPES.TYPING) {
      return (
        <View>
          <Text style={styles.reference}>
            {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse_number}
          </Text>
          <Text style={styles.instruction}>Type the verse from memory:</Text>
          <TextInput
            style={styles.input}
            multiline
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Start typing..."
            editable={!showResult}
          />
          {showResult && (
            <View style={styles.correctAnswer}>
              <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
              <Text style={styles.correctAnswerText}>{currentVerse.text}</Text>
            </View>
          )}
        </View>
      );
    }

    if (practiceType === PRACTICE_TYPES.FILL_BLANK) {
      const { question, answer } = createFillBlankQuestion();
      return (
        <View>
          <Text style={styles.reference}>
            {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse_number}
          </Text>
          <Text style={styles.verseText}>{question}</Text>
          <TextInput
            style={styles.input}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Fill in the blank..."
            editable={!showResult}
          />
          {showResult && !isCorrect && (
            <Text style={styles.correctAnswerText}>Correct: {answer}</Text>
          )}
        </View>
      );
    }

    if (practiceType === PRACTICE_TYPES.MULTIPLE_CHOICE) {
      const { options, correctIndex, question } = createMultipleChoice();
      return (
        <View>
          <Text style={styles.instruction}>{question}</Text>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                userAnswer === option && styles.selectedOption,
              ]}
              onPress={() => !showResult && setUserAnswer(option)}
              disabled={showResult}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
  };

  if (!currentVerse) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No verses due for review!</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressBar
        progress={(currentIndex + 1) / verses.length}
        color="#6366f1"
        style={styles.progressBar}
      />

      <View style={styles.header}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {verses.length}
        </Text>
        <Text style={styles.statsText}>
          ✓ {sessionStats.correct} / {sessionStats.total}
        </Text>
      </View>

      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Card style={styles.practiceCard}>
          <Card.Content>
            {renderPracticeContent()}
          </Card.Content>
        </Card>
      </Animated.View>

      {showResult && (
        <View style={[styles.resultBanner, isCorrect ? styles.correct : styles.incorrect]}>
          <Text style={styles.resultText}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </Text>
          <Text style={styles.xpText}>+{xpGained} XP</Text>
        </View>
      )}

      {!showResult && (
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={!userAnswer}
        >
          Submit
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    flex: 1,
  },
  practiceCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  reference: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionButton: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#6366f1',
  },
  resultBanner: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correct: {
    backgroundColor: '#10b981',
  },
  incorrect: {
    backgroundColor: '#ef4444',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  correctAnswer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default PracticeScreen;
