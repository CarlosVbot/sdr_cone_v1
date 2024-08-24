const {Pool} = require('pg')
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

pool.connect((err,client,release)=>{
    if(err){
        return console.error('ERROR DB CONECCION', err.stack);
    }
    console.log('CONECTADO!!')
    release()
})

module.exports = pool