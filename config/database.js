const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('ERROR DE CONEXIÓN A LA BASE DE DATOS:', err.stack);
    } else {
        console.log('CONEXIÓN EXITOSA A LA BASE DE DATOS');
    }
});

module.exports = pool;