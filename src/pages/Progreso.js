import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import api from '../config/api';

export default function Progreso({ navigation }) {
  const [totalGoals, setTotalGoals] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [recentGoals, setRecentGoals] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      const allGoals = res.data;

      setTotalGoals(allGoals.length);

      // ✔ Metas completadas: current_chapters >= total_chapters
      const completed = allGoals.filter(
        g => g.current_chapters >= g.total_chapters
      );

      setCompletedGoals(completed.length);

      // ✔ Último logro
      const ordered = [...completed].sort(
        (a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      );
      setRecentGoals(ordered.slice(0, 1));

      // ✔ Porcentaje total
      if (allGoals.length > 0) {
        const percent = (completed.length / allGoals.length) * 100;
        setProgress(percent);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Progreso" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#58a6ff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Progreso" />

      <ScrollView style={styles.content}>

        {/* --- Círculo de progreso --- */}
        <View style={styles.circleContainer}>
          <View
            style={[
              styles.circle,
              {
                borderColor:
                  progress >= 100
                    ? '#34C759'
                    : progress >= 50
                    ? '#FFD60A'
                    : '#FF3B30',
              },
            ]}
          >
            <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
          </View>
        </View>

        {/* --- Detalles --- */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>
            Metas completadas: {completedGoals}/{totalGoals}
          </Text>

          <Text style={styles.motivationText}>
            {progress === 100
              ? '¡Felicidades! Completaste todas tus metas 🎉'
              : progress >= 50
              ? '¡Vas por muy buen camino!'
              : progress > 0
              ? 'No te detengas, cada capítulo cuenta 📚'
              : 'Crea tus primeras metas para comenzar 🚀'}
          </Text>
        </View>

        {/* --- Logro reciente --- */}
        {recentGoals.length > 0 ? (
          <View style={styles.recentContainer}>
            <Text style={styles.recentTitle}>Logro Reciente</Text>

            {recentGoals.map((g, idx) => (
              <View key={idx} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.checkmark}>✅</Text>
                </View>

                <View style={styles.achievementDetails}>
                  <Text style={styles.achievementTitle}>{g.title}</Text>

                  <Text style={styles.achievementDate}>
                    {new Date(g.updated_at || g.created_at).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Aún no tienes metas completadas.</Text>
          </View>
        )}

        {/* --- Botón Logros --- */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Logros')}
        >
          <Ionicons name="trophy" size={20} color="#fff" />
          <Text style={styles.buttonText}>Ver todos los logros</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  circleContainer: { alignItems: 'center', marginBottom: 30 },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(88,166,255,0.1)',
  },
  percentageText: { fontSize: 48, color: '#58a6ff', fontWeight: 'bold' },
  detailsContainer: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  detailsText: { fontSize: 16, color: '#c9d1d9', marginBottom: 10, fontWeight: '600' },
  motivationText: { fontSize: 14, color: '#8b949e', fontStyle: 'italic', textAlign: 'center' },
  recentContainer: { marginBottom: 25 },
  recentTitle: { fontSize: 18, fontWeight: '600', color: '#bb86fc', marginBottom: 12 },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#58a6ff',
    alignItems: 'center',
  },
  achievementIcon: { marginRight: 15 },
  checkmark: { fontSize: 28 },
  achievementDetails: { flex: 1 },
  achievementTitle: { fontSize: 16, color: '#c9d1d9', fontWeight: '600' },
  achievementDate: { fontSize: 12, color: '#6a737d' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#8b949e', marginTop: 15, textAlign: 'center' },
  button: {
    backgroundColor: '#238636',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
});
