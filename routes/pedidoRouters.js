const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/create', pedidoController.create);
router.post('/consult', pedidoController.consult);
router.post('/updateStatus', pedidoController.updateStatus);
router.post('/updateItems', pedidoController.updateItems);
router.post('/dashboard', pedidoController.dashboardResumen);
router.post('/cancel', pedidoController.cancel);

module.exports = router;
