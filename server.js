const app = require('./app');
const sequelize = require('./config/sequelizer');
const initialSetup = require('./utils/initialSetup');

const port = process.env.PORT || 8000;
//Akira estuvo aqui
// Sincronizar la base de datos y realizar la configuración inicial
const startServer = async () => {
    try {
        const syncInicial = process.env.SYNC === 'true';
        console.log('syncInicial');
        console.log(syncInicial);
        await sequelize.sync({ force: syncInicial });
        console.log('Base de datos y tablas creadas.');

        if (syncInicial) {
            console.log('Configuración inicial...');
            await initialSetup();
        }

        // Iniciar el servidor
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();