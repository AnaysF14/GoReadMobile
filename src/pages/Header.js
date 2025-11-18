import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Header({ title }) {
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
            } catch (err) {
              console.error('Error:', err);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        <Ionicons name="book" size={28} color="#58a6ff" style={styles.icon} />
        <Text style={styles.logo}>GoRead</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    marginTop: 10,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#58a6ff',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c9d1d9',
    flex: 1,
    textAlign: 'center',
  },
  logoutBtn: {
    padding: 8,
  },
});