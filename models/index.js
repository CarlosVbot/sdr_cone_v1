const sequelize = require('../config/sequelizer');

const Usuario = require('./userModel');
const Rol = require('./rolModel');
const UserRol = require('./user_rolModel');
const LoginAtt = require('./loginAttModel');
const Token = require('./tokenModel');

const Gasto = require('./gastoModel');
const Ingreso = require('./ingresoModel');


Usuario.hasMany(UserRol, { foreignKey: 'user_id' });
UserRol.belongsTo(Usuario, { foreignKey: 'user_id' });

Rol.hasMany(UserRol, { foreignKey: 'rol_id' });
UserRol.belongsTo(Rol, { foreignKey: 'rol_id' });

Usuario.hasMany(LoginAtt, { foreignKey: 'user_id' });
LoginAtt.belongsTo(Usuario, { foreignKey: 'user_id' });


Usuario.hasMany(Gasto, { foreignKey: 'user_id' });
Gasto.belongsTo(Usuario, { foreignKey: 'user_id' });

Usuario.hasMany(Ingreso, { foreignKey: 'user_id' });
Ingreso.belongsTo(Usuario, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    Usuario,
    Rol,
    UserRol,
    LoginAtt,
    Token,
    Gasto,
    Ingreso
};
