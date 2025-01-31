const express = require('express');
const authRoutes = require('./routes/userRouters');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Manejo de errores
app.use(errorHandler);

module.exports = app;