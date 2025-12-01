// models/pizzeriaModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizer');

const Pizzeria = sequelize.define('pizzerias', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    // Nombre que usarás en la app (Pantalla, tickets, etc.)
    nombre: {
        type: DataTypes.STRING(120),
        allowNull: false
    },

    // Opcional: nombre legal / razón social (para facturación)
    razon_social: {
        type: DataTypes.STRING(180),
        allowNull: true
    },

    // RFC de la pizzería (si vas a facturar)
    rfc: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    // Datos de contacto
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email_contacto: {
        type: DataTypes.STRING(120),
        allowNull: true
    },

    // Dirección básica
    calle: {
        type: DataTypes.STRING(120),
        allowNull: true
    },
    numero: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    colonia: {
        type: DataTypes.STRING(120),
        allowNull: true
    },
    ciudad: {
        type: DataTypes.STRING(120),
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING(120),
        allowNull: true
    },
    cp: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    pais: {
        type: DataTypes.STRING(60),
        allowNull: true,
        defaultValue: 'México'
    },

    // Para el SaaS: saber si es cliente activo y si es ambiente demo/prueba
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_test: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Auditoría
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: true
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
    tableName: 'pizzerias',
    hooks: {
        beforeUpdate: (pizzeria) => {
            pizzeria.update_at = new Date();
        }
    }
});

module.exports = Pizzeria;
