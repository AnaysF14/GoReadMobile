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
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!title.trim() || !targetAmount) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/goals', {
        title,
        target_amount: parseInt(targetAmount),
        due_date: dueDate.toISOString(),
      });

      // Notifica al padre que se agregó una meta
      route.params?.onSuccess?.();
      
      // Vuelve atrás
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

        {/* Input Título */}
        <View style={styles.inputWrapper}>
          <Ionicons name="list-outline" size={20} color="#a371f7" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Título de la meta"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </View>

        {/* Input Cantidad */}
        <View style={styles.inputWrapper}>
          <Ionicons name="calculator-outline" size={20} color="#a371f7" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Cantidad de libros/capítulos"
            placeholderTextColor="#999"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>

        {/* Selector de fecha */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
          disabled={loading}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Fecha límite</Text>
            <Text style={styles.dateValue}>{formatDate(dueDate)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* DatePicker Modal */}
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

        {/* Botón Guardar */}
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

        {/* Botón Cancelar */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  card: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#a371f755',
    borderRadius: 16,
    padding: 25,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fefdff',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    backgroundColor: '#0d1117',
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#c9d1d9',
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  dateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    color: '#c9d1d9',
    fontWeight: '600',
  },
  datePickerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161b22',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c9d1d9',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#a371f7',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#30363d',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
});