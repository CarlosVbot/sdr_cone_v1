const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizer');
const Pedido = require('./pedidoModel');
const Producto = require('./productoModel');

const PedidoDetalle = sequelize.define('pedido_detalles', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Pedido,
            key: 'id'
        }
    },

    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Producto,
            key: 'id'
        }
    },

    cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1
    },

    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    notas: {
        type: DataTypes.STRING(255),
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
    tableName: 'pedido_detalles',
    hooks: {
        beforeUpdate: (detalle) => {
            detalle.update_at = new Date();
        }
    }
});

module.exports = PedidoDetalle;
