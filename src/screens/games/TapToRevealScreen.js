import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Button, Card, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const TapToRevealScreen = ({ route, navigation }) => {
  const { verse } = route.params;
  const [phrases, setPhrases] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Split verse into phrases (by punctuation or every 3-5 words)
    const splitIntoPhrases = (text) => {
      // Split by common punctuation marks
      const parts = text.split(/([,.;:])/);
      const result = [];

      for (let i = 0; i < parts.length; i += 2) {
        const phrase = parts[i] + (parts[i + 1] || '');
        if (phrase.trim()) {
          result.push(phrase.trim());
        }
      }

      return result.length > 0 ? result : [text];
    };

    setPhrases(splitIntoPhrases(verse.text));
  }, [verse]);

  useEffect(() => {
    if (revealedIndex >= 0) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [revealedIndex]);

  const handleRevealNext = () => {
    if (revealedIndex < phrases.length - 1) {
      setRevealedIndex(revealedIndex + 1);
    } else if (!isComplete) {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setRevealedIndex(-1);
    setIsComplete(false);
  };

  const progress = phrases.length > 0 ? (revealedIndex + 1) / phrases.length : 0;

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.reference}>
          {verse.book} {verse.chapter}:{verse.verse_number}
        </Text>
        <Text style={styles.gameTitle}>Tap to Reveal</Text>
        <ProgressBar
          progress={progress}
          color="#fff"
          style={styles.progressBar}
        />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.contentContainer}>
            {revealedIndex === -1 ? (
              <View style={styles.startContainer}>
                <Text style={styles.startIcon}>👆</Text>
                <Text style={styles.instructionText}>
                  Tap below to reveal the verse phrase by phrase
                </Text>
              </View>
            ) : (
              <View style={styles.phrasesContainer}>
                {phrases.map((phrase, index) => (
                  index <= revealedIndex && (
                    <Animated.View
                      key={index}
                      style={[
                        styles.phraseContainer,
                        index === revealedIndex && { opacity: fadeAnim },
                      ]}
                    >
                      <Text style={styles.phraseText}>{phrase}</Text>
                    </Animated.View>
                  )
                ))}
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        {!isComplete ? (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={handleRevealNext}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {revealedIndex === -1 ? 'Start Revealing' : 'Reveal Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.completeContainer}>
            <Text style={styles.completeText}>✨ Complete! ✨</Text>
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={handleRestart}
                style={styles.actionButton}
                textColor="#fff"
              >
                Practice Again
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.actionButton}
                buttonColor="#10b981"
              >
                Continue
              </Button>
            </View>
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
    marginBottom: 16,
    opacity: 0.9,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startContainer: {
    alignItems: 'center',
  },
  startIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  phrasesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  phraseContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    width: '100%',
  },
  phraseText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    marginTop: 24,
  },
  revealButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  completeContainer: {
    alignItems: 'center',
  },
  completeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});

export default TapToRevealScreen;
