// server.js
require('dotenv').config();
const { sequelize } = require('./models');
const app = require('./app');
const initialSetup = require('./utils/initialSetup');
const WebSocket = require('ws');
const http = require('http');

const port =  8000;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');

    ws.on('message', (message) => {
        console.log('Mensaje recibido:', message);
    });

    ws.send(JSON.stringify({ type: 'connection', message: 'Conexión establecida' }));
});

const startServer = async () => {
    try {
        const syncInicial = process.env.SYNC === 'true';
        console.log(`Sincronización inicial: ${syncInicial}`);

        await sequelize.sync({ force: syncInicial });

        console.log('Base de datos y modelos sincronizados.');

        if (syncInicial) {
            console.log('Ejecutando configuración inicial...');
            await initialSetup();
        }

        server.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
            console.log(`WebSocket disponible en ws://localhost:${port}`);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();