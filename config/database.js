const { Pool } = require("pg");
require("dotenv").config();

const useSSL = String(process.env.DB_SSL || "true") === "true";

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: useSSL ? { require: true, rejectUnauthorized: false } : false,
    keepAlive: true,
});

pool.query("SELECT NOW()", (err) => {
    if (err) console.error("ERROR DE CONEXIÓN A LA BASE DE DATOS:", err.stack);
    else console.log("CONEXIÓN EXITOSA A LA BASE DE DATOS");
});

module.exports = pool;
