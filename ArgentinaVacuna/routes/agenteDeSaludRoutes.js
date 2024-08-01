const express = require("express");
const router = express.Router();
const controllers = require("../controllers/agenteDeSaludController");
const Usuario = require('../controllers/agenteDeSaludController');

router.get("/perfil", Usuario.authMiddleware, controllers.perfil);
router.put("/perfil", Usuario.authMiddleware, controllers.editarPerfil);

module.exports = router;