require('dotenv').config();
const { sequelize } = require('./models');
const app = require('./app');
const initialSetup = require('./utils/initialSetup');

const port = process.env.PORT || 8000;

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

        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();