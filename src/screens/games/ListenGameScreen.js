import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

const ListenGameScreen = ({ route, navigation }) => {
  const { verse } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [speed, setSpeed] = useState(1.0);
  const [repeatCount, setRepeatCount] = useState(0);
  const words = verse.text.split(' ');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const speakVerse = async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      return;
    }

    setIsPlaying(true);
    setRepeatCount(repeatCount + 1);

    // Speak with word highlighting
    const wordsToSpeak = verse.text.split(' ');

    for (let i = 0; i < wordsToSpeak.length; i++) {
      setCurrentWordIndex(i);

      await new Promise((resolve) => {
        Speech.speak(wordsToSpeak[i], {
          rate: speed,
          onDone: resolve,
          onStopped: resolve,
        });
      });

      // Small pause between words
      await new Promise(resolve => setTimeout(resolve, 100 / speed));
    }

    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  const speakFull = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setRepeatCount(repeatCount + 1);

    Speech.speak(verse.text, {
      rate: speed,
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
    });
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);

    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    }
  };

  return (
    <LinearGradient colors={['#8b5cf6', '#ec4899']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.reference}>
          {verse.book} {verse.chapter}:{verse.verse_number}
        </Text>
        <Text style={styles.gameTitle}>Listen & Learn</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              {words.map((word, index) => (
                <Text
                  key={index}
                  style={[
                    styles.word,
                    index === currentWordIndex && styles.highlightedWord,
                  ]}
                >
                  {word}{' '}
                </Text>
              ))}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔊</Text>
              <Text style={styles.statLabel}>Played {repeatCount}x</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statLabel}>{speed}x speed</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.controlsContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={speakFull}
          >
            <LinearGradient
              colors={isPlaying ? ['#ef4444', '#dc2626'] : ['#10b981', '#059669']}
              style={styles.playGradient}
            >
              <Text style={styles.playIcon}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={speakVerse}
            style={styles.controlButton}
            textColor="#fff"
            icon="text-box-outline"
          >
            Word by Word
          </Button>

          <Button
            mode="outlined"
            onPress={changeSpeed}
            style={styles.controlButton}
            textColor="#fff"
            icon="speedometer"
          >
            {speed}x Speed
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.doneButton}
          buttonColor="#10b981"
        >
          Done Listening
        </Button>
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
    opacity: 0.9,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  verseContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  verseText: {
    fontSize: 20,
    lineHeight: 36,
    color: '#333',
    textAlign: 'center',
  },
  word: {
    color: '#333',
  },
  highlightedWord: {
    backgroundColor: '#fef08a',
    color: '#854d0e',
    fontWeight: 'bold',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  controlsContainer: {
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    marginBottom: 24,
  },
  playGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 36,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
    borderColor: '#fff',
  },
  doneButton: {
    width: '100%',
  },
});

export default ListenGameScreen;
