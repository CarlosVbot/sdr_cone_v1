const { Op } = require('sequelize');
const {
    Pedido,
    PedidoDetalle,
    Producto,
    Usuario,
    sequelize
} = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

// Crear pedido con sus detalles
exports.create = async (req, res) => {
    authenticateToken(req, res, async () => {
        const user = req.user || {};
        const usuario_id = user.id;
        const {
            tipo,
            mesa,
            origen,
            metodo_pago,
            notas,
            items,
            pizzeria_id: bodyPizzeriaId
        } = req.body;

        const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

        if (!pizzeria_id) {
            return res.status(400).json({ message: 'No se encontró pizzeria_id.' });
        }
        if (!usuario_id) {
            return res.status(400).json({ message: 'No se encontró usuario en el token.' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Debe enviar al menos un producto en items.' });
        }

        const t = await sequelize.transaction();
        try {
            const productIds = [...new Set(items.map(i => i.producto_id))];

            const productos = await Producto.findAll({
                where: { id: productIds, pizzeria_id },
                transaction: t
            });

            const productosMap = {};
            productos.forEach(p => {
                productosMap[p.id] = p;
            });

            let total = 0;
            const detallesData = [];

            for (const item of items) {
                const prod = productosMap[item.producto_id];
                if (!prod) {
                    throw new Error(`Producto ${item.producto_id} no encontrado en esta pizzería`);
                }

                const cantidad = Number(item.cantidad || 1);
                if (isNaN(cantidad) || cantidad <= 0) {
                    throw new Error('Cantidad inválida en uno de los productos');
                }

                const precio_unitario = parseFloat(prod.precio);
                const subtotal = cantidad * precio_unitario;
                total += subtotal;

                detallesData.push({
                    pedido_id: null, // se llenará después
                    producto_id: prod.id,
                    cantidad,
                    precio_unitario,
                    subtotal,
                    create_at: new Date(),
                    update_at: new Date(),
                    is_active: true
                });
            }

            const pedido = await Pedido.create(
                {
                    pizzeria_id,
                    usuario_id,
                    tipo: tipo || 'MOSTRADOR',
                    mesa: mesa || null,
                    origen: origen || 'LOCAL',
                    status: 'PENDIENTE',
                    metodo_pago: metodo_pago || null,
                    total,
                    notas: notas || null,
                    create_at: new Date(),
                    update_at: new Date(),
                    is_active: true
                },
                { transaction: t }
            );

            detallesData.forEach(d => {
                d.pedido_id = pedido.id;
            });

            await PedidoDetalle.bulkCreate(detallesData, { transaction: t });

            await t.commit();

            const pedidoCompleto = await Pedido.findOne({
                where: { id: pedido.id },
                include: [
                    {
                        model: PedidoDetalle,
                        include: [Producto]
                    },
                    {
                        model: Usuario,
                        attributes: ['id', 'username', 'email']
                    }
                ]
            });

            res.status(201).json({
                message: 'Pedido creado con éxito',
                data: pedidoCompleto
            });
        } catch (error) {
            await t.rollback();
            console.error('Error al crear pedido:', error);
            res.status(500).json({
                message: 'Error al crear pedido',
                error: error.message
            });
        }
    });
};

// Consultar pedidos (lista o uno)
exports.consult = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const user = req.user || {};
            const usuario_id = user.id || req.body.usuario_id;
            const {
                id,
                status,
                tipo,
                desde,
                hasta,
                pizzeria_id: bodyPizzeriaId
            } = req.body;

            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

            if (!pizzeria_id) {
                return res.status(400).json({ message: 'No se encontró pizzeria_id.' });
            }

            const where = { pizzeria_id, is_active: true };

            if (status) {
                where.status = status;
            }
            if (tipo) {
                where.tipo = tipo;
            }

            if (desde || hasta) {
                where.create_at = {};
                if (desde) where.create_at[Op.gte] = new Date(desde);
                if (hasta) where.create_at[Op.lte] = new Date(hasta);
            }

            if (id) {
                const pedido = await Pedido.findOne({
                    where: { ...where, id },
                    include: [
                        {
                            model: PedidoDetalle,
                            include: [Producto]
                        },
                        {
                            model: Usuario,
                            attributes: ['id', 'username', 'email']
                        }
                    ]
                });

                if (!pedido) {
                    return res.status(404).json({ message: 'Pedido no encontrado.' });
                }

                return res.status(200).json({
                    message: 'Pedido encontrado',
                    data: pedido
                });
            } else {
                const pedidos = await Pedido.findAll({
                    where,
                    include: [
                        {
                            model: PedidoDetalle,
                            include: [Producto]
                        },
                        {
                            model: Usuario,
                            attributes: ['id', 'username', 'email']
                        }
                    ],
                    order: [['create_at', 'DESC']]
                });

                return res.status(200).json({
                    message: 'Pedidos encontrados',
                    data: pedidos
                });
            }
        } catch (error) {
            console.error('Error al consultar pedidos:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });
};

// Cambiar estatus del pedido (PENDIENTE, PREPARACION, LISTO, ENTREGADO, CANCELADO)
exports.updateStatus = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const { id, status, pizzeria_id: bodyPizzeriaId } = req.body;

            if (!id || !status) {
                return res.status(400).json({ message: 'id y status son obligatorios.' });
            }

            const user = req.user || {};
            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

            const where = { id };
            if (pizzeria_id) {
                where.pizzeria_id = pizzeria_id;
            }

            const pedido = await Pedido.findOne({ where });

            if (!pedido) {
                return res.status(404).json({ message: 'Pedido no encontrado.' });
            }

            await pedido.update({
                status,
                update_at: new Date()
            });

            res.status(200).json({
                message: 'Estatus de pedido actualizado',
                data: pedido
            });
        } catch (error) {
            console.error('Error al actualizar estatus de pedido:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });
};

// Cancelar pedido (marcar CANCELADO + is_active = false opcional)
exports.cancel = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const { id, pizzeria_id: bodyPizzeriaId } = req.body;

            if (!id) {
                return res.status(400).json({ message: 'id es obligatorio.' });
            }

            const user = req.user || {};
            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

            const where = { id };
            if (pizzeria_id) {
                where.pizzeria_id = pizzeria_id;
            }

            const pedido = await Pedido.findOne({ where });

            if (!pedido) {
                return res.status(404).json({ message: 'Pedido no encontrado.' });
            }

            await pedido.update({
                status: 'CANCELADO',
                is_active: false,
                update_at: new Date()
            });

            res.status(200).json({
                message: 'Pedido cancelado',
                data: pedido
            });
        } catch (error) {
            console.error('Error al cancelar pedido:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });
};

exports.updateItems = async (req, res) => {
    authenticateToken(req, res, async () => {
        const user = req.user || {};
        const {
            id,              // id del pedido
            items,           // nuevo arreglo de productos
            pizzeria_id: bodyPizzeriaId
        } = req.body;

        const pizzeria_id = 1;

        if (!id) {
            return res.status(400).json({ message: 'id del pedido es obligatorio.' });
        }
        if (!pizzeria_id) {
            return res.status(400).json({ message: 'No se encontró pizzeria_id.' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Debe enviar al menos un producto en items.' });
        }

        const t = await sequelize.transaction();

        try {
            const pedido = await Pedido.findOne({
                where: { id, pizzeria_id, is_active: true },
                transaction: t
            });

            if (!pedido) {
                await t.rollback();
                return res.status(404).json({ message: 'Pedido no encontrado.' });
            }

            if (pedido.status === 'ENTREGADO' || pedido.status === 'CANCELADO') {
                await t.rollback();
                return res.status(400).json({ message: 'No se pueden editar productos de un pedido ENTREGADO o CANCELADO.' });
            }

            // 2) Borrar detalles actuales (duro y directo; para demo es suficiente)
            await PedidoDetalle.destroy({
                where: { pedido_id: id },
                transaction: t
            });

            const productIds = [...new Set(items.map(i => i.producto_id))];

            const productos = await Producto.findAll({
                where: { id: productIds, pizzeria_id },
                transaction: t
            });

            const productosMap = {};
            productos.forEach(p => {
                productosMap[p.id] = p;
            });

            let total = 0;
            const detallesData = [];

            for (const item of items) {
                const prod = productosMap[item.producto_id];
                if (!prod) {
                    throw new Error(`Producto ${item.producto_id} no encontrado en esta pizzería`);
                }

                const cantidad = Number(item.cantidad || 1);
                if (isNaN(cantidad) || cantidad <= 0) {
                    throw new Error('Cantidad inválida en uno de los productos');
                }

                const precio_unitario = parseFloat(prod.precio);
                const subtotal = cantidad * precio_unitario;
                total += subtotal;

                detallesData.push({
                    pedido_id: id,
                    producto_id: prod.id,
                    cantidad,
                    precio_unitario,
                    subtotal,
                    create_at: new Date(),
                    update_at: new Date(),
                    is_active: true
                });
            }

            // 4) Crear de nuevo los detalles
            await PedidoDetalle.bulkCreate(detallesData, { transaction: t });

            // 5) Actualizar total del pedido
            await pedido.update(
                {
                    total,
                    update_at: new Date()
                },
                { transaction: t }
            );

            await t.commit();

            // 6) Volver a traer el pedido completo con detalles y usuario
            const pedidoCompleto = await Pedido.findOne({
                where: { id: pedido.id },
                include: [
                    {
                        model: PedidoDetalle,
                        include: [Producto]
                    },
                    {
                        model: Usuario,
                        attributes: ['id', 'username', 'email']
                    }
                ]
            });

            return res.status(200).json({
                message: 'Productos del pedido actualizados con éxito',
                data: pedidoCompleto
            });
        } catch (error) {
            await t.rollback();
            console.error('Error al actualizar productos del pedido:', error);
            return res.status(500).json({
                message: 'Error al actualizar productos del pedido',
                error: error.message
            });
        }
    });
};
