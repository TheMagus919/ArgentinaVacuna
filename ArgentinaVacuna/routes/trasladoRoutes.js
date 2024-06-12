const express = require("express");
const router = express.Router();
const controllers = require("../controllers/trasladoController");

router.get("/", controllers.listarTraslados);
router.get("/crear", controllers.listarCentros)
router.get("/trasladosPorCentros/:id", controllers.listarTrasladosPorCentros)
router.get("/consultar/:id", controllers.consultarTraslados)
router.get("/crear/:id:lote", controllers.crear);
router.get("/crear/:id", controllers.listarLotes);
router.post("/crear/alta", controllers.alta);
router.get("/editar/:id", controllers.editTraslado);
router.put("/editar/:id", controllers.putTraslado);
router.delete("/eliminar/:id", controllers.eliminar);

module.exports = router;