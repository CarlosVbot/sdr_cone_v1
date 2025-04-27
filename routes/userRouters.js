const express = require('express');
const router = express.Router();
const authController = require('../controllers/userController.js');

router.post('/register', authController.register);
router.get('/consult', authController.consult);
router.post('/login', authController.login);
router.put('/update', authController.update);
router.post('/active', authController.active);
router.delete('/desactive', authController.desactive);
router.post('/verify', authController.verify);


module.exports = router;
