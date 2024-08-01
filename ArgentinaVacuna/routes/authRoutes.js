const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const Usuario = require('../controllers/agenteDeSaludController');

router.get('/registrarse', controller.registrar);
router.post('/registrarse', controller.alta);
router.get('/login', controller.loguearse);
router.post('/login', controller.login);
router.get('/logout', Usuario.authMiddleware, controller.logout);

router.get('/cambiarPassword', Usuario.authMiddleware, controller.cambiarContraseña);
router.post('/cambiarPassword', Usuario.authMiddleware, controller.altaContraseña);

router.get('/trabaja', controller.trabajo);
module.exports = router;