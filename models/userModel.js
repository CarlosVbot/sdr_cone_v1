const {DataTypes} = require('sequelize')
const sequelize = require('../config/sequelizer')

const Usuario = sequelize.define('usuarios',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    create_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    update_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: false,
    tableName: 'usuarios',
})


module.exports = Usuario;