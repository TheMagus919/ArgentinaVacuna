const express = require("express");
const router = express.Router();
const controllers = require("../controllers/centroDeVacunacionController");
const Usuario = require('../controllers/agenteDeSaludController');

router.get("/", Usuario.authMiddleware, Usuario.roleMiddleware(['Deposito Centro Vacunacion', 'Administrador']), controllers.listar);
router.get("/stock/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.stock)

//ADMIMISTRADOR
router.get("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.crear);
router.post("/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.alta);
router.get("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editCentro);
router.put("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putCentro);
router.delete("/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminar);

module.exports = router;