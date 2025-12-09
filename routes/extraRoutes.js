// routes/extraRoutes.js
const express = require('express');
const router = express.Router();
const extraController = require('../controllers/extraController');

// Crear extra
router.post('/crear', extraController.crearExtra);

// Consultar lista de extras (por pizzería, etc.)
router.post('/consult', extraController.consultarExtras);

// Obtener un extra por ID
router.get('/:id', extraController.obtenerExtraPorId);

// Actualizar extra
router.put('/actualizar', extraController.actualizarExtra);

// Eliminar (inactivar) extra
router.post('/eliminar', extraController.eliminarExtra);

module.exports = router;
