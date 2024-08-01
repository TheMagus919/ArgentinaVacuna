const express = require("express");
const router = express.Router();
const controllers = require("../controllers/tipoVacunaController");
const Usuario = require('../controllers/agenteDeSaludController');


//ADMINISTRADOR
router.get("/",  Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.listar);
router.get("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.crear);
router.post("/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.alta);
router.get("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editTipo);
router.put("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putTipo);
router.delete("/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminar);

module.exports = router;