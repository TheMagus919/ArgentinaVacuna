const { Descarte, DepositoProvincial, DepositoNacional, CentroDeVacunacion, AgenteDeSalud, TrasladoDeposito, TipoVacuna, LoteProveedor, DistribucionCentro, DistribucionDeposito } = require("../models");
const { Sequelize, Op, fn, col, literal } = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");

//NACION
exports.crearNacion = async function (req, res) {
    const listaTraslado = await TrasladoDeposito.findAll({ include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }] }, { model: DepositoNacional }], where: [{ descartado: false }, { fechaDeCompra: { [Op.not]: null } }, { fechaDeAdquisicion: { [Op.not]: null } }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }, { '$DepositoNacional.provincia$': req.session.provincia }] });
    const deposito = await DepositoNacional.findOne({ where: { provincia: req.session.provincia } });
    const responsable = await AgenteDeSalud.findByPk(req.session.userId);
    res.render("descarte/descartar", { title: "Descarte", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, deposito: deposito, lotes: listaTraslado, agente: responsable });
};

exports.altaNacion = async function (req, res) {
    if (req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nroLote != null || req.body.nroLote != "" && req.body.formaDescarte != "" || req.body.formaDescarte != null && req.body.empresaResponsable != "" || req.body.empresaResponsable != null && req.body.motivo != "" || req.body.motivo != null) {
        const AgenteExistente = await AgenteDeSalud.findByPk(req.body.dniAgente);
        const LoteExistente = await LoteProveedor.findByPk(req.body.nroLote);
        const DepNac = await DepositoNacional.findOne({ where: { provincia: req.session.provincia } });
        const cantidad = await TrasladoDeposito.findOne({ include: { model: LoteProveedor }, where: [{ idDepNac: DepNac.idDepNac }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }, { nroLote: req.body.nroLote }, { descartado: false }] });
        const fechaActual = moment().format('L');
        if (AgenteExistente === null && LoteExistente === null) {
            res.render("error", { message: "Not Found", error: { status: 404, stack: "Responsable o Lote no encontrado" } });
        } else {
            Descarte.create({ dniAgente: req.body.dniAgente, idCentro: null, idDepProv: null, idDepNac: DepNac.idDepNac, nroLote: req.body.nroLote, cantidadDeVacunas: cantidad.cantidadDeVacunas, formaDescarte: req.body.formaDescarte, empresaResponsable: req.body.empresaResponsable, motivo: req.body.motivo, fechaDeDescarte: fechaActual })
                .then((result) => {
                    if (result) {
                        TrasladoDeposito.update({ cantidadDeVacunas: 0, descartado: true }, { where: { idTrasladoDep: cantidad.idTrasladoDep } })
                            .then((resultado) => {
                                res.redirect("/");
                            })
                            .catch((err) => res.render("error", { error: err }));
                    } else {
                        res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "No se pudo realizar el Descarte." } });
                    }
                })
                .catch((err) => res.render("error", { error: err }));
        }
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
    }
};

//PROVINCIA
exports.crearProvincia = async function (req, res) {
    const depositos = await DepositoProvincial.findAll({ where: { idDepProv: { [Op.in]: req.session.trabaja } } });
    const responsable = await AgenteDeSalud.findByPk(req.session.userId);
    res.render("descarte/descartarProv", { title: "Descarte", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, depositos: depositos, agente: responsable });
};

exports.llenarLoteProv = function (req, res) {
    DistribucionDeposito.findAll({ include: { model: LoteProveedor, include: [{ model: TipoVacuna }] }, where: [{ cantidadDeVacunas: { [Op.gt]: 0 } }, { descartado: false }, { fechaDeSalidaDepNac: { [Op.not]: null } }, { fechaLlegadaDepProv: { [Op.not]: null } }, { '$LoteProveedor.vencidas$': false }, { idDepProv: req.query.id }] })
        .then((lotes) => {
            res.json({ lotes });;
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.altaProvincia = async function (req, res) {
    if (req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nroLote != null || req.body.nroLote != "" && req.body.formaDescarte != "" || req.body.formaDescarte != null && req.body.empresaResponsable != "" || req.body.empresaResponsable != null && req.body.motivo != "" || req.body.motivo != null && req.body.idDepProv != "" || req.body.idDepProv != null) {
        const AgenteExistente = await AgenteDeSalud.findByPk(req.body.dniAgente);
        const LoteExistente = await LoteProveedor.findByPk(req.body.nroLote);
        const cantidad = await DistribucionDeposito.findAll({
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('cantidadDeVacunas')), 'cantidadTotalVacunas']
            ],
            where: [{ nroLote: req.body.nroLote }, { idDepProv: req.body.idDepProv }, { descartado: false }, { cantidadDeVacunas: { [Op.gt]: 0 } }],
            raw: true
        });
        const fechaActual = moment().format('L');
        if (AgenteExistente === null && LoteExistente === null) {
            res.render("error", { message: "Not Found", error: { status: 404, stack: "Responsable o Lote no encontrado" } });
        } else {
            Descarte.create({ dniAgente: req.body.dniAgente, idCentro: null, idDepProv: req.body.idDepProv, idDepNac: null, nroLote: req.body.nroLote, cantidadDeVacunas: cantidad[0].cantidadTotalVacunas, formaDescarte: req.body.formaDescarte, empresaResponsable: req.body.empresaResponsable, motivo: req.body.motivo, fechaDeDescarte: fechaActual })
                .then((result) => {
                    if (result) {
                        DistribucionDeposito.update({ cantidadDeVacunas: 0, descartado: true }, { where: [{ nroLote: req.body.nroLote }, { idDepProv: req.body.idDepProv }, { descartado: false }, { cantidadDeVacunas: { [Op.gt]: 0 } }] })
                            .then((resultado) => {
                                res.redirect("/");
                            })
                            .catch((err) => res.render("error", { error: err }));
                    } else {
                        res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "No se pudo realizar el Descarte." } });
                    }
                })
                .catch((err) => res.render("error", { error: err }));
        }
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
    }
};

//CENTRO DE VACUNACION
exports.crearCentro = async function (req, res) {
    const centros = await CentroDeVacunacion.findAll({ where: { idCentro: { [Op.in]: req.session.trabaja } } });
    const responsable = await AgenteDeSalud.findByPk(req.session.userId);
    res.render("descarte/descartarCentro", { title: "Descarte", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, centros: centros, agente: responsable });
};

exports.llenarLoteCentro = async function (req, res) {
    DistribucionCentro.findAll({ include: { model: LoteProveedor, include: [{ model: TipoVacuna }] }, where: [{ cantidadDeVacunas: { [Op.gt]: 0 } }, { descartado: false }, { fechaDeSalidaDepProv: { [Op.not]: null } }, { fechaLlegadaCentro: { [Op.not]: null } }, { '$LoteProveedor.vencidas$': false }, { idCentro: req.query.id }] })
        .then((lotes) => {
            res.json({ lotes });;
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.altaCentro = async function (req, res) {
    if (req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nroLote != null || req.body.nroLote != "" && req.body.formaDescarte != "" || req.body.formaDescarte != null && req.body.empresaResponsable != "" || req.body.empresaResponsable != null && req.body.motivo != "" || req.body.motivo != null && req.body.idCentro != "" || req.body.idCentro != null && req.body.idDisCentro != "" || req.body.idDisCentro != null) {
        const AgenteExistente = await AgenteDeSalud.findByPk(req.body.dniAgente);
        const LoteExistente = await LoteProveedor.findByPk(req.body.nroLote);
        const CentroExistente = await CentroDeVacunacion.findByPk(req.body.idCentro);
        const fechaActual = moment().format('L');
        const cantidad = await DistribucionCentro.findAll({
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('cantidadDeVacunas')), 'cantidadTotalVacunas']
            ],
            where: [{ nroLote: req.body.nroLote }, { idCentro: req.body.idCentro }, { descartado: false }, { cantidadDeVacunas: { [Op.gt]: 0 } }],
            raw: true
        });
        if (AgenteExistente === null || LoteExistente === null || CentroExistente === null) {
            res.render("error", { message: "Not Found", error: { status: 404, stack: "Responsable, Lote o Centro de Vacunacion no encontrados" } });
        } else {
            Descarte.create({ dniAgente: req.body.dniAgente, idCentro: req.body.idCentro, idDepProv: null, idDepNac: null, nroLote: req.body.nroLote, cantidadDeVacunas: cantidad[0].cantidadTotalVacunas, formaDescarte: req.body.formaDescarte, empresaResponsable: req.body.empresaResponsable, motivo: req.body.motivo, fechaDeDescarte: fechaActual })
                .then((result) => {
                    if (result) {
                        DistribucionCentro.update({ cantidadDeVacunas: 0, descartado: true }, { where: [{ idDisCentro: req.body.idDisCentro }] })
                            .then((resultado) => {
                                res.redirect("/");
                            })
                            .catch((err) => res.render("error", { error: err }));
                    } else {
                        res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "No se pudo realizar el Descarte." } });
                    }
                })
                .catch((err) => res.render("error", { error: err }));
        }
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
    }
};
