const express = require("express");
const router = express.Router();
const controllers = require("../controllers/agenteDeSaludController");

router.get("/", controllers.listar);
router.get("/crear", controllers.crear);
router.post("/alta", controllers.alta);
router.get("/editar/:id", controllers.editAgente);
router.put("/editar/:id", controllers.putAgente);
router.delete("/eliminar/:id", controllers.eliminar);

module.exports = router;