const express = require("express");
const router = express.Router();
const controllers = require("../controllers/depositoNacionalController");
const Usuario = require('../controllers/agenteDeSaludController');

router.get("/", Usuario.authMiddleware, Usuario.roleMiddleware(['Deposito Nacional', 'Administrador']), controllers.listar);
router.get("/stock/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.stock);
router.post("/vacunasCompradas", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.listarVacunasXLaboratorio);
router.post("/vacunasCompradas/consultar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.consultarVacunas);

//ADMINISTRADOR
router.get("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editDepo);
router.put("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putDepo);

module.exports = router;