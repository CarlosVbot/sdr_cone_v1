const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
router.post('/create', productoController.create);
router.post('/consult', productoController.consult);
router.post('/update', productoController.update);
router.post('/delete', productoController.delete);

module.exports = router;
