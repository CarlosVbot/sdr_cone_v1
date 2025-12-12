const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const extraRoutes = require('./routes/extraRoutes');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');

// Rutas existentes (usuarios / auth)
const userRoutes = require('./routes/userRouters');

// 🔹 Nuevas rutas para la pizzería
const productoRoutes = require('./routes/productoRouters');
const pedidoRoutes = require('./routes/pedidoRouters');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', userRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);

app.use(errorHandler);

app.use('/api/extras', extraRoutes);
app.use('/api/cierres', require('./routes/cierreCajaRoutes'));

module.exports = app;
