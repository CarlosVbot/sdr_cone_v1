// models/cierreCajaModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizer');

const CierreCaja = sequelize.define('cierres_caja', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    pizzeria_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    desde: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    hasta: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    total_vendido: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    total_cancelado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    total_neto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    efectivo_teorico: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    efectivo_contado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    diferencia: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },

    // Desglose por método de pago (EFECTIVO, TARJETA, etc.)
    metodos_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },

    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    create_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    update_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    tableName: 'cierres_caja',
    hooks: {
        beforeUpdate: (cierre) => {
            cierre.update_at = new Date();
        }
    }
});

module.exports = CierreCaja;
