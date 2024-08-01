const express = require("express");
const router = express.Router();
const controllers = require("../controllers/descarteController");
const Usuario = require('../controllers/agenteDeSaludController');

// Ruta para crear un nuevo descarte
router.get("/nacion/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.crearNacion);
router.post("/nacion/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.altaNacion);

router.get("/provincia/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.crearProvincia);
router.post("/provincia/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.altaProvincia);
router.get("/provincia/lotes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.llenarLoteProv);

router.get("/centroDeVacunacion/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.crearCentro);
router.post("/centroDeVacunacion/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.altaCentro);
router.get("/centroDeVacunacion/lotes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.llenarLoteCentro);

module.exports = router;