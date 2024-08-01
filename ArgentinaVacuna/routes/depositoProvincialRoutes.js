const express = require("express");
const router = express.Router();
const controllers = require("../controllers/depositoProvincialController");
const Usuario = require('../controllers/agenteDeSaludController');

router.get("/", Usuario.authMiddleware, Usuario.roleMiddleware(['Deposito Provincial', 'Administrador']), controllers.listar);
router.get("/stock/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.stock);

//ADMINISTRADOR
router.get("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editDepo);
router.put("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putDepo);
router.get("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.crear);
router.post("/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.alta);
router.delete("/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminar);

module.exports = router;