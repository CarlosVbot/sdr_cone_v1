const {DataTypes} = require('sequelize')
const sequelize = require('../config/sequelizer')

const Usuario = sequelize.define('usuarios',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    full_name: {
        type: DataTypes.STRING(120),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    pizzeria_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    hooks: {
        beforeUpdate: (user) => {
            user.update_at = new Date();
        }
    }
})



module.exports = Usuario;