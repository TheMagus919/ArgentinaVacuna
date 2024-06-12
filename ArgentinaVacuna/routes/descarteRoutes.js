const express = require("express");
const router = express.Router();
const controllers = require("../controllers/descarteController");

// Ruta para crear un nuevo descarte
router.get("/crear", controllers.crear);
router.post("/alta", controllers.alta);

module.exports = router;