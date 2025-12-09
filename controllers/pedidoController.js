const { Op } = require('sequelize');
const {
    Pedido,
    PedidoDetalle,
    Producto,
    Usuario,
    sequelize,
    Extra,
} = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

// Crear pedido con sus detalles
// Crear pedido con sus detalles (productos + extras)
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
            // 1) Juntamos IDs de productos y extras usados
            const productIds = [];
            const extraIdsSet = new Set();

            for (const item of items) {
                if (item.producto_id) {
                    productIds.push(item.producto_id);
                }
                if (Array.isArray(item.extras)) {
                    for (const ex of item.extras) {
                        if (ex.extra_id) {
                            extraIdsSet.add(ex.extra_id);
                        }
                    }
                }
            }

            const uniqueProductIds = [...new Set(productIds)];
            const extraIds = [...extraIdsSet];

            // 2) Consultamos catálogo de productos y extras
            const [productos, extrasCat] = await Promise.all([
                Producto.findAll({
                    where: { id: uniqueProductIds, pizzeria_id },
                    transaction: t
                }),
                extraIds.length
                    ? Extra.findAll({
                        where: { id: extraIds, pizzeria_id, is_active: true },
                        transaction: t
                    })
                    : Promise.resolve([])
            ]);

            const productosMap = {};
            productos.forEach(p => {
                productosMap[p.id] = p;
            });

            const extrasMap = {};
            extrasCat.forEach(e => {
                extrasMap[e.id] = e;
            });

            // 3) Crear el pedido con total = 0 (lo calculamos después)
            const pedido = await Pedido.create(
                {
                    pizzeria_id,
                    usuario_id,
                    tipo: tipo || 'MOSTRADOR',
                    mesa: mesa || null,
                    origen: origen || 'LOCAL',
                    status: 'EN PREPARACION',
                    metodo_pago: metodo_pago || null,
                    total: 0,
                    notas: notas || null,
                    create_at: new Date(),
                    update_at: new Date(),
                    is_active: true
                },
                { transaction: t }
            );

            let total = 0;

            // 4) Crear detalles de productos y sus extras
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

                // Crear línea base del producto
                const detalleBase = await PedidoDetalle.create(
                    {
                        pedido_id: pedido.id,
                        producto_id: prod.id,
                        extra_id: null,
                        parent_detalle_id: null,
                        cantidad,
                        precio_unitario,
                        subtotal,
                        notas: item.notas || null,
                        create_at: new Date(),
                        update_at: new Date(),
                        is_active: true
                    },
                    { transaction: t }
                );

                // Crear líneas de extras (si vienen)
                if (Array.isArray(item.extras)) {
                    for (const exItem of item.extras) {
                        const extraCat = extrasMap[exItem.extra_id];
                        if (!extraCat) {
                            throw new Error(`Extra ${exItem.extra_id} no encontrado en esta pizzería`);
                        }

                        const cantidadExtra = Number(exItem.cantidad || 1);
                        if (isNaN(cantidadExtra) || cantidadExtra <= 0) {
                            throw new Error('Cantidad inválida en uno de los extras');
                        }

                        const precioExtra = parseFloat(extraCat.precio);
                        const subtotalExtra = cantidadExtra * precioExtra;
                        total += subtotalExtra;

                        await PedidoDetalle.create(
                            {
                                pedido_id: pedido.id,
                                producto_id: null,
                                extra_id: extraCat.id,
                                parent_detalle_id: detalleBase.id,
                                cantidad: cantidadExtra,
                                precio_unitario: precioExtra,
                                subtotal: subtotalExtra,
                                notas: null,
                                create_at: new Date(),
                                update_at: new Date(),
                                is_active: true
                            },
                            { transaction: t }
                        );
                    }
                }
            }

            // 5) Actualizar total del pedido
            await pedido.update(
                {
                    total,
                    update_at: new Date()
                },
                { transaction: t }
            );

            await t.commit();

            // 6) Traer el pedido completo con productos + extras
            const pedidoCompleto = await Pedido.findOne({
                where: { id: pedido.id },
                include: [
                    {
                        model: PedidoDetalle,
                        include: [Producto, Extra]
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
                soloHoy,
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

            if (soloHoy) {
                const inicioHoy = new Date();
                inicioHoy.setHours(0, 0, 0, 0);

                const finHoy = new Date();
                finHoy.setHours(23, 59, 59, 999);

                where.create_at = {
                    [Op.gte]: inicioHoy,
                    [Op.lte]: finHoy
                };
            } else if (desde || hasta) {
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
                            include: [Producto, Extra]
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
                            include: [Producto, Extra]
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
            id,
            items,
            pizzeria_id: bodyPizzeriaId
        } = req.body;

        const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

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

            await PedidoDetalle.destroy({
                where: { pedido_id: id },
                transaction: t
            });

            const productIds = [];
            const extraIdsSet = new Set();

            for (const item of items) {
                if (item.producto_id) {
                    productIds.push(item.producto_id);
                }
                if (Array.isArray(item.extras)) {
                    for (const ex of item.extras) {
                        if (ex.extra_id) {
                            extraIdsSet.add(ex.extra_id);
                        }
                    }
                }
            }

            const uniqueProductIds = [...new Set(productIds)];
            const extraIds = [...extraIdsSet];

            const [productos, extrasCat] = await Promise.all([
                Producto.findAll({
                    where: { id: uniqueProductIds, pizzeria_id },
                    transaction: t
                }),
                extraIds.length
                    ? Extra.findAll({
                        where: { id: extraIds, pizzeria_id, is_active: true },
                        transaction: t
                    })
                    : Promise.resolve([])
            ]);

            const productosMap = {};
            productos.forEach(p => {
                productosMap[p.id] = p;
            });

            const extrasMap = {};
            extrasCat.forEach(e => {
                extrasMap[e.id] = e;
            });

            let total = 0;

            // 3) Crear de nuevo detalles (productos + extras)
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

                // Línea base
                const detalleBase = await PedidoDetalle.create(
                    {
                        pedido_id: id,
                        producto_id: prod.id,
                        extra_id: null,
                        parent_detalle_id: null,
                        cantidad,
                        precio_unitario,
                        subtotal,
                        notas: item.notas || null,
                        create_at: new Date(),
                        update_at: new Date(),
                        is_active: true
                    },
                    { transaction: t }
                );

                // Extras
                if (Array.isArray(item.extras)) {
                    for (const exItem of item.extras) {
                        const extraCat = extrasMap[exItem.extra_id];
                        if (!extraCat) {
                            throw new Error(`Extra ${exItem.extra_id} no encontrado en esta pizzería`);
                        }

                        const cantidadExtra = Number(exItem.cantidad || 1);
                        if (isNaN(cantidadExtra) || cantidadExtra <= 0) {
                            throw new Error('Cantidad inválida en uno de los extras');
                        }

                        const precioExtra = parseFloat(extraCat.precio);
                        const subtotalExtra = cantidadExtra * precioExtra;
                        total += subtotalExtra;

                        await PedidoDetalle.create(
                            {
                                pedido_id: id,
                                producto_id: null,
                                extra_id: extraCat.id,
                                parent_detalle_id: detalleBase.id,
                                cantidad: cantidadExtra,
                                precio_unitario: precioExtra,
                                subtotal: subtotalExtra,
                                notas: null,
                                create_at: new Date(),
                                update_at: new Date(),
                                is_active: true
                            },
                            { transaction: t }
                        );
                    }
                }
            }

            // 4) Actualizar total del pedido
            await pedido.update(
                {
                    total,
                    update_at: new Date()
                },
                { transaction: t }
            );

            await t.commit();

            // 5) Volver a traer el pedido completo con detalles y usuario
            const pedidoCompleto = await Pedido.findOne({
                where: { id: pedido.id },
                include: [
                    {
                        model: PedidoDetalle,
                        include: [Producto, Extra]
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


// Resumen para Dashboard (KPIs + gráfica + producto más vendido)
exports.dashboardResumen = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const user = req.user || {};
            const {
                desde,
                hasta,
                pizzeria_id: bodyPizzeriaId
            } = req.body;

            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

            if (!pizzeria_id) {
                return res.status(400).json({ message: 'No se encontró pizzeria_id.' });
            }

            // 1) KPIs de HOY
            const inicioHoy = new Date();
            inicioHoy.setHours(0, 0, 0, 0);

            const finHoy = new Date();
            finHoy.setHours(23, 59, 59, 999);

            const pedidosHoy = await Pedido.findAll({
                where: {
                    pizzeria_id,
                    is_active: true,
                    create_at: { [Op.between]: [inicioHoy, finHoy] },
                    status: { [Op.in]: ['ENTREGADO'] }
                },
                attributes: [
                    'status',
                    [sequelize.fn('SUM', sequelize.col('total')), 'total'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
                ],
                group: ['status']
            });

            let totalVendidasHoy = 0;
            let totalCanceladasHoy = 0;
            let pedidosVendidosHoy = 0;
            let pedidosCanceladosHoy = 0;

            pedidosHoy.forEach(row => {
                const status = row.status;
                const total = parseFloat(row.get('total') || 0);
                const cantidad = parseInt(row.get('cantidad') || 0, 10);

                if (status === 'CANCELADO') {
                    totalCanceladasHoy += total;
                    pedidosCanceladosHoy += cantidad;
                } else {
                    totalVendidasHoy += total;
                    pedidosVendidosHoy += cantidad;
                }
            });

            const totalDia = totalVendidasHoy - totalCanceladasHoy;

            // 2) Rango para la gráfica (por defecto últimos 7 días)
            let inicioRango;
            let finRango;

            if (desde) {
                inicioRango = new Date(desde);
            }
            if (hasta) {
                finRango = new Date(hasta);
            }

            if (!inicioRango || !finRango) {
                const hoy = new Date();
                hoy.setHours(23, 59, 59, 999);
                finRango = finRango || hoy;

                inicioRango = inicioRango || new Date(finRango);
                inicioRango.setDate(inicioRango.getDate() - 6);
            }

            inicioRango.setHours(0, 0, 0, 0);
            finRango.setHours(23, 59, 59, 999);

            const ventasPorFechaRaw = await Pedido.findAll({
                where: {
                    pizzeria_id,
                    is_active: true,
                    create_at: { [Op.between]: [inicioRango, finRango] }
                },
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('create_at')), 'fecha'],
                    [sequelize.fn('SUM', sequelize.col('total')), 'total'],
                    [
                        sequelize.fn(
                            'SUM',
                            sequelize.literal("CASE WHEN status = 'CANCELADO' THEN total ELSE 0 END")
                        ),
                        'canceladas'
                    ]
                ],
                group: [sequelize.fn('DATE', sequelize.col('create_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('create_at')), 'ASC']]
            });

            const ventasPorFecha = ventasPorFechaRaw.map(row => {
                const rawFecha = row.get('fecha');
                let fechaStr;

                if (rawFecha instanceof Date) {
                    fechaStr = rawFecha.toISOString().slice(0, 10);
                } else {
                    fechaStr = String(rawFecha);
                }

                return {
                    fecha: fechaStr,
                    total: parseFloat(row.get('total') || 0),
                    canceladas: parseFloat(row.get('canceladas') || 0)
                };
            });

            const resultados = await sequelize.query(
                `
                  SELECT 
                    pd.producto_id,
                    SUM(pd.cantidad) as "totalCantidad",
                    SUM(pd.subtotal) as "totalImporte",
                    p.nombre,
                    p.descripcion,
                    p.categoria
                  FROM pedido_detalles pd
                  INNER JOIN pedidos pe ON pd.pedido_id = pe.id
                  INNER JOIN productos p ON pd.producto_id = p.id
                  WHERE pe.pizzeria_id = :pizzeria_id
                    AND pe.is_active = true
                    AND pe.status != 'CANCELADO'
                    AND pe.create_at BETWEEN :inicioRango AND :finRango
                  GROUP BY pd.producto_id, p.id, p.nombre, p.descripcion, p.categoria
                  ORDER BY SUM(pd.cantidad) DESC
                  LIMIT 1
                  `,
                {
                    replacements: {
                        pizzeria_id,
                        inicioRango,
                        finRango,
                    },
                    type: Op.SELECT, // 👈 importante
                }
            );

            let productoMasVendido = null;

            if (resultados && resultados.length > 0) {
                const row = resultados[0];

                productoMasVendido = {
                    producto_id: row[0].producto_id,
                    nombre: row[0].nombre,
                    descripcion: row[0].descripcion || "",
                    categoria: row[0].categoria,
                    totalCantidad: parseFloat(row[0].totalCantidad || 0),
                    totalImporte: parseFloat(row[0].totalImporte || 0),
                };
            }

            return res.status(200).json({
                message: 'Resumen de dashboard',
                data: {
                    kpis: {
                        totalVendidasHoy,
                        totalCanceladasHoy,
                        totalDia,
                        pedidosVendidosHoy,
                        pedidosCanceladosHoy
                    },
                    rango: {
                        desde: inicioRango.toISOString().slice(0, 10),
                        hasta: finRango.toISOString().slice(0, 10)
                    },
                    ventasPorFecha,
                    productoMasVendido
                }
            });
        } catch (error) {
            console.error('Error al obtener resumen de dashboard:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });
};

