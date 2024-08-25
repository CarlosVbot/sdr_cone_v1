const {DataTypes} = require('sequelize')
const sequelize = require('../config/sequelizer')

const Token = sequelize.define('tokens',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    token: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    create_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    expirate_at: {
        type: DataTypes.DATE,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: false,
    tableName: 'tokens',
})

module.exports = Token;