const express = require("express");
const router = express.Router();
const controllers = require("../controllers/distribucionController");
const Usuario = require('../controllers/agenteDeSaludController');

//DEPOSITO NACIONAL
//LISTAS
router.get("/distribucionDepoNac", Usuario.authMiddleware, Usuario.roleMiddleware(['Deposito Nacional', 'Administrador']), controllers.listarDistribucionDepoNac);
router.get("/distribucionDepoNac/comprasEnProceso", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.comprasEnProceso);
router.get("/distribucionDepoNac/enviosEnProceso", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.enviosEnProceso);
router.get("/distribucionDepoNac/solicitudes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.listaSolicitudesDepNac);
router.get("/distribucionDepoNac/registroEnvios", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.registroEnviosDepNac);
router.get("/distribucionDepoNac/registroDescartes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.registroDescartesDepNac);

//AC COMPRA
router.get("/distribucionDepoNac/lotes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.listarLotesDepoNac);
router.get("/distribucionDepoNac/crear/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.crearDistribucionDepoNac);
router.post("/distribucionDepoNac/crear/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.altaDistribucionDepoNac);
router.get("/distribucionDepoNac/consultar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.consultarDistribucionDepoNac);

//ingreso
router.get("/distribucionDepoNac/ingreso/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.obtenerIngresoDepoNac);
router.put("/distribucionDepoNac/ingreso/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.registrarIngresoDepoNac);

//solicitudes
router.get("/distribucionDepoNac/enviarVacunas/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.obtenerInformacionEnvio);
router.put("/distribucionDepoNac/enviarVacunas/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.enviarVacunaDepNac);

//AC ENVIO
router.get("/distribucionDepoNac/enviar", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.enviarLotes);
router.get("/distribucionDepoNac/enviar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.enviarLote);
router.post("/distribucionDepoNac/enviar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.enviar);
router.get("/distribucionDepoNac/consultarEnvio/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Nacional'), controllers.consultarEnvioDepNac);

//DEPOSITO PROVINCIAL
//LISTAS
router.get("/distribucionDepoPro", Usuario.authMiddleware, Usuario.roleMiddleware(['Deposito Provincial', 'Administrador']), controllers.listarDistribucionDepoPro);
router.get("/distribucionDepoPro/listaCompras", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.comprasEnProcesoProv);
router.get("/distribucionDepoPro/distribucionesEnProceso", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.enviosEnProcesoProv);
router.get("/distribucionDepoPro/registroEnvios", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.registroEnviosDepProv);
router.get("/distribucionDepoPro/registroDescartes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.registroDescartesDepProv);
//mis solicitudes
router.get("/distribucionDepoPro/listaSolicitudes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.listaSolicitudesDepProv);

//solicitudes recibidas
router.get("/distribucionDepoPro/solicitudes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.solicitudesDepoPro);
router.get("/distribucionDepoPro/enviarVacunasSolicitadas/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.formSolicitudEnviarDepoPro);
router.put("/distribucionDepoPro/enviarVacunasSolicitadas/:id",  Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.enviarSolicitudRequeridaDepoPro);

//AC INGRESOS
router.get("/distribucionDepoPro/lotes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.listarLotesDepoPro);
router.get("/distribucionDepoPro/deposito/lote/:id/:lote", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.crearDistribucionDepoPro);
router.post("/distribucionDepoPro/crear/alta/:id",  Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.altaDistribucionDepoPro);
router.get("/distribucionDepoPro/consultar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.consultarDistribucionDepoPro);
router.get("/distribucionDepoPro/ingreso/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.obtenerIngresoDepoPro);
router.put("/distribucionDepoPro/ingreso/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.registrarIngresoDepoPro);

//AC ENVIOS
router.get("/distribucionDepoPro/consultarEnvio/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.consultarEnvio);
router.get("/distribucionDepoPro/enviar", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.enviarDepLoteProv);
router.get("/distribucionDepoPro/enviar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.enviarLotesProv);
router.get("/distribucionDepoPro/enviar/:id/:lote", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.enviarLoteProv);
router.post("/distribucionDepoPro/enviar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Provincial'), controllers.enviarProv);

//CENTRO DE VACUNACION
//LISTAS
router.get("/distribucionCentroVac", Usuario.authMiddleware, Usuario.roleMiddleware(['Deposito Centro Vacunacion', 'Administrador']), controllers.listarDistribucionCentroVac);
router.get("/distribucionCentroVac/solicitudes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.solicitudesCentro);
router.get("/distribucionCentroVac/registrarIngreso", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.obtenerListaIngresosCentro);
router.get("/distribucionCentroVac/registroDescartes", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.registroDescartesCentro);
router.get("/distribucionCentroVac/registroEnvios", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.registroEnviosCentro);
router.get("/distribucionCentroVac/consultarEnvio/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.consultarEnvioCentro);

//AC SOLICITAR VACUNA
router.get("/distribucionCentroVac/depositos", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.listarDepProCentro);
router.get("/distribucionCentroVac/depositos/lote/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.listarLotesCentro);
router.get("/distribucionCentroVac/crear/:id/:lote", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.crearDistribucionCentroVac);
//comprobar alta
router.post("/distribucionCentroVac/crear/alta", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.altaDistribucionCentroVac);
router.get("/distribucionCentroVac/consultar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.consultarDistribucionCentroVac);

//INGRESOS
router.get("/distribucionCentroVac/registrarIngreso/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.obtenerIngresoCentro);
router.put("/distribucionCentroVac/registrarIngreso/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Deposito Centro Vacunacion'), controllers.registrarIngresoCentro);

//ADMINISTRADOR
router.delete("/distribucionDepoNac/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminarDistribucionDepoNac);

router.get("/distribucionDepoPro/editarEnvio/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editarEnvio);
router.put("/distribucionDepoPro/editarEnvio/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putEnvio);

router.get("/distribucionDepoPro/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editDistribucionDepoPro);
router.put("/distribucionDepoPro/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putDistribucionDepoPro);
router.delete("/distribucionDepoPro/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminarDistribucionDepoPro);

router.get("/distribucionCentroVac/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.editDistribucionCentroVac);
router.put("/distribucionCentroVac/editar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.putDistribucionCentroVac);
router.delete("/distribucionCentroVac/eliminar/:id", Usuario.authMiddleware, Usuario.roleMiddleware('Administrador'), controllers.eliminarDistribucionCentroVac);

module.exports = router;