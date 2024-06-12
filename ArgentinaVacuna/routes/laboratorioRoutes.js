const express = require("express");
const router = express.Router();
const controllers = require("../controllers/laboratorioController");

router.get("/", controllers.listar);
router.get("/crear", controllers.crear);
router.post("/alta", controllers.alta);
router.get("/editar/:id", controllers.editLaboratorio);
router.put("/editar/:id", controllers.putLaboratorio);
router.delete("/eliminar/:id", controllers.eliminar);

router.post("/vacunasCompradas", controllers.listarVacunasXLaboratorio);
module.exports = router;