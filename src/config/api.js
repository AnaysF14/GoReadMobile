import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANTE: Usa tu IP local
const API_URL = "https://goread-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor: añade token en cada request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    // Asegúrate que tenga "Bearer " adelante
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = bearerToken;
    console.log('📤 Token enviado:', bearerToken.substring(0, 20) + '...');
  }
  return config;
});

// Interceptor: maneja errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;