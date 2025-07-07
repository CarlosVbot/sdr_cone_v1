const { Gasto, Ingreso} = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

exports.create = async (req, res) => {
    authenticateToken(req, res, async () => {
        const { descripcion, monto, categoria, periodo, fecha } = req.body;
        const user_id = req.user.id;

        if (!descripcion || !monto || !categoria || !periodo) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        try {
            const gasto = await Gasto.create({
                user_id,
                descripcion,
                monto,
                categoria,
                periodo,
                fecha: fecha || new Date(),
                create_at: new Date(),
                update_at: new Date()
            });

            res.status(201).json({ message: 'Gasto creado', data: gasto });
        } catch (error) {
            console.error('Error al crear gasto:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    });
};

exports.getAll = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const gastos = await Gasto.findAll({
                where: {
                    user_id: req.user.id,
                    is_active: true
                }
            });
            res.status(200).json({ data: gastos });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener gastos' });
        }
    });
};

exports.getOne = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const { id } = req.body;
            const ingresos = await Gasto.findOne({
                where: {
                    id: id,
                    is_active: true
                }
            });
            res.status(200).json({ data: ingresos });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener gasto' });
        }
    });
};

exports.update = async (req, res) => {
    authenticateToken(req, res, async () => {
        const { id, descripcion, monto, categoria, periodo, fecha } = req.body;

        try {
            const gasto = await Gasto.findOne({ where: { id, user_id: req.user.id } });
            if (!gasto) return res.status(404).json({ message: 'Gasto no encontrado' });

            await gasto.update({
                descripcion,
                monto,
                categoria,
                periodo,
                fecha,
                update_at: new Date()
            });

            res.status(200).json({ message: 'Gasto actualizado', data: gasto });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar gasto' });
        }
    });
};

exports.delete = async (req, res) => {
    authenticateToken(req, res, async () => {
        const { id } = req.body;

        try {
            const gasto = await Gasto.findOne({ where: { id, user_id: req.user.id } });
            if (!gasto) return res.status(404).json({ message: 'Gasto no encontrado' });

            await gasto.update({ is_active: false, update_at: new Date() });
            res.status(200).json({ message: 'Gasto eliminado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar gasto' });
        }
    });
};
