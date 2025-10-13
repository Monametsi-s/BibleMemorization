import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { recordPracticeSession } from '../../services/database';

const SpeakOutScreen = ({ route, navigation }) => {
  const { verse } = route.params;
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showVerse, setShowVerse] = useState(false);

  // Note: Full speech recognition requires @react-native-voice/voice or similar
  // This is a simplified version that focuses on the recitation practice flow
  const handleStartRecording = () => {
    setIsRecording(true);

    Alert.alert(
      'Recite the Verse',
      'Speak out the verse from memory. Press "Done Recording" when finished.',
      [
        {
          text: 'Start',
          onPress: () => {
            // In a full implementation, this would start speech recognition
            // For now, we simulate the recording process
            setTimeout(() => {
              setIsRecording(false);
              setHasRecorded(true);
            }, 3000);
          },
        },
      ]
    );
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
  };

  const handleCheckAnswer = () => {
    Alert.alert(
      'Verify Your Recitation',
      'Did you recite the verse correctly from memory?',
      [
        {
          text: 'Yes, I got it right! ✓',
          onPress: () => {
            recordPracticeSession(verse.id, 'speak_out', true, 0);
            navigation.goBack();
          },
        },
        {
          text: 'No, I made mistakes ✗',
          onPress: () => {
            recordPracticeSession(verse.id, 'speak_out', false, 0);
            setShowVerse(true);
          },
        },
        {
          text: 'Try Again',
          onPress: () => {
            setHasRecorded(false);
            setShowVerse(false);
          },
          style: 'cancel',
        },
      ]
    );
  };

  const speakVerse = () => {
    Speech.speak(verse.text, {
      rate: 0.9,
    });
  };

  return (
    <LinearGradient colors={['#14b8a6', '#06b6d4']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.reference}>
          {verse.book} {verse.chapter}:{verse.verse_number}
        </Text>
        <Text style={styles.gameTitle}>Speak Out Challenge</Text>
        <Text style={styles.instruction}>
          Recite the verse from memory out loud
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          {!hasRecorded ? (
            <View style={styles.recordingContainer}>
              <TouchableOpacity
                style={styles.micButton}
                onPress={handleStartRecording}
                disabled={isRecording}
              >
                <LinearGradient
                  colors={isRecording ? ['#ef4444', '#dc2626'] : ['#6366f1', '#8b5cf6']}
                  style={styles.micGradient}
                >
                  <Text style={styles.micIcon}>
                    {isRecording ? '🔴' : '🎤'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.statusText}>
                {isRecording ? 'Recording... Speak the verse!' : 'Tap the microphone to begin'}
              </Text>

              <View style={styles.helperButtons}>
                <Button
                  mode="outlined"
                  onPress={speakVerse}
                  style={styles.helperButton}
                  icon="volume-high"
                >
                  Hear Verse
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setShowVerse(!showVerse)}
                  style={styles.helperButton}
                  icon={showVerse ? 'eye-off' : 'eye'}
                >
                  {showVerse ? 'Hide' : 'Peek'}
                </Button>
              </View>

              {showVerse && (
                <View style={styles.verseContainer}>
                  <Text style={styles.verseText}>{verse.text}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.resultContainer}>
              <Text style={styles.completeIcon}>✅</Text>
              <Text style={styles.completeText}>Recording Complete!</Text>
              <Text style={styles.completeSubtext}>
                How did you do? Be honest with yourself.
              </Text>

              {showVerse && (
                <View style={styles.verseContainer}>
                  <Text style={styles.verseLabel}>The Verse:</Text>
                  <Text style={styles.verseText}>{verse.text}</Text>
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        {hasRecorded ? (
          <View style={styles.actionButtons}>
            {!showVerse && (
              <Button
                mode="outlined"
                onPress={() => setShowVerse(true)}
                style={styles.button}
                textColor="#fff"
              >
                Show Verse
              </Button>
            )}
            <Button
              mode="contained"
              onPress={handleCheckAnswer}
              style={styles.button}
              buttonColor="#10b981"
            >
              Verify Result
            </Button>
          </View>
        ) : (
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            textColor="#fff"
          >
            Cancel
          </Button>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          💡 Tip: This exercise helps with verbal recall. Try to recite the verse clearly and accurately!
        </Text>
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
    fontWeight: '600',
    marginBottom: 4,
  },
  instruction: {
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
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    elevation: 8,
    marginBottom: 24,
  },
  micGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 48,
  },
  statusText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  helperButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  helperButton: {
    borderColor: '#6366f1',
  },
  verseContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
  },
  verseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  verseText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  completeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  completeSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
});

export default SpeakOutScreen;
