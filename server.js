const express = require('express')
const coneccion = require('./config/database')
const sequelize = require('./config/sequelizer')

const app = express()
const port = 8000

app.get('/',(req,res)=>{
    res.send(sequelize)
})

app.listen(port, ()=>{
    console.log('server running')
})