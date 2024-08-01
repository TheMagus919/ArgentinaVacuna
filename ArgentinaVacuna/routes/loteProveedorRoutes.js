const express = require("express");
const router = express.Router();
const controllers = require("../controllers/loteProveedorController");
const Usuario = require('../controllers/agenteDeSaludController');

router.get("/", Usuario.authMiddleware, Usuario.roleMiddleware(['Laboratorio', 'Administrador']), controllers.listar);
router.get("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.crear);
router.post("/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.alta);
router.get("/consultar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.consultar);

router.get("/listar", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.listadoLotesXTipo);
router.post("/listar/consultar", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.consulta);
router.get("/listarVacunasVencidas", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.listarVacunasVencidas);
router.get("/lotesSinEnviar", Usuario.authMiddleware, Usuario.roleMiddleware('Laboratorio'), controllers.lotesSinEnviar);

//ADMINISTRADOR
router.get("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editLote);
router.put("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putLote);
router.delete("/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminar);

module.exports = router;