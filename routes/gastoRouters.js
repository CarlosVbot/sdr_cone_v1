const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');

router.post('/create', gastoController.create);
router.post('/consult', gastoController.getAll);
router.put('/update', gastoController.update);
router.delete('/delete', gastoController.delete);

module.exports = router;
