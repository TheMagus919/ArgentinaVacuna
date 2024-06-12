const express = require("express");
const router = express.Router();
const controllers = require("../controllers/distribucionController");

router.get("/", controllers.menu);

//DEPOSITO NACIONAL
router.get("/distribucionDepoNac", controllers.listarDistribucionDepoNac);
router.get("/distribucionDepoNac/lotes", controllers.listarLotesDepoNac);
router.get("/distribucionDepoNac/crear/:id", controllers.crearDistribucionDepoNac);
router.post("/distribucionDepoNac/crear/alta", controllers.altaDistribucionDepoNac);
router.get("/distribucionDepoNac/consultar/:id", controllers.consultarDistribucionDepoNac);
router.get("/distribucionDepoNac/editar/:id", controllers.editDistribucionDepoNac);
router.put("/distribucionDepoNac/editar/:id", controllers.putDistribucionDepoNac);
router.delete("/distribucionDepoNac/eliminar/:id", controllers.eliminarDistribucionDepoNac);

//DEPOSITO PROVINCIAL
router.get("/distribucionDepoPro", controllers.listarDistribucionDepoPro);
router.get("/distribucionDepoPro/depositos", controllers.listarDepositosNacDepoPro);
router.get("/distribucionDepoPro/depositos/lote/:id", controllers.listarLotesDepoPro);
router.get("/distribucionDepoPro/crear/:id:lote", controllers.crearDistribucionDepoPro);
router.post("/distribucionDepoPro/crear/alta", controllers.altaDistribucionDepoPro);
router.get("/distribucionDepoPro/consultar/:id", controllers.consultarDistribucionDepoPro);
router.get("/distribucionDepoPro/editar/:id", controllers.editDistribucionDepoPro);
router.put("/distribucionDepoPro/editar/:id", controllers.putDistribucionDepoPro);
router.delete("/distribucionDepoPro/eliminar/:id", controllers.eliminarDistribucionDepoPro);


//CENTRO DE VACUNACION
router.get("/distribucionCentroVac/depositos", controllers.listarDepProCentro);
router.get("/distribucionCentroVac/depositos/lote/:id", controllers.listarLotesCentro);
router.get("/distribucionCentroVac", controllers.listarDistribucionCentroVac);
router.get("/distribucionCentroVac/crear/:id:lote", controllers.crearDistribucionCentroVac);
router.post("/distribucionCentroVac/crear/alta", controllers.altaDistribucionCentroVac);
router.get("/distribucionCentroVac/consultar/:id", controllers.consultarDistribucionCentroVac);
router.get("/distribucionCentroVac/editar/:id", controllers.editDistribucionCentroVac);
router.put("/distribucionCentroVac/editar/:id", controllers.putDistribucionCentroVac);
router.delete("/distribucionCentroVac/eliminar/:id", controllers.eliminarDistribucionCentroVac);

router.get("/distribucionCentroVac/stock", controllers.listaStock);
module.exports = router;