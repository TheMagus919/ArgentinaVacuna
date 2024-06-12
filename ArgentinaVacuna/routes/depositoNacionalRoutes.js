const express = require("express");
const router = express.Router();
const controllers = require("../controllers/depositoNacionalController");

router.get("/", controllers.listar);
router.get("/crear", controllers.crear);
router.post("/alta", controllers.alta);
router.get("/editar/:id", controllers.editDepo);
router.put("/editar/:id", controllers.putDepo);
router.delete("/eliminar/:id", controllers.eliminar);

module.exports = router;