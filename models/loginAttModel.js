const {DataTypes} = require('sequelize')
const sequelize = require('../config/sequelizer')
const Usuario = require('./userModel')

const LoginAtt = sequelize.define('login_attempts',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id',
        }
    },
    create_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_successful: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: false,
    tableName: 'login_attempts',
})

module.exports = LoginAtt;
