const { AgenteDeSalud, CentroDeVacunacion, DepositoProvincial, Trabaja, Laboratorio} = require("../models");
const sequelize = require('sequelize');
const bcrypt = require("bcrypt");
const moment = require("moment");

exports.logout = function (req, res) {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error al cerrar sesión');
        }
        res.redirect('/auth/login');
    });
};

exports.loguearse = function (req, res) {
    res.render("agenteDeSalud/login", { title: "Login" });
};

exports.login = async function (req, res) {
    const body = req.body;
    const user = await AgenteDeSalud.findOne({ where: { mail: body.mail } });
    const trabajaCentro = await Trabaja.findAll({where:[{dniAgente:user.dniAgente}, {idDepProv:null}, {idLab:null}], attributes: ['idCentro']});
    const trabajaDeposito = await Trabaja.findAll({where:[{dniAgente:user.dniAgente}, {idCentro:null}, {idLab:null}], attributes: ['idDepProv']});
    const trabajaLaboratorio = await Trabaja.findAll({where:[{dniAgente:user.dniAgente}, {idCentro:null}, {idDepProv:null}], attributes: ['idLab']});
    if (user) {
        const validPassword = await bcrypt.compare(body.password, user.password);
        if (validPassword) {
            req.session.userId = user.dniAgente;
            req.session.rol = user.rol;
            req.session.provincia = user.provincia;
            req.session.mail = user.mail;
            req.session.nombre = user.nombre + " " + user.apellido;
            if(trabajaCentro.length > 0){
                req.session.trabaja = trabajaCentro.map(centro=>centro.idCentro);
            }else if(trabajaDeposito.length > 0){
                req.session.trabaja = trabajaDeposito.map(deposito=>deposito.idDepProv);
            }else if(trabajaLaboratorio.length > 0){
                req.session.trabaja = trabajaLaboratorio.map(laboratorio=>laboratorio.idLab);
            }
            req.session.save(err => {
                if (err) {
                    return res.send('Error al guardar la sesión');
                }
            });
            res.redirect('/');
        } else {
            res.render("error", { message: "Bad request", error: { status: 400, stack: "Contraseña incorrecta." } });
        }
    } else {
        res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Agente de Salud con esa informacion." } });
    }
};

exports.registrar = function (req, res) {
    res.render("agenteDeSalud/registrar", { title: "Registrar" });
};

exports.alta = async function (req, res) {
    try {
        const fechaActual = moment().format('L');
        if (req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.mail != "" || req.body.mail != null && req.body.matricula != "" || req.body.matricula != null && req.body.password != "" || req.body.password != null && req.body.rol != "" || req.body.rol != null && req.body.provincia != "" || req.body.provincia != null && req.body.pais != "" || req.body.pais!= null) {
            const fecha = moment(req.body.fechaDeNacimiento).format('L');

            const fechaActualParseada = Date.parse(fechaActual);
            const fechaParseada = Date.parse(fecha);
            if (fechaParseada >= fechaActualParseada) {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fecha de Nacimiento invalida." } });
            } else if (req.body.genero == "masculino" || req.body.genero == "femenino") {
                if (req.body.rol == "Medico" || req.body.rol == "Deposito Nacional" || req.body.rol == "Deposito Provincial" || req.body.rol == "Deposito Centro Vacunacion" || req.body.rol == "Laboratorio" || req.body.rol == "Administrador") {
                    const MatriculaExistente = await AgenteDeSalud.findOne({ where: { matricula: req.body.matricula } });
                    const EmailExistente = await AgenteDeSalud.findOne({ where: { mail: req.body.mail } });
                    const DniExistente = await AgenteDeSalud.findByPk(req.body.dniAgente);

                    if (MatriculaExistente === null && EmailExistente === null && DniExistente === null) {
                        const contraseñaHasheada = await bcrypt.hash(req.body.password, 10);
                        AgenteDeSalud.create({ dniAgente: req.body.dniAgente, nombre: req.body.nombre, apellido: req.body.apellido, fechaDeNacimiento: req.body.fechaDeNacimiento, genero: req.body.genero, mail: req.body.mail, pais:req.body.pais, matricula: req.body.matricula, password: contraseñaHasheada, rol: req.body.rol, provincia: req.body.provincia})
                            .then((resulta) => {
                                if (resulta) {
                                    if(req.body.rol=="Deposito Centro Vacunacion" || req.body.rol=="Medico"){
                                        Trabaja.create({dniAgente:req.body.dniAgente, idCentro:req.body.trabajaRegistro, idDepProv:null, idLab:null})
                                        res.redirect('/auth/login');
                                    }else if(req.body.rol=="Deposito Provincial"){
                                        Trabaja.create({dniAgente:req.body.dniAgente, idCentro:null, idDepProv:req.body.trabajaRegistro, idLab:null})
                                        res.redirect('/auth/login');
                                    }else if(req.body.rol=="Laboratorio"){
                                        Trabaja.create({dniAgente:req.body.dniAgente, idCentro:null, idDepProv:null, idLab:req.body.trabajaRegistro})
                                        res.redirect('/auth/login');
                                    }else{
                                        res.redirect('/auth/login');
                                    }
                                } else {
                                    res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "El Agente de Salud no se pudo crear." } });
                                }
                            })
                            .catch((err) => res.render("error", { error: err }));
                    } else {
                        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Los Datos ingresados no se pueden utilizar." } });
                    }
                } else {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "El Rol ingresado es invalido." } });
                }
            } else {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "El Genero ingresado es invalido." } });
            }
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.cambiarContraseña = function (req, res) {
    res.render("agenteDeSalud/cambiarContra", { title: "Cambiar Contraseña", name: req.session.nombre, mail: req.session.mail });
};

exports.altaContraseña = async function (req, res) {
    const Usuario = await AgenteDeSalud.findByPk(req.session.userId);
    const password = req.body.password;
    const nuevoPassword = req.body.repetirPassword;
    const repetirPassword = req.body.repetirPassword;

    if (Usuario) {
        if (nuevoPassword == repetirPassword) {
            const validPassword = await bcrypt.compare(password, Usuario.password);
            if (validPassword) {
                const contraseñaHasheada = await bcrypt.hash(nuevoPassword, 10);
                await AgenteDeSalud.update({ password: contraseñaHasheada }, { where: { dniAgente: req.session.userId } })
                    .then((result) => {
                        if (result[0] == 1) {
                            res.redirect("/");
                        } else {
                            res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "No se pudo cambiar la contraseña." } });
                        }
                    })
                    .catch((err) => res.render("error", { error: err }));
            } else {
                res.render("error", { message: "Bad request", error: { status: 400, stack: "Contraseña incorrecta." } });
            }
        } else {
            res.render("error", { message: "Bad request", error: { status: 400, stack: "La nueva contraseña no coincide." } });
        }
    } else {
        res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Agente de Salud con esa informacion." } });
    }
};

exports.trabajo = async function (req, res) {
    const provincia = req.query.provincia;
    const pais = req.query.pais;
    const rol = req.query.rol;
  if (!provincia && !rol) {
    return res.status(400).json({ error: 'Se requiere el parámetro "provincia" y "rol"' });
  }else{
    if(rol=="Medico"){
        CentroDeVacunacion.findAll({where:{provincia:provincia}})
        .then((centros)=>{
            res.json({ centros });; 
        })
        .catch((err) => res.render("error", { error: err }));
    }else if(rol=="Deposito Provincial"){
        DepositoProvincial.findAll({where:{provincia:provincia}})
        .then((depositos)=>{
            res.json({ depositos });; 
        })
        .catch((err) => res.render("error", { error: err }));
    }else if(rol=="Deposito Centro Vacunacion"){
        CentroDeVacunacion.findAll({where:{provincia:provincia}})
        .then((centros)=>{
            res.json({ centros });; 
        })
        .catch((err) => res.render("error", { error: err }));
    }else if(rol=="Laboratorio"){
        Laboratorio.findAll({where:[{provincia:provincia},{pais:pais}]})
        .then((laboratorios)=>{
            res.json({ laboratorios });; 
        })
        .catch((err) => res.render("error", { error: err }));
    }
  }
};