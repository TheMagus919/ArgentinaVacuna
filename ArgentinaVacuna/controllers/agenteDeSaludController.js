const { AgenteDeSalud } = require("../models");
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const bcrypt = require("bcrypt");
const mysql = require('mysql2');
const moment = require("moment");

exports.perfil = function (req, res) {
    AgenteDeSalud.findByPk(req.session.userId)
        .then(async (ag) => {
            if (ag == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Agente de Salud con esa informacion." } });
            }
            res.render("agenteDeSalud/editar", { ag: ag, title: "Perfil" });
        }
        )
        .catch((err) => res.render("error", { error: err }));
};

exports.editarPerfil = async function (req, res) {
    try {
        const fechaActual = moment().format('L');
        if (req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.provincia != "" || req.body.provincia != null) {
            const fecha = moment(req.body.fechaDeNacimiento).format('L');
            const fechaActualParseada = Date.parse(fechaActual);
            const fechaParseada = Date.parse(fecha);
            if (fechaParseada >= fechaActualParseada) {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fecha de Nacimiento invalida." } });
            } else if (req.body.genero == "masculino" || req.body.genero == "femenino") {
                await AgenteDeSalud.update({ nombre: req.body.nombre, apellido: req.body.apellido, fechaDeNacimiento: req.body.fechaDeNacimiento, genero: req.body.genero, provincia: req.body.provincia }, { where: { dniAgente: req.session.userId } })
                    .then((result) => {
                        if (result[0] == 1) {
                            res.redirect("/");
                        } else {
                            res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "El Agente de Salud no se pudo editar." } });
                        }
                    })
                    .catch((err) => res.render("error", { error: err }));
            } else {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "El Genero ingresado no es Valido." } });
            }
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.authMiddleware = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

exports.roleMiddleware = roles => {
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    return (req, res, next) => {
        if (roles.includes(req.session.rol)) {
            next();
        } else {
            res.render("error", { message: "Forbidden", error: { status: 403, stack: "No tienes permiso para acceder a esta página." } });
        }
    };
};