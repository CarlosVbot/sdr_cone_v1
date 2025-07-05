const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/userRouters');
const errorHandler = require('./middlewares/errorHandler');
const ingresoRoutes = require('./routes/ingresoRouters');
const gastoRoutes = require('./routes/gastoRouters');

require('dotenv').config();

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/gastos', gastoRoutes);

app.use(errorHandler);

module.exports = app;
