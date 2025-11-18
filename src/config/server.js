const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS habilitado para desarrollo
app.use(cors({
  origin: '*', // En producción, usa tu dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... tus rutas (auth, goals, etc)

const PORT = process.env.PORT || 5000;

// ✅ IMPORTANTE: escucha en 0.0.0.0 (todas las interfaces)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Accede desde móvil: http://192.168.0.11:${PORT}`);
  console.log(`💻 Accede desde este PC: http://localhost:${PORT}\n`);
});