const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizer');
const Pizzeria = require('./pizzeriaModel');

const Producto = sequelize.define('productos', {
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

    categoria: {
        type: DataTypes.STRING(60),
        allowNull: true
    },

    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    unidad: {
        type: DataTypes.STRING(30),
        allowNull: true,
        defaultValue: 'pieza'
    },

    orden: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    tableName: 'productos',
    hooks: {
        beforeUpdate: (producto) => {
            producto.update_at = new Date();
        }
    }
});

module.exports = Producto;
