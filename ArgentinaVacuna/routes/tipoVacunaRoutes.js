const express = require("express");
const router = express.Router();
const controllers = require("../controllers/tipoVacunaController");

router.get("/", controllers.listar);
router.get("/crear", controllers.crear);
router.post("/alta", controllers.alta);
router.get("/editar/:id", controllers.editTipo);
router.put("/editar/:id", controllers.putTipo);
router.delete("/eliminar/:id", controllers.eliminar);

module.exports = router;