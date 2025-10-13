import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Card, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { recordPracticeSession } from '../../services/database';

const WordBankScreen = ({ route, navigation }) => {
  const { verse } = route.params;
  const [words, setWords] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [wordBank, setWordBank] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [difficulty, setDifficulty] = useState(0);

  useEffect(() => {
    setupGame();
  }, [verse, difficulty]);

  const setupGame = () => {
    const allWords = verse.text.split(' ');

    // Progressive difficulty: remove more words as mastery increases
    const masteryLevel = verse.mastery_level || 0;
    const baseDifficulty = 0.3; // 30% of words at level 0
    const difficultyIncrease = 0.15; // +15% per mastery level
    const removalPercentage = Math.min(0.9, baseDifficulty + (masteryLevel * difficultyIncrease));

    const numBlanks = Math.max(3, Math.floor(allWords.length * removalPercentage));

    // Randomly select words to blank out
    const indices = Array.from({ length: allWords.length }, (_, i) => i);
    const shuffledIndices = indices.sort(() => Math.random() - 0.5);
    const blankIndices = shuffledIndices.slice(0, numBlanks);

    const newBlanks = [];
    const newWordBank = [];

    blankIndices.forEach(index => {
      newBlanks.push({ index, word: allWords[index] });
      newWordBank.push(allWords[index]);
    });

    // Add some wrong answers to word bank (similar words)
    const wrongWords = ['faith', 'grace', 'love', 'peace', 'hope', 'truth', 'life', 'light']
      .filter(w => !newWordBank.includes(w))
      .slice(0, Math.min(3, numBlanks));

    const shuffledBank = [...newWordBank, ...wrongWords].sort(() => Math.random() - 0.5);

    setWords(allWords);
    setBlanks(newBlanks);
    setWordBank(shuffledBank);
    setUserAnswers({});
    setShowResult(false);
  };

  const handleWordSelect = (blankIndex, word) => {
    setUserAnswers({ ...userAnswers, [blankIndex]: word });
  };

  const handleCheck = () => {
    let correct = true;
    blanks.forEach(blank => {
      if (userAnswers[blank.index] !== blank.word) {
        correct = false;
      }
    });

    setIsCorrect(correct);
    setShowResult(true);

    // Record practice session
    recordPracticeSession(verse.id, 'word_bank', correct, 0);
  };

  const handleIncreaseDifficulty = () => {
    setDifficulty(difficulty + 1);
  };

  const renderWord = (word, index) => {
    const blank = blanks.find(b => b.index === index);

    if (blank) {
      const selectedWord = userAnswers[index];
      const isAnswered = !!selectedWord;
      const isCorrectAnswer = showResult && selectedWord === blank.word;
      const isWrongAnswer = showResult && selectedWord !== blank.word;

      return (
        <Text key={index}>
          <Text
            style={[
              styles.blankText,
              isAnswered && styles.answeredBlank,
              isCorrectAnswer && styles.correctBlank,
              isWrongAnswer && styles.wrongBlank,
            ]}
          >
            {isAnswered ? selectedWord : '_____'}
          </Text>
          {showResult && isWrongAnswer && (
            <Text style={styles.correctAnswer}> ({blank.word})</Text>
          )}
          <Text> </Text>
        </Text>
      );
    }

    return (
      <Text key={index} style={styles.normalWord}>
        {word}{' '}
      </Text>
    );
  };

  const getAvailableWords = () => {
    const usedWords = Object.values(userAnswers);
    return wordBank.filter(word => !usedWords.includes(word));
  };

  const getMasteryMessage = () => {
    const percentage = (blanks.length / words.length) * 100;
    if (percentage >= 70) return 'Expert Level! 🔥';
    if (percentage >= 50) return 'Advanced';
    if (percentage >= 30) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <LinearGradient colors={['#f43f5e', '#fb923c']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.reference}>
          {verse.book} {verse.chapter}:{verse.verse_number}
        </Text>
        <Text style={styles.gameTitle}>Word Bank Challenge</Text>
        <Text style={styles.difficulty}>
          {getMasteryMessage()} - {blanks.length}/{words.length} blanks
        </Text>
      </View>

      <Card style={styles.verseCard}>
        <Card.Content>
          <ScrollView style={styles.verseScroll}>
            <Text style={styles.verseText}>
              {words.map((word, index) => renderWord(word, index))}
            </Text>
          </ScrollView>
        </Card.Content>
      </Card>

      {!showResult && blanks.find(b => !userAnswers[b.index]) && (
        <Card style={styles.wordBankCard}>
          <Card.Content>
            <Text style={styles.wordBankTitle}>Select a word:</Text>
            <View style={styles.wordBankContainer}>
              {getAvailableWords().map((word, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.wordBankChip}
                  onPress={() => {
                    const nextBlank = blanks.find(b => !userAnswers[b.index]);
                    if (nextBlank) {
                      handleWordSelect(nextBlank.index, word);
                    }
                  }}
                >
                  <Text style={styles.wordBankText}>{word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {showResult && (
        <Card style={[styles.resultCard, isCorrect ? styles.correctCard : styles.incorrectCard]}>
          <Card.Content>
            <Text style={styles.resultText}>
              {isCorrect ? '✓ Perfect! Well done!' : '✗ Some mistakes, keep practicing!'}
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        {!showResult ? (
          <Button
            mode="contained"
            onPress={handleCheck}
            style={styles.button}
            buttonColor="#10b981"
            disabled={blanks.some(b => !userAnswers[b.index])}
          >
            Check Answers
          </Button>
        ) : (
          <View style={styles.actionButtons}>
            {isCorrect && (
              <Button
                mode="outlined"
                onPress={handleIncreaseDifficulty}
                style={styles.button}
                textColor="#fff"
              >
                Increase Difficulty
              </Button>
            )}
            <Button
              mode="outlined"
              onPress={setupGame}
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
              Done
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
  },
  difficulty: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  verseCard: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
    maxHeight: '40%',
  },
  verseScroll: {
    maxHeight: 250,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 32,
    color: '#333',
  },
  normalWord: {
    color: '#333',
  },
  blankText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  answeredBlank: {
    backgroundColor: '#dbeafe',
  },
  correctBlank: {
    backgroundColor: '#d1fae5',
  },
  wrongBlank: {
    backgroundColor: '#fee2e2',
  },
  correctAnswer: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  wordBankCard: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  wordBankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  wordBankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordBankChip: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  wordBankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  },
  buttonContainer: {
    marginTop: 8,
  },
  actionButtons: {
    gap: 8,
  },
  button: {
    marginBottom: 8,
  },
});

export default WordBankScreen;
