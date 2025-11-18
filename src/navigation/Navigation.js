import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, TouchableOpacity, Alert } from 'react-native';

import Login from '../pages/Login';
import Registro from '../pages/Registro';
import Metas from '../pages/Metas';
import NuevaMeta from '../pages/NuevaMeta';
import Progreso from '../pages/Progreso';
import Busqueda from '../pages/Busqueda';
import Logros from '../pages/Logros';
import Wishlist from '../pages/Wishlist';
import Reminders from '../pages/Reminders';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Pantallas autenticadas con menú inferior
function HomeScreens() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Metas') iconName = 'list';
          else if (route.name === 'Reminders') iconName = 'notifications';
          else if (route.name === 'Progreso') iconName = 'trending-up';
          else if (route.name === 'Busqueda') iconName = 'search';
          else if (route.name === 'Logros') iconName = 'trophy';
          else if (route.name === 'Wishlist') iconName = 'heart';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Metas" 
        component={Metas} 
        options={{ title: 'Mis Metas' }}
      />
      <Tab.Screen 
        name="Reminders" 
        component={Reminders} 
        options={{ title: 'Recordatorios' }}
      />
      <Tab.Screen 
        name="Progreso" 
        component={Progreso} 
        options={{ title: 'Progreso' }}
      />
      <Tab.Screen 
        name="Busqueda" 
        component={Busqueda} 
        options={{ title: 'Buscar' }}
      />
      <Tab.Screen 
        name="Logros" 
        component={Logros} 
        options={{ title: 'Logros' }}
      />
      <Tab.Screen 
        name="Wishlist" 
        component={Wishlist} 
        options={{ title: 'Wishlist' }}
      />
    </Tab.Navigator>
  );
}

// Navigator principal
export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación inicial
    checkAuth();
    
    // Verificar cambios cada 300ms
    const interval = setInterval(checkAuth, 300);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        console.log('✅ Token encontrado - MOSTRAR METAS');
        setIsLoggedIn(true);
      } else {
        console.log('❌ Sin token - MOSTRAR LOGIN');
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error('Error en checkAuth:', err);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Cerrar sesión',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              
              console.log('🔓 Sesión cerrada');
              setIsLoggedIn(false);
            } catch (err) {
              console.error('Error al cerrar sesión:', err);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1117' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          // SIN AUTENTICACIÓN
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen 
              name="Login" 
              component={Login}
              options={{ animationEnabled: false }}
            />
            <Stack.Screen 
              name="Registro" 
              component={Registro}
              options={{ animationEnabled: false }}
            />
          </Stack.Group>
        ) : (
          // CON AUTENTICACIÓN
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen 
              name="Home" 
              component={HomeScreens}
              options={{ animationEnabled: false }}
            />
            <Stack.Screen 
              name="NuevaMeta" 
              component={NuevaMeta}
              options={{
                headerShown: true,
                title: 'Nueva Meta',
                headerStyle: {
                  backgroundColor: '#0d1117',
                },
                headerTintColor: '#58a6ff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                headerRight: () => (
                  <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out" size={24} color="#ff4444" />
                  </TouchableOpacity>
                ),
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}