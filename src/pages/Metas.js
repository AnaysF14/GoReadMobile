import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export default function Metas({ navigation, route }) {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [totalChapters, setTotalChapters] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (route.params?.book) {
      setSelectedBook(route.params.book);
    }
    fetchGoals();
  }, [route.params?.book]);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      const pending = res.data.filter(g => g.current_chapters < g.total_chapters);
      setGoals(pending);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar las metas');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!title.trim() || !totalChapters || !dueDate) {
      return Alert.alert('⚠️ Campos incompletos', 'Por favor llena todos los campos');
    }

    try {
      const res = await api.post('/goals', {
        title,
        total_chapters: parseInt(totalChapters),
        current_chapters: 0,
        due_date: dueDate,
      });

      setGoals([res.data.goal, ...goals]);

      setTitle('');
      setTotalChapters('');
      setDueDate('');

      Alert.alert(' Meta agregada', 'Se ha registrado correctamente');
    } catch (err) {
      Alert.alert('❌ Error', err.response?.data?.msg || 'No se pudo agregar la meta');
    }
  };

  const completeGoal = async id => {
    Alert.alert(
      '¿Marcar como completada?',
      'Esta meta se moverá a tus logros',
      [
        { text: 'Cancelar' },
        {
          text: 'Sí, completar',
          onPress: async () => {
            try {
              await api.put(`/goals/${id}`);
              setGoals(goals.filter(g => g.id !== id));
              Alert.alert(' Meta completada', '¡Felicidades por tu logro!');
            } catch (err) {
              Alert.alert('❌ Error', 'No se pudo completar la meta');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#bb86fc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}> Tus Metas</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={18} color="#ff4444" />
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>

        {/* LIBRO seleccionado */}
        {selectedBook && (
          <View style={styles.bookInfo}>
            <Text style={styles.bookInfoTitle}>Agregar el libro a una meta</Text>
            <View style={styles.bookDetails}>
              <Image
                source={{
                  uri:
                    selectedBook.volumeInfo?.imageLinks?.thumbnail ||
                    'https://via.placeholder.com/150',
                }}
                style={styles.bookCover}
              />
              <View style={styles.bookText}>
                <Text style={styles.bookTitle}>{selectedBook.volumeInfo?.title}</Text>
                <Text style={styles.bookAuthor}>
                  {selectedBook.volumeInfo?.authors?.join(', ') || 'Autor desconocido'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* NUEVA META */}
        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Título de la meta"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Capítulos totales"
            placeholderTextColor="#999"
            value={totalChapters}
            onChangeText={setTotalChapters}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha límite (YYYY-MM-DD)"
            placeholderTextColor="#999"
            value={dueDate}
            onChangeText={setDueDate}
          />

          <TouchableOpacity style={styles.addButton} onPress={addGoal}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Agregar Meta</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE METAS */}

        {goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No tienes metas pendientes 🎉</Text>
          </View>
        ) : (
          <View style={styles.metasList}>
            {goals.map(goal => (
              <View key={goal.id} style={styles.metaItem}>
                <View style={styles.metaHeader}>
                  <Text style={styles.metaTitle}>{goal.title}</Text>

                  {/* Capítulos (sin barra) */}
                  <Text style={styles.metaBadge}>
                    {goal.current_chapters}/{goal.total_chapters}
                  </Text>
                </View>

                {goal.due_date && (
                  <Text style={styles.metaDate}>
                    ⏰ {new Date(goal.due_date).toLocaleDateString('es-MX')}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => completeGoal(goal.id)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.completeButtonText}>Marcar como completada</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    marginTop: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#bb86fc' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: { color: '#ff4444', marginLeft: 6 },
  content: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  formCard: {
    backgroundColor: '#161b22',
    padding: 20,
    borderRadius: 16,
    borderColor: '#9d4edd55',
    borderWidth: 1,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#9d4edd',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', marginLeft: 8, fontSize: 16 },
  metasList: { marginBottom: 20 },
  metaItem: {
    backgroundColor: '#161b22',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9d4edd33',
    marginBottom: 15,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaTitle: { color: '#bb86fc', fontWeight: '600' },
  metaBadge: {
    backgroundColor: '#9d4edd',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  metaDate: { color: '#aaa', marginBottom: 10 },
  completeButton: {
    backgroundColor: '#27b1e7',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  completeButtonText: { color: '#fff', marginLeft: 8 },
});
