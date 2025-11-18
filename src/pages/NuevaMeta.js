import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../config/api';

export default function NuevaMeta({ navigation, route }) {
  const [title, setTitle] = useState('');
  const [totalChapters, setTotalChapters] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  const formatDate = d => d.toISOString().split('T')[0];

  const handleSave = async () => {
    if (!title.trim() || !totalChapters) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/goals', {
        title,
        total_chapters: parseInt(totalChapters),
        current_chapters: 0,
        due_date: dueDate.toISOString(),
      });

      route.params?.onSuccess?.();
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al crear la meta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}> Crear Nueva Meta</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Título */}
        <View style={styles.inputWrapper}>
          <Ionicons name="list-outline" size={22} color="#a371f7" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Título de la meta"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </View>

        {/* Capítulos */}
        <View style={styles.inputWrapper}>
          <Ionicons name="book-outline" size={22} color="#a371f7" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Cantidad de capítulos"
            placeholderTextColor="#999"
            value={totalChapters}
            onChangeText={setTotalChapters}
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>

        {/* Fecha */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
          disabled={loading}
        >
          <Ionicons name="calendar" size={22} color="#a371f7" />
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Fecha límite</Text>
            <Text style={styles.dateValue}>{formatDate(dueDate)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {showDatePicker && (
          <Modal transparent animationType="slide">
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <Text style={styles.datePickerTitle}>Selecciona fecha</Text>

                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.datePickerButtonText, { color: '#a371f7' }]}>Listo</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            </View>
          </Modal>
        )}

        {/* Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar Meta</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117', padding: 20 },
  card: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#a371f755',
    borderRadius: 16,
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: '#0d1117',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, color: '#c9d1d9', fontSize: 16 },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#0d1117',
  },
  dateInfo: { flex: 1, marginLeft: 12 },
  dateLabel: { fontSize: 12, color: '#777' },
  dateValue: { fontSize: 16, fontWeight: '600', color: '#fff' },
  datePickerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#161b22',
    padding: 12,
  },
  datePickerTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  datePickerButtonText: { color: '#999', fontSize: 16 },
  saveButton: {
    backgroundColor: '#a371f7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#30363d',
    marginTop: 10,
  },
  cancelButtonText: { color: '#aaa', textAlign: 'center' },
});
