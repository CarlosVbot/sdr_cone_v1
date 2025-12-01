// models/pedidoModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizer');
const Usuario = require('./userModel');
const Pizzeria = require('./pizzeriaModel');

const Pedido = sequelize.define('pedidos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    pizzeria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Pizzeria,
            key: 'id'
        }
    },

    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Usuario,
            key: 'id'
        }
    },

    tipo: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'MOSTRADOR'
    },

    mesa: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    origen: {
        type: DataTypes.STRING(30),
        allowNull: true,
        defaultValue: 'LOCAL'
    },

    status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'PENDIENTE'
    },

    metodo_pago: {
        type: DataTypes.STRING(30),
        allowNull: true
    },

    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },

    notas: {
        type: DataTypes.TEXT,
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
    tableName: 'pedidos',
    hooks: {
        beforeUpdate: (pedido) => {
            pedido.update_at = new Date();
        }
    }
});

module.exports = Pedido;
