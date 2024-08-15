const { Paciente, Aplicacion, CentroDeVacunacion, LoteProveedor, TipoVacuna } = require("../models");
const { Telefono } = require("../models");
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
var moment = require('moment');


exports.listar = async function (req, res) {
    if (req.session.rol == "Administrador") {
        Paciente.findAll().then((pacientes) => {
            res.render("paciente/ListarPacientes", { listaDePacientes: pacientes, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Pacientes" });
        })
            .catch((err) => res.render("error", { error: err }));
    } else {
        Paciente.findAll({ where: { provincia: req.session.provincia } }).then((pacientes) => {
            res.render("paciente/ListarPacientes", { listaDePacientes: pacientes, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Pacientes" });
        })
            .catch((err) => res.render("error", { error: err }));
    }

};

exports.editPaciente = function (req, res) {
    Paciente.findByPk(req.params.id)
        .then(async (pac) => {
            if (pac == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Paciente con esa informacion." } });
            }
            res.render("paciente/actualizar", { pac: pac, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Pacientes" });
        }
        )
        .catch((err) => res.render("error", { error: err }));
};

exports.putPaciente = async function (req, res) {
    try {
        const fechaActual = moment().format('L');
        if (req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.localidad != "" || req.body.localidad != null && req.body.celular != "" || req.body.celular != null && req.body.celularDeRespaldo != "" || req.body.celularDeRespaldo != null) {
            const hoy = new Date(fechaActual);
            const fechaNac = new Date(req.body.fechaDeNacimiento);
            if (fechaNac >= hoy) {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fecha de Nacimiento invalida." } });
            } else if (req.body.genero == "masculino" || req.body.genero == "femenino") {
                await Paciente.update({ dniPaciente: req.params.id, nombre: req.body.nombre, apellido: req.body.apellido, fechaDeNacimiento: req.body.fechaDeNacimiento, genero: req.body.genero, localidad: req.body.localidad, celular: req.body.celular, celularDeRespaldo: req.body.celularDeRespaldo }, { where: { dniPaciente: req.params.id } })
                    .then((result) => {
                        if (result[0] == 1) {
                            res.redirect("/paciente");
                        } else {
                            res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "El Paciente no se pudo editar." } });
                        }
                    })
                    .catch((err) => res.render("error", { error: err }));
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

exports.crear = function (req, res) {
    res.render("paciente/crear", { title: "Pacientes", name: req.session.nombre, mail: req.session.mail, rol: req.session.rol });
};

exports.alta = async function (req, res) {
    try {
        const fechaActual = moment().format('L');
        if (req.body.dniPaciente != "" || req.body.dniPaciente != null && req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.mail != "" || req.body.mail != null && req.body.localidad != "" || req.body.localidad != null && req.body.celular != "" || req.body.celular != null && req.body.celularDeRespaldo != "" || req.body.celularDeRespaldo != null) {
            const fecha = moment(req.body.fechaDeNacimiento).format('L');
            const fechaN = new Date(fecha);
            const ActualA = new Date(fechaActual);
            if (fechaN >= ActualA) {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fecha de Nacimiento invalida." } });
            } else if (req.body.genero == "masculino" || req.body.genero == "femenino") {
                const MailExistente = await Paciente.findOne({ where: { mail: req.body.mail } });
                const DniExistente = await Paciente.findByPk(req.body.dniPaciente);
                if (MailExistente === null && DniExistente === null) {
                    Paciente.create({ dniPaciente: req.body.dniPaciente, nombre: req.body.nombre, apellido: req.body.apellido, fechaDeNacimiento: req.body.fechaDeNacimiento, genero: req.body.genero, mail: req.body.mail, provincia: req.session.provincia, localidad: req.body.localidad, celular: req.body.celular, celularDeRespaldo: req.body.celularDeRespaldo })
                        .then((result) => {
                            if (result) {
                                res.redirect("/paciente");
                            } else {
                                res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "El Paciente no se pudo crear." } });
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                } else {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Los Datos ingresado no se pueden utilizar." } });
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

exports.registro = async function (req, res) {
    const paciente = await Paciente.findByPk(req.params.id);
    Aplicacion.findAll({ include: [{ model: LoteProveedor, include: { model: TipoVacuna } }, { model: CentroDeVacunacion }], where: { dniPaciente: req.params.id } })
        .then((result) => {
            res.render("paciente/registro", { title: "Registro Medico", name: req.session.nombre, mail: req.session.mail, rol: req.session.rol, listaRegistro: result, paciente: paciente });
        })
        .catch((err) => res.render("error", { error: err }));
};

//ADMINISTRADOR
exports.eliminar = function (req, res) {
    Paciente.findByPk(req.params.id)
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Paciente con esa informacion." } });
            } else {
                result.destroy();
                res.status(200).json({ message: 'Registro borrado exitosamente.' });
            }
        })
        .catch((err) => res.render("error", { error: err }));
};