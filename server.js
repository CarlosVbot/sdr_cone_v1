const express = require('express')
const coneccion = require('./config/database')
const sequelize = require('./config/sequelizer')
const Usuario = require('./models/userModel')
const Rol = require('./models/rolModel')
const token = require('./models/tokenModel')
const LoginAtt = require('./models/loginAttModel')
const UserRol = require('./models/user_rolModel')
const authRoutes = require('./routes/userRouters.js');
require('dotenv').config();

/*let sync =  process.env.SYNC;
console.log(sync);*/
const app = express()
const port = 8000

app.use(express.json());

app.use('/api/auth', authRoutes);

/*if(sync === 'true') {

    sequelize.sync({force: true})
        .then(() => {
            console.log('Base de datos y tablas creadas');
        })
        .catch(err => {
            console.error('Error al sincronizar la base de datos:', err);
        });
    process.env.SYNC = 'false';
}else{*/
    sequelize.sync({force: true})
        .then(() => {
            console.log('Base de datos y tablas creadas');
        })
        .catch(err => {
            console.error('Error al sincronizar la base de datos:', err);
        });
//}

app.listen(port, ()=>{
    console.log('server running')
})