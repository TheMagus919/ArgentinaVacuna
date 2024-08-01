const { CentroDeVacunacion, DistribucionCentro, Descarte, LoteProveedor, TipoVacuna } = require("../models");
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');


exports.listar = async function (req, res) {
    if (req.session.rol == "Administrador") {
        CentroDeVacunacion.findAll().then((centro) => {
            res.render("centroDeVacunacion/ListaDeCentros", { title: "Centro de Vacunacion", provincia: req.session.provincia, name: req.session.nombre, mail: req.session.mail, rol: req.session.rol, listaDeCentros: centro });
        })
            .catch((err) => res.render("error", { error: err }));
    } else {
        CentroDeVacunacion.findAll({ where: [{ provincia: req.session.provincia }, { idCentro: { [Op.in]: req.session.trabaja } }] }).then((centro) => {
            res.render("centroDeVacunacion/ListaDeCentros", { title: "Centro de Vacunacion", provincia: req.session.provincia, name: req.session.nombre, mail: req.session.mail, rol: req.session.rol, listaDeCentros: centro });
        })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.stock = async function (req, res) {
    DistribucionCentro.findAll({ include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }] }], where: [{ descartado: false }, { idCentro: req.params.id }, { fechaLlegadaCentro: { [Op.not]: null } }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }] })
        .then((result) => {
            res.render("centroDeVacunacion/stock", { title: "Stock Disponible", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, stock: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

//SOLO ADMINISTRADOR
exports.editCentro = function (req, res) {
    CentroDeVacunacion.findByPk(req.params.id)
        .then(async (centro) => {
            if (centro == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Centro de Vacunacion con esa informacion." } });
            }
            res.render("centroDeVacunacion/editar", { title: "Centro de Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, centro: centro });
        }
        )
        .catch((err) => res.render("error", { error: err }));
};

exports.putCentro = async function (req, res) {
    try {
        if (req.body.nombre != "" || req.body.nombre != null && req.body.localidad != "" || req.body.localidad != null && req.body.provincia != "" || req.body.provincia != null && req.body.direccion != "" || req.body.direccion != null) {
            await CentroDeVacunacion.update({ idCentro: req.params.id, nombre: req.body.nombre, provincia: req.body.provincia, direccion: req.body.direccion }, { where: { idCentro: req.params.id } })
                .then((result) => {
                    if (result[0] == 1) {
                        res.redirect("/centroDeVacunacion");
                    }
                })
                .catch((err) => res.render("error", { error: err }));
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.crear = function (req, res) {
    res.render("centroDeVacunacion/crear", { title: "Centro de Vacunacion", name: req.session.nombre, mail: req.session.mail, rol: req.session.rol });
};

exports.alta = function (req, res) {
    try {
        if (req.body.nombre != "" || req.body.nombre != null && req.body.localidad != "" || req.body.localidad != null && req.body.provincia != "" || req.body.provincia != null && req.body.direccion != "" || req.body.direccion != null) {
            CentroDeVacunacion.create({ nombre: req.body.nombre, provincia: req.body.provincia, localidad: req.body.localidad, direccion: req.body.direccion })
                .then((result) => {
                    res.redirect("/centroDeVacunacion");
                })
                .catch((err) => res.render("error", { error: err }));
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.eliminar = function (req, res) {
    CentroDeVacunacion.findByPk(req.params.id)
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Centro de Vacunacion con esa informacion." } });
            }
            result.destroy();
            res.status(200).json({ message: 'Registro borrado exitosamente.' });
        })
        .catch((err) => res.render("error", { error: err }));
};