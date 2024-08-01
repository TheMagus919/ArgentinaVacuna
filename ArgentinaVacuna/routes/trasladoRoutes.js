const express = require("express");
const router = express.Router();
const controllers = require("../controllers/trasladoController");
const Usuario = require('../controllers/agenteDeSaludController');

//Listas
router.get("/", Usuario.authMiddleware, Usuario.roleMiddleware(['Deposito Centro Vacunacion', 'Administrador']), controllers.listarTraslados);
router.get("/trasladosEnProceso", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.listarTrasladosEnProceso);
router.get("/registroDescartes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.registroDescartes);

//AC
router.get("/crear", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.listarCentros)
router.get("/crear/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.listarLotes);
router.get("/crear/solicitud/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.crear);
router.post("/crear/solicitud/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.alta);
router.get("/consultar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.consultarTraslados)

//SOLICITUDES
router.get("/listaSolicitudes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.listarSolicitudes);
router.get("/solicitudesPendientes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.listarSolicitudesPendientes);

router.get("/enviar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.formEnviar);
router.put("/enviar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.enviar);

router.get("/ingreso/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.formRecibir);
router.put("/ingreso/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.recibir);

//SOLO ADMINISTRADOR
router.get("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editTraslado);
router.put("/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putTraslado);
router.delete("/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminar);

module.exports = router;