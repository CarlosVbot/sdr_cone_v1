const express = require('express');
const router = express.Router();

const cierreCajaController = require('../controllers/cierreCajaController');

router.post('/calcular', cierreCajaController.calcular);
router.post('/crear', cierreCajaController.crear);
router.post('/consult', cierreCajaController.consult);

module.exports = router;
