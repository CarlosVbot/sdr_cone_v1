const {DataTypes} = require('sequelize')
const sequelize = require('../config/sequelizer')

const Rol = sequelize.define('roles',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
    users_admin: {
        type: DataTypes.STRING(2),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    timestamps: false,
    tableName: 'roles',
})

module.exports = Rol;
