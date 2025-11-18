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
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export default function Metas({ navigation, route }) {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
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
      const pending = res.data.filter(g => !g.completed);
      setGoals(pending);
    } catch (err) {
      console.error('Error fetching goals:', err.response?.data);
      Alert.alert('Error', 'No se pudieron cargar las metas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Cerrar sesión',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              console.log('🔓 Token eliminado');
              // Navigation lo detectará automáticamente
            } catch (err) {
              console.error('Error:', err);
            }
          },
        },
      ]
    );
  };

  const addGoal = async () => {
    if (!title.trim() || !targetAmount || !dueDate) {
      Alert.alert('⚠️ Campos incompletos', 'Por favor llena todos los campos');
      return;
    }

    try {
      const res = await api.post('/goals', {
        title,
        targetAmount: parseInt(targetAmount),
        due_date: dueDate,
      });

      setGoals([res.data.goal, ...goals]);
      Alert.alert(' Meta agregada', 'Se ha registrado correctamente');
      setTitle('');
      setTargetAmount('');
      setDueDate('');
    } catch (err) {
      console.error('Error adding goal:', err.response?.data);
      Alert.alert('❌ Error', err.response?.data?.msg || 'No se pudo agregar la meta');
    }
  };

  const completeGoal = async (goalId) => {
    Alert.alert(
      '¿Marcar como completada?',
      'Esta meta se moverá a tus logros',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Sí, completar',
          onPress: async () => {
            try {
              await api.put(`/goals/${goalId}`);
              setGoals(goals.filter(g => g.id !== goalId));
              Alert.alert(' Meta completada', '¡Felicidades por lograr tu meta!');
            } catch (err) {
              console.error('Error completing goal:', err.response?.data);
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
      {/* Header con botón logout */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}> Tus Metas</Text>
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Información del libro si existe */}
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

        {/* Formulario */}
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
            placeholder="Cantidad de libros"
            placeholderTextColor="#999"
            value={targetAmount}
            onChangeText={setTargetAmount}
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

        {/* Lista de metas */}
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
                  <Text style={styles.metaBadge}>{goal.progress}/{goal.target_amount}</Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(goal.progress / goal.target_amount) * 100}%` },
                    ]}
                  />
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
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bb86fc',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  bookInfo: {
    backgroundColor: '#2c2f38',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  bookInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff9ae8',
    marginBottom: 15,
  },
  bookDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 15,
  },
  bookText: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#999',
  },
  formCard: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#9d4edd55',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#9d4edd',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  metasList: {
    marginBottom: 20,
  },
  metaItem: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#9d4edd33',
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bb86fc',
    flex: 1,
  },
  metaBadge: {
    backgroundColor: '#9d4edd',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27b1e7',
  },
  metaDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#27b1e7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#8b949e',
    fontSize: 16,
    marginTop: 15,
  },
});