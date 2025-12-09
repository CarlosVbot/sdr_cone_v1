// controllers/extraController.js
const Extra = require('../models/extraModel'); // <-- ajusta la ruta si es necesario

// CREATE - Crear extra
exports.crearExtra = async (req, res) => {
    try {
        const { pizzeria_id, nombre, descripcion, precio } = req.body;

        if (!pizzeria_id || !nombre || precio === undefined) {
            return res.status(400).json({
                message: 'pizzeria_id, nombre y precio son obligatorios.'
            });
        }

        const extra = await Extra.create({
            pizzeria_id,
            nombre,
            descripcion: descripcion || null,
            precio
        });

        res.json({
            message: 'Extra creado correctamente',
            data: extra
        });
    } catch (error) {
        console.error('Error al crear extra:', error);
        res.status(500).json({
            message: 'Error al crear extra',
            error: error.message
        });
    }
};

// READ - Listar extras (por pizzería)
exports.consultarExtras = async (req, res) => {
    try {
        const { pizzeria_id, incluirInactivos } = req.body;

        const where = {};
        if (pizzeria_id) {
            where.pizzeria_id = pizzeria_id;
        }
        if (!incluirInactivos) {
            where.is_active = true;
        }

        const extras = await Extra.findAll({
            where,
            order: [['nombre', 'ASC']]
        });

        res.json({
            message: 'Extras encontrados',
            data: extras
        });
    } catch (error) {
        console.error('Error al consultar extras:', error);
        res.status(500).json({
            message: 'Error al consultar extras',
            error: error.message
        });
    }
};

// READ - Obtener un extra por ID
exports.obtenerExtraPorId = async (req, res) => {
    try {
        const { id } = req.params; // o req.body.id si lo manejas por POST

        const extra = await Extra.findByPk(id);

        if (!extra) {
            return res.status(404).json({
                message: 'Extra no encontrado'
            });
        }

        res.json({
            message: 'Extra encontrado',
            data: extra
        });
    } catch (error) {
        console.error('Error al obtener extra:', error);
        res.status(500).json({
            message: 'Error al obtener extra',
            error: error.message
        });
    }
};

// UPDATE - Actualizar extra
exports.actualizarExtra = async (req, res) => {
    try {
        const { id, nombre, descripcion, precio, is_active } = req.body;

        if (!id) {
            return res.status(400).json({
                message: 'El id del extra es obligatorio.'
            });
        }

        const extra = await Extra.findByPk(id);

        if (!extra) {
            return res.status(404).json({
                message: 'Extra no encontrado'
            });
        }

        if (nombre !== undefined) extra.nombre = nombre;
        if (descripcion !== undefined) extra.descripcion = descripcion;
        if (precio !== undefined) extra.precio = precio;
        if (is_active !== undefined) extra.is_active = is_active;

        await extra.save();

        res.json({
            message: 'Extra actualizado correctamente',
            data: extra
        });
    } catch (error) {
        console.error('Error al actualizar extra:', error);
        res.status(500).json({
            message: 'Error al actualizar extra',
            error: error.message
        });
    }
};

// DELETE (soft) - Inactivar extra
exports.eliminarExtra = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                message: 'El id del extra es obligatorio.'
            });
        }

        const extra = await Extra.findByPk(id);

        if (!extra) {
            return res.status(404).json({
                message: 'Extra no encontrado'
            });
        }

        extra.is_active = false;
        await extra.save();

        res.json({
            message: 'Extra eliminado (inactivado) correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar extra:', error);
        res.status(500).json({
            message: 'Error al eliminar extra',
            error: error.message
        });
    }
};
