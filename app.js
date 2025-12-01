const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');

// Rutas existentes (usuarios / auth)
const userRoutes = require('./routes/userRouters');

// 🔹 Nuevas rutas para la pizzería
const productoRoutes = require('./routes/productoRouters');
const pedidoRoutes = require('./routes/pedidoRouters');

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', userRoutes);          // login / register / usuarios
app.use('/api/productos', productoRoutes); // menú (pizzas, bebidas, etc.)
app.use('/api/pedidos', pedidoRoutes);     // órdenes/pedidos

// Manejador de errores
app.use(errorHandler);

module.exports = app;
