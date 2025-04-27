const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/userRouters');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use(cors());

app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;