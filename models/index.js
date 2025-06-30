const sequelize = require('../config/sequelizer');

const Usuario = require('./userModel');
const Rol = require('./rolModel');
const UserRol = require('./user_rolModel');
const LoginAtt = require('./loginAttModel');
const Token = require('./tokenModel');


Usuario.hasMany(UserRol, { foreignKey: 'user_id' });
UserRol.belongsTo(Usuario, { foreignKey: 'user_id' });

Rol.hasMany(UserRol, { foreignKey: 'rol_id' });
UserRol.belongsTo(Rol, { foreignKey: 'rol_id' });

Usuario.hasMany(LoginAtt, { foreignKey: 'user_id' });
LoginAtt.belongsTo(Usuario, { foreignKey: 'user_id' });

//vincular tokens a usuarios:
// Usuario.hasMany(Token, { foreignKey: 'user_id' });
// Token.belongsTo(Usuario, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    Usuario,
    Rol,
    UserRol,
    LoginAtt,
    Token,
};
