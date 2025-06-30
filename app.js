const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/userRouters');
const errorHandler = require('./middlewares/errorHandler');

require('dotenv').config();

const app = express();

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://unpkg.com",
                "'unsafe-eval'"
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        }
    })
);

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
