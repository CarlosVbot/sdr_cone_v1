const { Producto } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

exports.create = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const {
                nombre,
                descripcion,
                categoria,
                precio,
                unidad,
                orden,
                pizzeria_id: bodyPizzeriaId
            } = req.body;

            const user = req.user || {};
            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

            if (!pizzeria_id) {
                return res.status(400).json({ message: 'No se encontró pizzeria_id.' });
            }
            if (!nombre || precio === undefined || precio === null) {
                return res.status(400).json({ message: 'nombre y precio son obligatorios.' });
            }

            const precioNumber = parseFloat(precio);
            if (isNaN(precioNumber)) {
                return res.status(400).json({ message: 'precio no es un número válido.' });
            }

            const producto = await Producto.create({
                pizzeria_id,
                nombre,
                descripcion: descripcion || null,
                categoria: categoria || null,
                precio: precioNumber,
                unidad: unidad || 'pieza',
                orden: orden || null,
                create_at: new Date(),
                update_at: new Date(),
                is_active: true
            });

            res.status(201).json({
                message: 'Producto creado con éxito',
                data: producto
            });
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });
};

exports.consult = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const user = req.user || {};
            const {
                id,
                categoria,
                incluirInactivos = false,
                pizzeria_id: bodyPizzeriaId
            } = req.body;

            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

            if (!pizzeria_id) {
                return res.status(400).json({ message: 'No se encontró pizzeria_id.' });
            }

            const where = { pizzeria_id };

            if (!incluirInactivos) {
                where.is_active = true;
            }
            if (categoria) {
                where.categoria = categoria;
            }

            if (id) {
                const producto = await Producto.findOne({ where: { ...where, id } });

                if (!producto) {
                    return res.status(404).json({ message: 'Producto no encontrado.' });
                }

                return res.status(200).json({
                    message: 'Producto encontrado',
                    data: producto
                });
            } else {
                const productos = await Producto.findAll({
                    where,
                    order: [
                        ['orden', 'ASC'],
                        ['nombre', 'ASC']
                    ]
                });

                return res.status(200).json({
                    message: 'Productos encontrados',
                    data: productos
                });
            }
        } catch (error) {
            console.error('Error al consultar productos:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });
};

exports.update = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const {
                id,
                nombre,
                descripcion,
                categoria,
                precio,
                unidad,
                orden,
                is_active,
                pizzeria_id: bodyPizzeriaId
            } = req.body;

            if (!id) {
                return res.status(400).json({ message: 'id es obligatorio.' });
            }

            const user = req.user || {};
            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;

            const where = { id };
            if (pizzeria_id) {
                where.pizzeria_id = pizzeria_id;
            }

            const producto = await Producto.findOne({ where });

            if (!producto) {
                return res.status(404).json({ message: 'Producto no encontrado.' });
            }

            let precioNumber = producto.precio;
            if (precio !== undefined && precio !== null) {
                precioNumber = parseFloat(precio);
                if (isNaN(precioNumber)) {
                    return res.status(400).json({ message: 'precio no es un número válido.' });
                }
            }

            await producto.update({
                nombre: nombre ?? producto.nombre,
                descripcion: descripcion ?? producto.descripcion,
                categoria: categoria ?? producto.categoria,
                precio: precioNumber,
                unidad: unidad ?? producto.unidad,
                orden: orden ?? producto.orden,
                update_at: new Date(),
                ...(typeof is_active === 'boolean' ? { is_active } : {})
            });

            res.status(200).json({
                message: 'Producto actualizado con éxito',
                data: producto
            });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });
};

exports.delete = async (req, res) => {
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

            const producto = await Producto.findOne({ where });

            if (!producto) {
                return res.status(404).json({ message: 'Producto no encontrado.' });
            }

            await producto.update({
                is_active: false,
                update_at: new Date()
            });

            res.status(200).json({ message: 'Producto eliminado (desactivado).' });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });
};
