const { DepositoProvincial, DistribucionDeposito, Descarte, LoteProveedor, TipoVacuna } = require("../models");
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');


exports.listar = async function (req, res) {
    if (req.session.rol == "Administrador") {
        DepositoProvincial.findAll().then((depPro) => {
            res.render("depositoProvincial/ListaDepositosProvinciales", { title: "Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, provincia: req.session.provincia, listaDeDepositosProvinciales: depPro });
        })
            .catch((err) => res.render("error", { error: err }));
    } else {
        DepositoProvincial.findAll({ where: [{ idDepProv: { [Op.in]: req.session.trabaja } }, { provincia: req.session.provincia }] }).then((depPro) => {
            res.render("depositoProvincial/ListaDepositosProvinciales", { title: "Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, provincia: req.session.provincia, listaDeDepositosProvinciales: depPro });
        })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.stock = async function (req, res) {
    DistribucionDeposito.findAll({ include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }] }], where: [{ idDepProv: req.params.id }, { descartado: false }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { fechaLlegadaDepProv: { [Op.not]: null } }, { fechaDeSalidaDepNac: { [Op.not]: null } }, { '$LoteProveedor.vencidas$': false }] })
        .then((result) => {
            console.log(result);
            res.render("depositoProvincial/stock", { title: "Deposito Provincial Stock", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, stock: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

//SOLO ADMINISTRADOR
exports.editDepo = function (req, res) {
    DepositoProvincial.findByPk(req.params.id)
        .then(async (dep) => {
            if (dep == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Deposito Provincial con esa informacion." } });
            }
            res.render("depositoProvincial/editar", { title: "Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, dep: dep });
        }
        )
        .catch((err) => res.render("error", { error: err }));
};

exports.putDepo = async function (req, res) {
    try {
        if (req.body.nombre != "" || req.body.nombre != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null) {
            await DepositoProvincial.update({ idDepProv: req.params.id, nombre: req.body.nombre, localidad: req.body.localidad, direccion: req.body.direccion }, { where: { idDepProv: req.params.id } })
                .then((result) => {
                    if (result[0] == 1) {
                        res.redirect("/depositoProvincial");
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
    res.render("depositoProvincial/crear", { title: "Deposito Provincial", name: req.session.nombre, mail: req.session.mail, rol: req.session.rol });
};

exports.alta = function (req, res) {
    try {
        if (req.body.nombre != "" || req.body.nombre != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null) {
            DepositoProvincial.create({ nombre: req.body.nombre, provincia: req.session.provincia, localidad: req.body.localidad, direccion: req.body.direccion })
                .then((result) => {
                    res.redirect("/depositoProvincial");
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
    DepositoProvincial.findByPk(req.params.id)
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Deposito Provincial con esa informacion." } });
            }
            result.destroy();
            res.status(200).json({ message: 'Registro borrado exitosamente.' });
        })
        .catch((err) => res.render("error", { error: err }));
};