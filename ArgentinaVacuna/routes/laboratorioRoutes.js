const express = require("express");
const router = express.Router();
const controllers = require("../controllers/laboratorioController");
const Usuario = require('../controllers/agenteDeSaludController');

router.get("/", Usuario.authMiddleware, Usuario.roleMiddleware(['Laboratorio', 'Administrador']), controllers.listar);
router.get("/stock/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.stock);
router.get("/agregar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.formAgregar);
router.post("/agregar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.agregar);

//ADMINISTRADOR
router.get("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.crear);
router.post("/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.alta);
router.get("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editLaboratorio);
router.put("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putLaboratorio);
router.delete("/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminar);

module.exports = router;