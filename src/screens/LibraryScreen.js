import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Card, Button, FAB, Chip } from 'react-native-paper';
import { getAllVerses, addVerse } from '../services/database';
import { useApp } from '../context/AppContext';

const LibraryScreen = () => {
  const { refreshData } = useApp();
  const [verses, setVerses] = useState([]);
  const [filteredVerses, setFilteredVerses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [newVerse, setNewVerse] = useState({
    book: 'Romans',
    chapter: '',
    verse: '',
    text: '',
  });

  useEffect(() => {
    loadVerses();
  }, []);

  useEffect(() => {
    filterVerses();
  }, [searchQuery, selectedBook, verses]);

  const loadVerses = () => {
    const allVerses = getAllVerses();
    setVerses(allVerses);
  };

  const filterVerses = () => {
    let filtered = verses;

    if (selectedBook !== 'All') {
      filtered = filtered.filter(v => v.book === selectedBook);
    }

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${v.book} ${v.chapter}:${v.verse_number}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVerses(filtered);
  };

  const books = ['All', ...new Set(verses.map(v => v.book))];

  const getMasteryColor = (level) => {
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#059669'];
    return colors[level] || '#9ca3af';
  };

  const getMasteryLabel = (level) => {
    const labels = ['New', 'Learning', 'Familiar', 'Known', 'Mastered', 'Perfect'];
    return labels[level] || 'New';
  };

  const handleAddVerse = () => {
    if (newVerse.book && newVerse.chapter && newVerse.verse && newVerse.text) {
      addVerse(
        newVerse.book,
        parseInt(newVerse.chapter),
        parseInt(newVerse.verse),
        newVerse.text
      );
      setModalVisible(false);
      setNewVerse({ book: 'Romans', chapter: '', verse: '', text: '' });
      loadVerses();
      refreshData();
    }
  };

  const renderVerse = ({ item }) => (
    <Card style={styles.verseCard}>
      <Card.Content>
        <View style={styles.verseHeader}>
          <Text style={styles.reference}>
            {item.book} {item.chapter}:{item.verse_number}
          </Text>
          <Chip
            style={[styles.masteryChip, { backgroundColor: getMasteryColor(item.mastery_level) }]}
            textStyle={styles.masteryText}
          >
            {getMasteryLabel(item.mastery_level)}
          </Chip>
        </View>
        <Text style={styles.verseText}>{item.text}</Text>
        <View style={styles.verseFooter}>
          <Text style={styles.translation}>{item.translation}</Text>
          <Text style={styles.practiced}>Practiced {item.times_practiced}x</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search verses..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Book Filter */}
      <FlatList
        horizontal
        data={books}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Chip
            selected={selectedBook === item}
            onPress={() => setSelectedBook(item)}
            style={styles.bookChip}
            textStyle={styles.bookChipText}
          >
            {item}
          </Chip>
        )}
        style={styles.bookFilter}
        showsHorizontalScrollIndicator={false}
      />

      {/* Verses List */}
      <FlatList
        data={filteredVerses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVerse}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No verses yet!</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first verse</Text>
          </View>
        }
      />

      {/* Add Verse FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {/* Add Verse Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Verse</Text>

            <TextInput
              style={styles.input}
              placeholder="Book (e.g., Romans)"
              value={newVerse.book}
              onChangeText={(text) => setNewVerse({ ...newVerse, book: text })}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Chapter"
                keyboardType="numeric"
                value={newVerse.chapter}
                onChangeText={(text) => setNewVerse({ ...newVerse, chapter: text })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Verse"
                keyboardType="numeric"
                value={newVerse.verse}
                onChangeText={(text) => setNewVerse({ ...newVerse, verse: text })}
              />
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Verse text..."
              multiline
              numberOfLines={6}
              value={newVerse.text}
              onChangeText={(text) => setNewVerse({ ...newVerse, text: text })}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddVerse}
                style={styles.modalButton}
                buttonColor="#6366f1"
              >
                Add Verse
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  bookFilter: {
    paddingHorizontal: 16,
    marginBottom: 8,
    maxHeight: 50,
  },
  bookChip: {
    marginRight: 8,
  },
  bookChipText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  verseCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reference: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  masteryChip: {
    height: 28,
  },
  masteryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  verseText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },
  verseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  translation: {
    fontSize: 12,
    color: '#999',
  },
  practiced: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6366f1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default LibraryScreen;
