const express = require("express");
const router = express.Router();
const controllers = require("../controllers/aplicacionController");
const Usuario = require('../controllers/agenteDeSaludController');

router.get("/", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.listar);
router.get("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.listarCentros);
router.post("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.obtener);
router.post("/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.alta);
router.delete("/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.eliminar);
router.get("/consultar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.consultar);

router.get("/crear/paciente", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.crearPaciente);
router.post("/crear/paciente", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.altaPaciente);

router.get("/listaPacientes", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.listaPacientesXTipoVacuna);
//router.get("/listaVencidasAplicadas", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.listaPacientesXVacunaVencida);
router.get("/stockDisponible", Usuario.authMiddleware, Usuario.roleMiddleware('Medico'), controllers.stockDisponible);

module.exports = router;