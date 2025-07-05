const { Ingreso } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

exports.create = async (req, res) => {
    authenticateToken(req, res, async () => {
        const { descripcion, monto, categoria, periodo, fecha } = req.body;
        const user_id = req.user.id;

        if (!descripcion || !monto || !categoria || !periodo) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        try {
            const ingreso = await Ingreso.create({
                user_id,
                descripcion,
                monto,
                categoria,
                periodo,
                fecha: fecha || new Date(),
                create_at: new Date(),
                update_at: new Date()
            });

            res.status(201).json({ message: 'Ingreso creado', data: ingreso });
        } catch (error) {
            console.error('Error al crear ingreso:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    });
};

exports.getAll = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const ingresos = await Ingreso.findAll({
                where: {
                    user_id: req.user.id,
                    is_active: true
                }
            });
            res.status(200).json({ data: ingresos });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener ingresos' });
        }
    });
};

exports.update = async (req, res) => {
    authenticateToken(req, res, async () => {
        const { id, descripcion, monto, categoria, periodo, fecha } = req.body;

        try {
            const ingreso = await Ingreso.findOne({ where: { id, user_id: req.user.id } });
            if (!ingreso) return res.status(404).json({ message: 'Ingreso no encontrado' });

            await ingreso.update({
                descripcion,
                monto,
                categoria,
                periodo,
                fecha,
                update_at: new Date()
            });

            res.status(200).json({ message: 'Ingreso actualizado', data: ingreso });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar ingreso' });
        }
    });
};

exports.delete = async (req, res) => {
    authenticateToken(req, res, async () => {
        const { id } = req.body;

        try {
            const ingreso = await Ingreso.findOne({ where: { id, user_id: req.user.id } });
            if (!ingreso) return res.status(404).json({ message: 'Ingreso no encontrado' });

            await ingreso.update({ is_active: false, update_at: new Date() });
            res.status(200).json({ message: 'Ingreso eliminado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar ingreso' });
        }
    });
};
