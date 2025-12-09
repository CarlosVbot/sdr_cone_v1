const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizer');
const Pizzeria = require('./pizzeriaModel');

const Extra = sequelize.define('extras', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    pizzeria_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Pizzeria,
            key: 'id'
        }
    },

    nombre: {
        type: DataTypes.STRING(120),
        allowNull: false
    },

    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    create_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    update_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: false,
    tableName: 'extras',
    hooks: {
        beforeUpdate: (extra) => {
            extra.update_at = new Date();
        }
    }
});

module.exports = Extra;
