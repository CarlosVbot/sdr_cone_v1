const sequelize = require('../config/sequelizer');

const Usuario = require('./userModel');
const Rol = require('./rolModel');
const UserRol = require('./user_rolModel');
const LoginAtt = require('./loginAttModel');
const Token = require('./tokenModel');
const Pizzeria = require('./pizzeriaModel');
const Producto = require('./productoModel');
const Pedido = require('./pedidoModel');
const PedidoDetalle = require('./pedidoDetalleModel');
const Extra = require('./extraModel'); // <-- nuevo modelo

// =====================
// Relaciones de usuarios / roles
// =====================

Usuario.hasMany(UserRol, { foreignKey: 'user_id' });
UserRol.belongsTo(Usuario, { foreignKey: 'user_id' });

Rol.hasMany(UserRol, { foreignKey: 'rol_id' });
UserRol.belongsTo(Rol, { foreignKey: 'rol_id' });

Usuario.hasMany(LoginAtt, { foreignKey: 'user_id' });
LoginAtt.belongsTo(Usuario, { foreignKey: 'user_id' });

// =====================
// Relaciones de Pizzería
// =====================

Pizzeria.hasMany(Usuario, { foreignKey: 'pizzeria_id' });
Usuario.belongsTo(Pizzeria, { foreignKey: 'pizzeria_id' });

Pizzeria.hasMany(Producto, { foreignKey: 'pizzeria_id' });
Producto.belongsTo(Pizzeria, { foreignKey: 'pizzeria_id' });

Pizzeria.hasMany(Pedido, { foreignKey: 'pizzeria_id' });
Pedido.belongsTo(Pizzeria, { foreignKey: 'pizzeria_id' });

// Extras por pizzería
Pizzeria.hasMany(Extra, { foreignKey: 'pizzeria_id' });
Extra.belongsTo(Pizzeria, { foreignKey: 'pizzeria_id' });

// =====================
// Relaciones de pedidos
// =====================

Usuario.hasMany(Pedido, { foreignKey: 'usuario_id' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Pedido.hasMany(PedidoDetalle, { foreignKey: 'pedido_id' });
PedidoDetalle.belongsTo(Pedido, { foreignKey: 'pedido_id' });

// Producto normal
Producto.hasMany(PedidoDetalle, { foreignKey: 'producto_id' });
PedidoDetalle.belongsTo(Producto, { foreignKey: 'producto_id' });

// Extra como línea de detalle
Extra.hasMany(PedidoDetalle, { foreignKey: 'extra_id' });
PedidoDetalle.belongsTo(Extra, { foreignKey: 'extra_id' });

// Relación padre -> extras (línea de detalle que tiene extras)
PedidoDetalle.hasMany(PedidoDetalle, {
    as: 'extras',
    foreignKey: 'parent_detalle_id'
});
PedidoDetalle.belongsTo(PedidoDetalle, {
    as: 'parentDetalle',
    foreignKey: 'parent_detalle_id'
});

// =====================
// Exportar modelos
// =====================

module.exports = {
    sequelize,
    Usuario,
    Rol,
    UserRol,
    LoginAtt,
    Token,
    Pizzeria,
    Producto,
    Pedido,
    PedidoDetalle,
    Extra
};
