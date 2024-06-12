const express = require("express");
const router = express.Router();
const controllers = require("../controllers/aplicacionController");

router.get("/", controllers.listar);
router.get("/crear", controllers.listarCentros);
router.post("/crear", controllers.obtener);
router.post("/alta", controllers.alta);
router.get("/editar/:id", controllers.editAplicacion);
router.put("/editar/:id", controllers.putAplicacion);
router.delete("/eliminar/:id", controllers.eliminar);

router.get("/listaPacientes", controllers.mostrarVistaListarPacientesXTipoVacuna);
router.post("/listaPacientes/listar", controllers.listaPacientesXTipoVacuna);
router.get("/listaVencidasAplicadas", controllers.mostrarVistaListarPacientesXVacunaVencidas);
router.post("/listaVencidasAplicadas/listar", controllers.listaPacientesXVacunaVencida);

/*
router.post("/opcion", controllers.opcion2);
router.post("/opciones", controllers.opcion1);

*/
module.exports = router;