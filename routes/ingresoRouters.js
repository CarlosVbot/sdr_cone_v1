const express = require('express');
const router = express.Router();
const ingresoController = require('../controllers/ingresoController');

router.post('/create', ingresoController.create);
router.post('/consult', ingresoController.getAll);
router.put('/update', ingresoController.update);
router.delete('/delete', ingresoController.delete);

module.exports = router;
