var express = require('express');
var router = express.Router();
const Usuario = require('../controllers/agenteDeSaludController');

/* GET home page. */
router.get('/', Usuario.authMiddleware,function(req, res, next) {
  if(!req.session.rol){
    req.session.rol = null;
  }
  res.render('index', { title: 'Argentina Vacuna', rol:req.session.rol, name:req.session.nombre, mail:req.session.mail});
});

module.exports = router;
