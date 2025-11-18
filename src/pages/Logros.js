import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import api from '../config/api';

export default function Logros() {
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogros();
  }, []);

  const fetchLogros = async () => {
    try {
      const res = await api.get('/goals/completadas');
      setLogros(res.data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Logros" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#b57aff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Logros" />

      {logros.length > 0 ? (
        <FlatList
          data={logros}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.achievementCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✅</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          )}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Ionicons name="medal-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>
            Aún no tienes logros. ¡Completa metas para ganar uno! 
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1b1b',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#292929',
    borderLeftWidth: 5,
    borderLeftColor: '#9b4dff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e3e3e3',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
});