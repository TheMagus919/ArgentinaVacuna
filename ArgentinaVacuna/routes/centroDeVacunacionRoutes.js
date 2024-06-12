const express = require("express");
const router = express.Router();
const controllers = require("../controllers/centroDeVacunacionController");

router.get("/", controllers.listar);
router.get("/crear", controllers.crear);
router.post("/alta", controllers.alta);
router.get("/editar/:id", controllers.editCentro);
router.put("/editar/:id", controllers.putCentro);
router.delete("/eliminar/:id", controllers.eliminar);

module.exports = router;