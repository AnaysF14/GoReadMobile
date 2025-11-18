import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import api from '../config/api';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async () => {
    if (!title.trim()) {
      Alert.alert('⚠️ Campo vacío', 'Por favor ingresa el título del libro');
      return;
    }

    try {
      const res = await api.post('/wishlist', { title, author, notes });
      setWishlist([res.data, ...wishlist]);
      
      Alert.alert('📖 Agregado', 'Libro añadido a tu lista de deseos');
      setTitle('');
      setAuthor('');
      setNotes('');
      setShowForm(false);
    } catch (err) {
      console.error('Error adding book:', err);
      Alert.alert('❌ Error', err.response?.data?.msg || 'No se pudo agregar el libro');
    }
  };

  const removeBook = async (id) => {
    Alert.alert(
      '¿Eliminar libro?',
      '¿Estás seguro de que deseas eliminar este libro de tu lista?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await api.delete(`/wishlist/${id}`);
              setWishlist(wishlist.filter(item => item.id !== id));
              Alert.alert('🗑️ Eliminado', 'Libro eliminado de tu lista');
            } catch (err) {
              console.error('Error deleting book:', err);
              Alert.alert('❌ Error', 'No se pudo eliminar el libro');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Por Leer" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#60a5fa" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Por Leer" />

      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>Aún no tienes libros en tu lista 💭</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.countText}>
            {`Tienes ${wishlist.length} libro${wishlist.length > 1 ? 's' : ''} por leer`}
          </Text>
          <FlatList
            data={wishlist}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.bookRow}>
                <View style={styles.bookInfo}>
                  <View style={styles.bookIcon}>
                    <Text style={styles.bookIconText}>📘</Text>
                  </View>
                  <View style={styles.bookDetails}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    {item.author && <Text style={styles.bookAuthor}>👤 {item.author}</Text>}
                    {item.notes && <Text style={styles.bookNotes}>📝 {item.notes}</Text>}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeBook(item.id)}
                >
                  <Ionicons name="trash" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={true}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(!showForm)}
      >
        <Ionicons
          name={showForm ? 'close' : 'add'}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Modal del formulario */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar nueva lectura</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={28} color="#c9d1d9" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Título del libro"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Autor (opcional)"
              placeholderTextColor="#999"
              value={author}
              onChangeText={setAuthor}
            />

            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Notas o por qué quieres leerlo..."
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.saveButton} onPress={addBook}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelFormText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8b949e',
    marginTop: 15,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingBottom: 100,
  },
  countText: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginVertical: 15,
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  bookInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIcon: {
    marginRight: 12,
  },
  bookIconText: {
    fontSize: 24,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 2,
  },
  bookNotes: {
    fontSize: 12,
    color: '#94a3b8',
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#60a5fa',
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    color: '#f1f5f9',
  },
  textarea: {
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelFormButton: {
    flex: 1,
    backgroundColor: '#475569',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelFormText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});