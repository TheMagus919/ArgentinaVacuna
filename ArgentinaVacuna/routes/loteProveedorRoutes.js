const express = require("express");
const router = express.Router();
const controllers = require("../controllers/loteProveedorController");

router.get("/", controllers.listar);
router.get("/crear", controllers.crear);
router.post("/alta", controllers.alta);
router.get("/editar/:id", controllers.editLote);
router.put("/editar/:id", controllers.putLote);
router.delete("/eliminar/:id", controllers.eliminar);


router.get("/listar", controllers.listadoLotesXTipo);
router.get("/listarVacunasVencidas", controllers.listarVacunasVencidas);
module.exports = router;