var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var laboratorioRoutes = require('./routes/laboratorioRoutes')
var loteProveedorRoutes = require('./routes/loteProveedorRoutes')
var pacienteRoutes = require('./routes/pacienteRoutes')
var agenteDeSaludRoutes = require('./routes/agenteDeSaludRoutes')
var depositoNacionalRoutes = require('./routes/depositoNacionalRoutes')
var depositoProvincialRoutes = require('./routes/depositoProvincialRoutes')
var centroDeVacunacionRoutes = require('./routes/centroDeVacunacionRoutes')
var aplicacionRoutes = require('./routes/aplicacionRoutes')
var tipoVacunaRoutes = require('./routes/tipoVacunaRoutes');
var descarteRoutes = require('./routes/descarteRoutes')
var authRoutes = require('./routes/authRoutes');

var trasladoRoutes = require('./routes/trasladoRoutes')
var distribucionRoutes = require('./routes/distribucionRoutes')

const override = require("method-override");

var app = express();
app.use(override("_method"));
app.use(session({
  secret:'BOCAJUNIORS',
  resave:false,
  saveUninitialized:false,
  cookie:{
          maxAge:12*60*60*1000
  }
}))

const { request } = require('http');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));


app.use('/', indexRouter);
app.use('/auth', authRoutes);
app.use('/laboratorio', laboratorioRoutes);
app.use('/loteProveedor', loteProveedorRoutes);
app.use('/paciente', pacienteRoutes);
app.use('/agenteDeSalud', agenteDeSaludRoutes);
app.use('/depositoNacional', depositoNacionalRoutes);
app.use('/depositoProvincial', depositoProvincialRoutes);
app.use('/centroDeVacunacion', centroDeVacunacionRoutes);
app.use('/aplicacion', aplicacionRoutes);
app.use('/tipoVacuna', tipoVacunaRoutes);
app.use('/descarte', descarteRoutes);
app.use('/traslado', trasladoRoutes);
app.use('/distribucion', distribucionRoutes);

var {agenteDeSalud} = require('./models');
var {aplicacion} = require('./models');
var {centroDeSalud} = require('./models');
var {depositoNacional} = require('./models');
var {depositoProvincial} = require('./models');
var {descarte} = require('./models');
var {distribucionCentro} = require('./models');
var {distribucionDeposito} = require('./models');
var {laboratorio} = require('./models');
var {loteProveedor} = require('./models');
var {paciente} = require('./models');
var {traslado} = require('./models');
var {trasladoDeposito} = require('./models');
var {tipoVacuna} = require('./models');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//Iniciar Servidor
const port = 2000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
