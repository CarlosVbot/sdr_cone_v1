const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizer');
const Usuario = require('./userModel');

const Gasto = sequelize.define('gastos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    categoria: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date_end: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    periodo: {
        type: DataTypes.INTEGER,
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
    tableName: 'gastos'
});

module.exports = Gasto;
