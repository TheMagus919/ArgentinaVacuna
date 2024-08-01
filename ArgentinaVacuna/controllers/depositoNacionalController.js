const { DepositoNacional, TrasladoDeposito, LoteProveedor, TipoVacuna, Descarte, Laboratorio } = require("../models");
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const depositoNacional = require("../models/depositoNacional");


exports.listar = async function (req, res) {
    if (req.session.rol == "Administrador") {
        DepositoNacional.findAll().then((depNac) => {
            res.render("depositoNacional/ListaDepositosNacionales", { title: "Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, depositoNacional: depNac });
        })
            .catch((err) => res.render("error", { error: err }));
    } else {
        DepositoNacional.findOne({ where: { provincia: req.session.provincia } }).then((depNac) => {
            res.render("depositoNacional/ListaDepositosNacionales", { title: "Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, depositoNacional: depNac });
        })
            .catch((err) => res.render("error", { error: err }));
    }

};

exports.stock = async function (req, res) {
    TrasladoDeposito.findAll({ include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }] }], where: [{ descartado: false }, { idDepNac: req.params.id }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }, { fechaDeAdquisicion: { [Op.not]: null } }] })
        .then((result) => {
            res.render("depositoNacional/stock", { title: "Deposito Nacional Stock", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, stock: result });
        })
        .catch((err) => res.render("error", { error: err }));
};


exports.listarVacunasXLaboratorio = function (req, res) {
    try {
        const inicio = req.body.fechaInicio;
        const fin = req.body.fechaFin;
        const rango = req.body.fechaInicio + " - " + req.body.fechaFin
        req.session.fechaInicio = req.body.fechaInicio;
        req.session.fechaFin = req.body.fechaFin;
        req.session.save(err => {
            if (err) {
                return res.send('Error al guardar la sesión');
            }
        });
        TrasladoDeposito.findAll({
            include: [{
                model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }]
            }, {
                model: DepositoNacional
            }],
            where: [{
                fechaDeCompra: {
                    [Op.between]: [inicio, fin]
                }
            }, {
                '$DepositoNacional.provincia$': req.session.provincia
            }],
            attributes: [
                [sequelize.fn('SUM', sequelize.col('TrasladoDeposito.cantidadDeVacunas')), 'cantidadDeVacunas'],
            ],
            group: ['LoteProveedor.Laboratorio.nombre']
        })
            .then((result) => {
                if (result == null) {
                    res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Lote Proveedor con esa informacion." } });
                } else {
                    console.log(result)
                    res.render("depositoNacional/listaVacunas", { title: "Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, rango: rango, listaLabs: result, fechaInicio: inicio, fechaFin: fin });
                }
            })
            .catch((err) => res.render("error", { error: err }));

    } catch (error) {
        res.render("error", { error: error });
    }
}

exports.consultarVacunas = async function (req, res) {
    const laboratorio = await Laboratorio.findByPk(req.params.id);
    TrasladoDeposito.findAll({
        include: [{
            model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }]
        }, {
            model: DepositoNacional
        }],
        where: [{
            fechaDeCompra: {
                [Op.between]: [req.session.fechaInicio, req.session.fechaFin]
            }
        }, {
            '$DepositoNacional.provincia$': req.session.provincia
        }, {
            '$LoteProveedor.idLab$': req.params.id
        }]
    })
        .then((result) => {
            if (result != null) {
                res.render("depositoNacional/consultar", { title: "Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, fechaInicio: req.body.fechaInicio, fechaFin: req.body.fechaFin, lotes: result, nombre: laboratorio.nombre });
            } else {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Lote Proveedor con esa informacion." } });
            }
        })
        .catch((err) => res.render("error", { error: err }));

};

//SOLO ADMINISTRADOR
exports.editDepo = function (req, res) {
    DepositoNacional.findByPk(req.params.id)
        .then(async (dep) => {
            if (dep == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Deposito Nacional con esa informacion." } });
            }
            res.render("depositoNacional/editar", { dep: dep, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Deposito Nacional" });
        }
        )
        .catch((err) => res.render("error", { error: err }));
};

exports.putDepo = async function (req, res) {
    try {
        if (req.body.nombre != "" || req.body.nombre != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null) {
            await DepositoNacional.update({ idDepNac: req.params.id, nombre: req.body.nombre, localidad: req.body.localidad, direccion: req.body.direccion }, { where: { idDepNac: req.params.id } })
                .then((result) => {
                    if (result[0] == 1) {
                        res.redirect("/depositoNacional");
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