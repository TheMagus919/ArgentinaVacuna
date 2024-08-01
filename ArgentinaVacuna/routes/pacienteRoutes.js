const express = require("express");
const router = express.Router();
const controllers = require("../controllers/pacienteController");
const Usuario = require('../controllers/agenteDeSaludController');

router.get("/", Usuario.authMiddleware, Usuario.roleMiddleware(['Medico', 'Administrador']), controllers.listar);
router.get("/registro/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.registro);
router.get("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.crear);
router.post("/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.alta);
router.get("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.editPaciente);
router.put("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.putPaciente);

//ADMIMISTRADOR
router.delete("/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminar);

module.exports = router;