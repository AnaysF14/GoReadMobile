import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import api from '../config/api';

export default function Reminders({ navigation }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/goals');
      const goals = res.data;

      const reminders = goals.map((g) => {
        let message = '';
        const today = new Date();
        const due = new Date(g.due_date);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        if (g.completed) {
          message = ' ¡Has completado esta meta!';
        } else if (diff <= 0) {
          message = ' Esta meta ya venció, ¡a ponerse al día!';
        } else if (diff === 1) {
          message = ' Mañana vence esta meta';
        } else {
          message = ` Te quedan ${diff} días para completarla.`;
        }

        return {
          id: g.id,
          title: g.title,
          message,
          remind_at: g.due_date,
          completed: g.completed,
          daysLeft: diff,
        };
      });

      reminders.sort((a, b) => a.daysLeft - b.daysLeft);
      setReminders(reminders);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReminders();
  };

  const getReminderColor = (completed, daysLeft) => {
    if (completed) return '#27b1e7';
    if (daysLeft <= 0) return '#ff4444';
    if (daysLeft === 1) return '#ffb700';
    return '#9d4edd';
  };

  const getReminderIcon = (completed, daysLeft) => {
    if (completed) return 'checkmark-circle';
    if (daysLeft <= 0) return 'alert-circle';
    if (daysLeft === 1) return 'calendar';
    return 'clock';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Recordatorios" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#bb86fc" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Recordatorios" />

      {reminders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No tienes metas registradas todavía.</Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.reminderCard,
                {
                  borderLeftColor: getReminderColor(item.completed, item.daysLeft),
                },
              ]}
            >
              <View style={styles.reminderHeader}>
                <Ionicons
                  name={getReminderIcon(item.completed, item.daysLeft)}
                  size={24}
                  color={getReminderColor(item.completed, item.daysLeft)}
                  style={styles.reminderIcon}
                />
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{item.title}</Text>
                  <Text style={styles.reminderMessage}>{item.message}</Text>
                </View>
              </View>

              <View style={styles.reminderFooter}>
                <Text style={styles.reminderDate}>
                  {new Date(item.remind_at).toLocaleDateString('es-MX')}
                </Text>
                {item.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✅ Completada</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#58a6ff"
              colors={['#58a6ff']}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
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
  reminderCard: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  reminderDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: 'rgba(39, 177, 231, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27b1e7',
  },
  completedText: {
    fontSize: 12,
    color: '#27b1e7',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8b949e',
    marginTop: 15,
  },
});