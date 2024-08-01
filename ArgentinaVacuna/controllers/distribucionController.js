const { DistribucionCentro, TrasladoDeposito, Traslado, DistribucionDeposito, DepositoProvincial, DepositoNacional, CentroDeVacunacion, LoteProveedor, TipoVacuna, Laboratorio, Descarte } = require("../models");
const { Sequelize, Op, fn, col, literal } = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");


//DEPOSITO NACIONAL
exports.listarDistribucionDepoNac = function (req, res) {
    if (req.session.rol == "Administrador") {
        TrasladoDeposito.findAll({ include: [{ model: DepositoNacional }, { model: LoteProveedor }] })
            .then(async (result) => {
                const depo = await DepositoNacional.findOne({ where: { provincia: req.session.provincia } });
                res.render("distribucion/depositoNacionalDis/listarDis", { title: "Distribucion Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeDistribucion: result, deposito: depo });
            })
            .catch((err) => res.render("error", { error: err }));
    } else {
        TrasladoDeposito.findAll({ include: [{ model: DepositoNacional }, { model: LoteProveedor }], where: [{ '$DepositoNacional.provincia$': req.session.provincia }, { fechaDeAdquisicion: { [Op.not]: null } }, { descartado: false }] })
            .then(async (result) => {
                const depo = await DepositoNacional.findOne({ where: { provincia: req.session.provincia } });
                res.render("distribucion/depositoNacionalDis/listarDis", { title: "Distribucion Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeDistribucion: result, deposito: depo });
            })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.listarLotesDepoNac = async function (req, res) {
    try {
        const lotesTrasladados = await TrasladoDeposito.findAll({ attributes: ['nroLote'] });
        const listaTrasladadas = [];

        for (var i = 0; i < lotesTrasladados.length; i++) {
            listaTrasladadas.push(lotesTrasladados[i].nroLote);
        }
        if (lotesTrasladados == null || lotesTrasladados.length === 0) {
            await LoteProveedor.findAll({ include: TipoVacuna, where: [{ cantidadDeVacunas: { [Op.gt]: 0 } }, { vencidas: false }] })
                .then((result) => {
                    if (result == null) {
                        res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ninguna informacion con los datos proporcionados." } });
                    } else {
                        res.render("distribucion/depositoNacionalDis/listarLotes", { title: "Distribucion Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeLotes: result });
                    }
                }).catch((err) => res.render("error", { error: err }));
        } else {
            await LoteProveedor.findAll({ include: TipoVacuna, where: [{ cantidadDeVacunas: { [Op.gt]: 0 } }, { vencidas: false }, { nroLote: { [Op.notIn]: listaTrasladadas } }] })
                .then((result) => {
                    if (result == null) {
                        res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ninguna informacion con los datos proporcionados." } });
                    } else {
                        res.render("distribucion/depositoNacionalDis/listarLotes", { title: "Distribucion Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeLotes: result });
                    }
                }).catch((err) => res.render("error", { error: err }));
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.comprasEnProceso = async function (req, res) {
    TrasladoDeposito.findAll({ include: [{ model: DepositoNacional }, { model: LoteProveedor }], where: { fechaDeAdquisicion: null } })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/distribucionEnProceso", { title: "Compras en Proceso", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaDistribucion: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviosEnProceso = async function (req, res) {
    DistribucionDeposito.findAll({ include: [{ model: DepositoNacional }, { model: DepositoProvincial }, { model: LoteProveedor }], where: [{ fechaLlegadaDepProv: null }, { fechaDeSalidaDepNac: { [Op.not]: null } }] })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/enviosEnProceso", { title: "Envios en Proceso", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaDistribucion: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.listaSolicitudesDepNac = async function (req, res) {
    DistribucionDeposito.findAll({ include: [{ model: DepositoNacional }, { model: DepositoProvincial }, { model: LoteProveedor }], where: [{ fechaLlegadaDepProv: null }, { fechaDeSalidaDepNac: null }] })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/listaSolicitudes", { title: "Solicitudes Pendientes", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, solicitudes: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.obtenerInformacionEnvio = function (req, res) {
    DistribucionDeposito.findByPk(req.params.id, { include: [{ model: DepositoNacional }, { model: DepositoProvincial }, { model: LoteProveedor }] })
        .then(async (result) => {
            const trasladoDeposito = await TrasladoDeposito.findOne({ where: [{ nroLote: result.nroLote }, { idDepNac: result.idDepNac }, { descartado: false }] });
            res.render("distribucion/depositoNacionalDis/formEnvioSolicitado", { title: "Enviar Vacunas Solicitadas", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, solicitud: result, fecha: trasladoDeposito });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviarVacunaDepNac = function (req, res) {
    DistribucionDeposito.update({ fechaDeSalidaDepNac: req.body.fechaDeSalidaDepNac }, { where: { idDisDep: req.params.id } })
        .then((result) => {
            res.redirect("/distribucion/distribucionDepoNac");
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.obtenerIngresoDepoNac = async function (req, res) {
    TrasladoDeposito.findByPk(req.params.id, { include: [{ model: LoteProveedor }, { model: DepositoNacional }] })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/ingreso", { title: "Distribucion Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ingreso: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.registrarIngresoDepoNac = async function (req, res) {
    if (req.body.fechaDeAdquisicion != "" || req.body.fechaDeAdquisicion != null) {
        const traslado = await TrasladoDeposito.findByPk(req.params.id, { include: { model: LoteProveedor } });
        const fechaAd = new Date(req.body.fechaDeAdquisicion);
        const fechaCompra = new Date(traslado.fechaDeCompra);
        const fechaVen = new Date(traslado.LoteProveedor.fechaDeVencimiento);
        if (fechaAd < fechaCompra || fechaAd > fechaVen) {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error en las Fechas de Adquisicion." } });
        } else {
            TrasladoDeposito.update({ fechaDeAdquisicion: req.body.fechaDeAdquisicion }, { where: { idTrasladoDep: req.params.id } })
                .then((result) => {
                    res.redirect("/distribucion/distribucionDepoNac");
                })
                .catch((err) => res.render("error", { error: err }));
        }
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fecha de Adquisicion incompleta o incorrecta." } });
    }
};

exports.crearDistribucionDepoNac = async function (req, res) {
    try {
        const depositosNac = await DepositoNacional.findOne({ where: { provincia: req.session.provincia } });
        LoteProveedor.findByPk(req.params.id)
            .then((result) => {
                res.render("distribucion/depositoNacionalDis/distribuir", { title: "Distribucion Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, deposito: depositosNac, lote: result });
            })
            .catch((err) => res.render("error", { error: err }));
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.altaDistribucionDepoNac = async function (req, res) {
    const textoN = req.body.idDepNac;
    const partesN = textoN.split('-');
    var depoN = partesN[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    var loteP = await LoteProveedor.findByPk(lote);
    const cantidad = parseInt(loteP.cantidadDeVacunas);

    const fechaFab = moment(loteP.fechaDeFabricacion).format('L');
    const fechaVen = moment(loteP.fechaDeVencimiento).format('L');
    const fechaCom = moment(req.body.fechaDeCompra).format('L');
    const fechaAd = moment(req.body.fechaDeAdquisicion).format('L');

    try {
        if (req.body.idDepNac != null || req.body.idDepNac != "" && req.body.nroLote != null || req.body.nroLote != "") {
            if (req.body.fechaDeAdquisicion) {
                if (fechaAd <= fechaFab || fechaAd < fechaCom || fechaAd >= fechaVen || fechaCom <= fechaFab || fechaCom >= fechaVen || loteP.vencidas == true) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
                } else {
                    TrasladoDeposito.create({ idDepNac: depoN, nroLote: lote, cantidadDeVacunas: cantidad, fechaDeCompra: req.body.fechaDeCompra, fechaDeAdquisicion: req.body.fechaDeAdquisicion, descartado: false })
                        .then((respu) => {
                            if (respu) {
                                res.redirect("/distribucion/distribucionDepoNac");
                            } else {
                                res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "La Distribucion al Deposito Nacional no se pudo crear." } });
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                }
            } else {
                if (fechaCom <= fechaFab || fechaCom >= fechaVen || loteP.vencidas == true) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
                } else {
                    TrasladoDeposito.create({ idDepNac: depoN, nroLote: lote, cantidadDeVacunas: cantidad, fechaDeCompra: req.body.fechaDeCompra, fechaDeAdquisicion: null, descartado: false })
                        .then((respu) => {
                            if (respu) {
                                res.redirect("/distribucion/distribucionDepoNac");
                            } else {
                                res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "La Distribucion al Deposito Nacional no se pudo crear." } });
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                }
            }
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.consultarDistribucionDepoNac = function (req, res) {
    TrasladoDeposito.findByPk(req.params.id, { include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }, { model: DepositoNacional }] })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/consultar", { title: "Distribucion Deposito Nacional", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, distri: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviarLotes = async function (req, res) {
    const depo = await DepositoNacional.findOne({ where: { provincia: req.session.provincia } });
    TrasladoDeposito.findAll({ include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }] }, { model: DepositoNacional }], where: [{ cantidadDeVacunas: { [Op.gt]: 0 } }, { idDepNac: depo.idDepNac }, { '$LoteProveedor.vencidas$': false }, { fechaDeAdquisicion: { [Op.not]: null } }, { descartado: false }] })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/enviarLotes", { title: "Distribucion Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeLotes: result });
        })
        .catch((err) => res.render("error", { error: err }));

};

exports.enviarLote = async function (req, res) {
    const depProv = await DepositoProvincial.findAll({ where: { provincia: req.session.provincia } });
    TrasladoDeposito.findOne({ include: [{ model: LoteProveedor }, { model: DepositoNacional }], where: [{ nroLote: req.params.id }, { '$DepositoNacional.provincia$': req.session.provincia }, { descartado: false }] })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/formEnviar", { title: "Distribucion Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, traslado: result, depositos: depProv });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviar = async function (req, res) {
    const textoN = req.body.idDepNac;
    const partesN = textoN.split('-');
    var depoN = partesN[0].trim();

    const textoP = req.body.idDepProv;
    const partesP = textoP.split('-');
    var depoP = partesP[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();
    var loteP = await LoteProveedor.findByPk(lote);

    var traslado = await TrasladoDeposito.findByPk(req.params.id);

    const fechaVen = moment(loteP.fechaDeVencimiento).format('L');
    const fechaAd = moment(traslado.fechaDeAdquisicion).format('L');
    const fechaSalida = moment(req.body.fechaDeSalidaDepNac).format('L');

    try {
        if (req.body.idDepNac != null || req.body.idDepNac != "" && req.body.nroLote != null || req.body.nroLote != "" && req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.fechaDeSalidaDepNac != null || req.body.fechaDeSalidaDepNac != "") {
            if (fechaAd >= fechaSalida || fechaSalida >= fechaVen || loteP.vencidas == true) {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
            } else if (traslado.cantidadDeVacunas >= req.body.cantidadDeVacunas) {
                DistribucionDeposito.create({ idDepNac: depoN, nroLote: lote, idDepProv: depoP, cantidadDeVacunas: req.body.cantidadDeVacunas, fechaDeSalidaDepNac: req.body.fechaDeSalidaDepNac, fechaLlegadaDepProv: null, descartado: false })
                    .then((result) => {
                        if (result) {
                            const cantidad = traslado.cantidadDeVacunas - req.body.cantidadDeVacunas;
                            TrasladoDeposito.update({ cantidadDeVacunas: cantidad }, { where: { idTrasladoDep: traslado.idTrasladoDep } })
                                .then((result) => {
                                    res.redirect("/distribucion/distribucionDepoNac");
                                })
                                .catch((err) => res.render("error", { error: err }));
                        } else {
                            res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "No se pudo enviar Vacunas al Deposito Provincial." } });
                        }
                    })
                    .catch((err) => res.render("error", { error: err }));
            } else {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos incompletos o invalidos." } });
            }
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos incompletos o invalidos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.registroEnviosDepNac = function (req, res) {
    DistribucionDeposito.findAll({ include: [{ model: LoteProveedor }, { model: DepositoNacional }, { model: DepositoProvincial }], where: [{ '$DepositoNacional.provincia$': req.session.provincia }, { fechaLlegadaDepProv: { [Op.not]: null } }] })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/registroEnvios", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaEnvios: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.registroDescartesDepNac = async function (req, res) {
    const nroLote = await TrasladoDeposito.findAll({ include: { model: DepositoNacional }, where: [{ '$DepositoNacional.provincia$': req.session.provincia }, { descartado: true }], attributes: ['nroLote'] });
    const listaDescarte = [];
    for (var i = 0; i < nroLote.length; i++) {
        listaDescarte.push(nroLote[i].nroLote);
    }
    if (listaDescarte == null || listaDescarte.length == 0) {
        res.render("distribucion/depositoNacionalDis/registroDescartes", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDescarte: [] });
    } else {
        Descarte.findAll({ include: [{ model: LoteProveedor }, { model: DepositoNacional }], where: { nroLote: { [Op.in]: listaDescarte } } })
            .then((result) => {
                res.render("distribucion/depositoNacionalDis/registroDescartes", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDescarte: result });
            })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.consultarEnvioDepNac = function (req, res) {
    DistribucionDeposito.findByPk(req.params.id, { include: [{ model: DepositoNacional }, { model: DepositoProvincial }, { model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }] })
        .then((result) => {
            res.render("distribucion/depositoNacionalDis/consultarEnvio", { title: "Consultar Envio", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, envio: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

//DEPOSITO PROVINCIAL
exports.comprasEnProcesoProv = async function (req, res) {
    DistribucionDeposito.findAll({ include: [{ model: DepositoNacional }, { model: DepositoProvincial }, { model: LoteProveedor }], where: [{ fechaLlegadaDepProv: null }, { fechaDeSalidaDepNac: { [Op.not]: null } }, { '$DepositoProvincial.idDepProv$': { [Op.in]: req.session.trabaja } }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/distribucionEnProceso", { title: "Ingresos en Proceso", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaDistribucion: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviosEnProcesoProv = async function (req, res) {
    DistribucionCentro.findAll({ include: [{ model: CentroDeVacunacion, as: 'DistribucionCentroVac' }, { model: DepositoProvincial }, { model: LoteProveedor }], where: [{ fechaDeSalidaDepProv: { [Op.not]: null } }, { fechaLlegadaCentro: { [Op.is]: null } }, { '$DepositoProvincial.idDepProv$': { [Op.in]: req.session.trabaja } }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/enviosEnProceso", { title: "Envios en Proceso", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaDistribucion: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.consultarEnvio = function (req, res) {
    DistribucionCentro.findByPk(req.params.id, { include: [{ model: CentroDeVacunacion, as: 'DistribucionCentroVac' }, { model: DepositoProvincial }, { model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/consultarEnvio", { title: "Consultar Envio", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, envio: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.registroEnviosDepProv = function (req, res) {
    DistribucionCentro.findAll({ include: [{ model: LoteProveedor }, { model: CentroDeVacunacion, as: 'DistribucionCentroVac' }, { model: DepositoProvincial }], where: [{ idDepProv: { [Op.in]: req.session.trabaja } }, { fechaLlegadaCentro: { [Op.not]: null } }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/registroEnvios", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaEnvios: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.registroDescartesDepProv = async function (req, res) {
    const nroLote = await DistribucionDeposito.findAll({ where: [{ idDepProv: { [Op.in]: req.session.trabaja } }, { descartado: true }], attributes: ['nroLote'] });
    const listaDescarte = [];
    for (var i = 0; i < nroLote.length; i++) {
        listaDescarte.push(nroLote[i].nroLote);
    }
    if (listaDescarte == null || listaDescarte.length == 0) {
        res.render("distribucion/depositoProvincialDis/registroDescartes", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDescarte: [] });
    } else {
        Descarte.findAll({ include: [{ model: LoteProveedor }, { model: DepositoProvincial }], where: [{ nroLote: { [Op.in]: listaDescarte } }, { idDepProv: { [Op.in]: req.session.trabaja } }] })
            .then((result) => {
                res.render("distribucion/depositoProvincialDis/registroDescartes", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDescarte: result });
            })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.enviarDepLoteProv = function (req, res) {
    DepositoProvincial.findAll({ where: { idDepProv: { [Op.in]: req.session.trabaja } } })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/enviarDepositos", { title: "Depositos Provinciales", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaDepositos: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviarLotesProv = async function (req, res) {
    const depo = await DepositoProvincial.findByPk(req.params.id);
    DistribucionDeposito.findAll({ include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }] }, { model: DepositoNacional }, { model: DepositoProvincial }], where: [{ cantidadDeVacunas: { [Op.gt]: 0 } }, { idDepProv: depo.idDepProv }, { '$LoteProveedor.vencidas$': false }, { fechaLlegadaDepProv: { [Op.not]: null } }, { descartado: false }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/enviarLotes", { title: "Distribucion Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeLotes: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviarLoteProv = async function (req, res) {
    const centros = await CentroDeVacunacion.findAll({ where: { provincia: req.session.provincia } });
    await DistribucionDeposito.findOne({ include: [{ model: LoteProveedor }, { model: DepositoProvincial }], where: [{ fechaLlegadaDepProv: { [Op.not]: null } }, { nroLote: req.params.lote }, { idDepProv: req.params.id }, { '$DepositoProvincial.provincia$': req.session.provincia }, { descartado: false }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/formEnviar", { title: "Distribucion Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, traslado: result, centros: centros });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviarProv = async function (req, res) {
    const textoC = req.body.idCentro;
    const partesC = textoC.split('-');
    var depoC = partesC[0].trim();

    const textoP = req.body.idDepProv;
    const partesP = textoP.split('-');
    var depoP = partesP[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();
    var loteP = await LoteProveedor.findByPk(lote);

    var traslado = await DistribucionDeposito.findByPk(req.params.id);
    const cantidad = parseInt(traslado.cantidadDeVacunas);
    const fechaVen = moment(loteP.fechaDeVencimiento).format('L');
    const fechallegadaDep = moment(traslado.fechaLlegadaDepProv).format('L');
    const fechaSalida = moment(req.body.fechaDeSalidaDepProv).format('L');

    try {
        if (req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" && req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentro != null || req.body.idCentro != "" && req.body.fechaDeSalidaDepProv != null || req.body.fechaDeSalidaDepProv != "") {
            if (fechaSalida < fechallegadaDep || fechaSalida > fechaVen) {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
            } else {
                if (req.body.cantidadDeVacunas > cantidad) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
                } else {
                    DistribucionCentro.create({ idCentro: depoC, idDepProv: depoP, nroLote: lote, cantidadDeVacunas: req.body.cantidadDeVacunas, fechaDeSalidaDepProv: req.body.fechaDeSalidaDepProv, fechaLlegadaCentro: null, descartado: false })
                        .then((result) => {
                            const numero2 = parseInt(req.body.cantidadDeVacunas);
                            const cant = cantidad - numero2;
                            DistribucionDeposito.update({ cantidadDeVacunas: cant }, { where: { idDisDep: traslado.idDisDep } })
                                .then((respu) => {
                                    res.redirect("/distribucion/distribucionDepoPro");
                                })
                                .catch((err) => res.render("error", { error: err }));
                        })
                        .catch((err) => res.render("error", { error: err }));
                }
            }
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos incompletos o invalidos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.solicitudesDepoPro = function (req, res) {
    DistribucionCentro.findAll({ include: [{ model: CentroDeVacunacion, as: 'DistribucionCentroVac' }, { model: DepositoProvincial }, { model: LoteProveedor }], where: [{ '$DistribucionCentroVac.provincia$': req.session.provincia }, { fechaDeSalidaDepProv: null }, { fechaLlegadaCentro: null }, { idDepProv: { [Op.in]: req.session.trabaja } }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/solicitudes", { title: "Solicitudes Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, solicitudes: result });
        })
        .catch((err) => res.render("error", { error: err }))
};

exports.enviarSolicitudRequeridaDepoPro = function (req, res) {
    if (req.body.fechaDeSalidaDepProv) {
        DistribucionCentro.update({ fechaDeSalidaDepProv: req.body.fechaDeSalidaDepProv }, { where: { idDisCentro: req.params.id } })
            .then((result) => {
                console.log(result[0] == 1);
                if (result[0] == 1) {
                    res.redirect("/distribucion/distribucionDepoPro");
                }
            })
            .catch((err) => res.render("error", { error: err }))
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos incompletos o invalidos." } });
    }
};

exports.formSolicitudEnviarDepoPro = async function (req, res) {
    await DistribucionCentro.findByPk(req.params.id, { include: [{ model: CentroDeVacunacion, as: 'DistribucionCentroVac' }, { model: DepositoProvincial }, { model: LoteProveedor }] })
        .then(async (result) => {
            const distribucionDeposito = await DistribucionDeposito.findOne({ include: [{ model: DepositoNacional }, { model: DepositoProvincial }, { model: LoteProveedor }], where: [{ '$DepositoProvincial.idDepProv$': result.idDepProv }, { '$DepositoProvincial.provincia$': req.session.provincia }, { '$LoteProveedor.nroLote$': result.nroLote }] })
            console.log(distribucionDeposito);
            res.render("distribucion/depositoProvincialDis/enviarVacunasSolicitadas", { title: "Enviar Vacunas Solicitadas", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, solicitud: result, fecha: distribucionDeposito });
        })
        .catch((err) => res.render("error", { error: err }))
};

exports.listaSolicitudesDepProv = async function (req, res) {
    DistribucionDeposito.findAll({ include: [{ model: DepositoProvincial }, { model: DepositoNacional }, { model: LoteProveedor }], where: [{ idDepProv: { [Op.in]: req.session.trabaja } }, { fechaDeSalidaDepNac: null }, { fechaLlegadaDepProv: null }] })
        .then(async (result) => {
            res.render("distribucion/depositoProvincialDis/listaSolicitudes", { title: "Lista Solicitudes", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, solicitudes: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.obtenerIngresoDepoPro = function (req, res) {
    DistribucionDeposito.findByPk(req.params.id, { include: [{ model: LoteProveedor }, { model: DepositoNacional }, { model: DepositoProvincial }] })
        .then(async (result) => {
            res.render("distribucion/depositoProvincialDis/registrarIngreso", { title: "Enviar Vacunas", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ingreso: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.registrarIngresoDepoPro = function (req, res) {
    if (req.body.fechaLlegadaDepProv != "" || req.body.fechaLlegadaDepProv != null) {
        DistribucionDeposito.update({ fechaLlegadaDepProv: req.body.fechaLlegadaDepProv }, { where: { idDisDep: req.params.id } })
            .then(async (result) => {
                res.redirect("/distribucion/distribucionDepoPro");
            })
            .catch((err) => res.render("error", { error: err }));
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos incompletos o invalidos." } });
    }
};


exports.listarDistribucionDepoPro = async function (req, res) {
    if (req.session.rol == "Administrador") {
        DistribucionDeposito.findAll({ include: [{ model: DepositoNacional }, { model: DepositoProvincial }, { model: LoteProveedor }] })
            .then((result) => {
                res.render("distribucion/depositoProvincialDis/listarDis", { title: "Distribucion Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeDistribucion: result });
            })
            .catch((err) => res.render("error", { error: err }));
    } else {
        DistribucionDeposito.findAll({ include: [{ model: DepositoNacional }, { model: DepositoProvincial }, { model: LoteProveedor }], where: [{ descartado: false }, { fechaDeSalidaDepNac: { [Op.not]: null } }, { fechaLlegadaDepProv: { [Op.not]: null } }, { '$DepositoProvincial.provincia$': req.session.provincia }, { idDepProv: { [Op.in]: req.session.trabaja } }] })
            .then((result) => {
                res.render("distribucion/depositoProvincialDis/listarDis", { title: "Distribucion Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeDistribucion: result });
            })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.listarLotesDepoPro = async function (req, res) {
    const depoNac = await DepositoNacional.findOne({ where: { provincia: req.session.provincia } });
    TrasladoDeposito.findAll({ include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }] }, { model: DepositoNacional }], where: [{ cantidadDeVacunas: { [Op.gt]: 0 } }, { idDepNac: depoNac.idDepNac }, { '$LoteProveedor.vencidas$': false }, { fechaDeAdquisicion: { [Op.not]: null } }, { descartado: false }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/listarDepNac", { title: "Solicitar Vacunas", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaDepositos: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.crearDistribucionDepoPro = async function (req, res) {
    const depositosProv = await DepositoProvincial.findAll({ where: { idDepProv: { [Op.in]: req.session.trabaja } } });
    const depoNac = await DepositoNacional.findByPk(req.params.id);
    const tras = await TrasladoDeposito.findOne({ include: [{ model: LoteProveedor }, { model: DepositoNacional }], where: [{ nroLote: req.params.lote }, { idDepNac: depoNac.idDepNac }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { descartado: false }] })
    res.render("distribucion/depositoProvincialDis/solicitar", { title: "Solicitar Vacunas", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, distri: tras, depositos: depositosProv });
};

exports.altaDistribucionDepoPro = async function (req, res) {

    const textoP = req.body.idDepProv;
    const partesP = textoP.split('-');
    var depoP = partesP[0].trim();

    const textoN = req.body.idDepNac;
    const partesN = textoN.split('-');
    var depoN = partesN[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    var traslado = await TrasladoDeposito.findByPk(req.params.id);
    try {
        if (req.body.cantidadDeVacunas <= traslado.cantidadDeVacunas) {
            DistribucionDeposito.create({ idDepNac: depoN, nroLote: lote, cantidadDeVacunas: req.body.cantidadDeVacunas, idDepProv: depoP, fechaDeSalidaDepNac: null, fechaLlegadaDepProv: null, descartado: false })
                .then((result) => {
                    let total = traslado.cantidadDeVacunas - req.body.cantidadDeVacunas;
                    TrasladoDeposito.update({ cantidadDeVacunas: total }, { where: { idTrasladoDep: req.params.id } })
                        .then((resultado) => {
                            res.redirect("/distribucion/distribucionDepoPro");
                        })
                        .catch((err) => res.render("error", { error: err }));
                })
                .catch((err) => res.render("error", { error: err }));
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos incorrectos o incompletos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.consultarDistribucionDepoPro = function (req, res) {
    DistribucionDeposito.findByPk(req.params.id, { include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }, { model: DepositoProvincial }, { model: DepositoNacional }] })
        .then((result) => {
            res.render("distribucion/depositoProvincialDis/consultar", { title: "Distribucion Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, distri: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

//CENTRO DE VACUNACION
exports.listarDistribucionCentroVac = async function (req, res) {
    if (req.session.rol == "Administrador") {
        DistribucionCentro.findAll({ include: [{ model: CentroDeVacunacion, as: 'DistribucionCentroVac' }, { model: DepositoProvincial }, { model: LoteProveedor }] })
            .then((result) => {
                res.render("distribucion/centroVacunacionDis/listarDis", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, provincia: req.session.provincia, listaDeDistribucion: result });
            })
            .catch((err) => res.render("error", { error: err }));
    } else {
        DistribucionCentro.findAll({ include: [{ model: CentroDeVacunacion, as: 'DistribucionCentroVac' }, { model: DepositoProvincial }, { model: LoteProveedor }], where: [{ descartado: false }, { '$DistribucionCentroVac.provincia$': req.session.provincia }, { fechaLlegadaCentro: { [Op.not]: null } }, { '$DistribucionCentroVac.idCentro$': { [Op.in]: req.session.trabaja } }] })
            .then((result) => {
                res.render("distribucion/centroVacunacionDis/listarDis", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, provincia: req.session.provincia, listaDeDistribucion: result });
            })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.listarDepProCentro = async function (req, res) {
    DistribucionDeposito.findAll({ include: [{ model: DepositoProvincial }, { model: LoteProveedor }], where: [{ descartado: false }, { '$LoteProveedor.vencidas$': false }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { fechaLlegadaDepProv: { [Op.not]: null } }, { '$DepositoProvincial.provincia$': req.session.provincia }], group: 'idDepProv' })
        .then((result) => {
            res.render("distribucion/centroVacunacionDis/listarDepositosPro", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeDepositos: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.listarLotesCentro = async function (req, res) {
    DistribucionDeposito.findAll({ attributes: [[Sequelize.fn('sum', Sequelize.col('DistribucionDeposito.cantidadDeVacunas')), 'cantidadTotalVacunas']], include: [{ model: DepositoProvincial }, { model: LoteProveedor, include: [{ model: TipoVacuna }], attributes: ['nombreComercial', 'nroLote'] }], where: [{ idDepProv: req.params.id }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }, { fechaLlegadaDepProv: { [Op.not]: null } }, { descartado: false }], group: 'DistribucionDeposito.nroLote' })
        .then((result) => {
            res.render("distribucion/centroVacunacionDis/listarLotes", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeLotes: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.crearDistribucionCentroVac = async function (req, res) {
    const centros = await CentroDeVacunacion.findAll({ where: { idCentro: { [Op.in]: req.session.trabaja } } });
    const dist = await DistribucionDeposito.findOne({ include: [{ model: LoteProveedor }, { model: DepositoProvincial }], where: [{ nroLote: req.params.lote }, { idDepProv: req.params.id }, { '$LoteProveedor.vencidas$': false }, { descartado: false }, { cantidadDeVacunas: { [Op.gt]: 0 } }] })
    const resultado = await DistribucionDeposito.findAll({ attributes: [[Sequelize.fn('sum', Sequelize.col('DistribucionDeposito.cantidadDeVacunas')), 'cantidadTotalVacunas']], include: { model: LoteProveedor }, where: [{ nroLote: req.params.lote }, { idDepProv: req.params.id }, { descartado: false }, { '$LoteProveedor.vencidas$': false }, { cantidadDeVacunas: { [Op.gt]: 0 } }], raw: true });
    const cantidadTotalVacunas = resultado[0].cantidadTotalVacunas || 0;
    res.render("distribucion/centroVacunacionDis/distribuir", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, centros: centros, distri: dist, cantidad: cantidadTotalVacunas });
};

exports.altaDistribucionCentroVac = async function (req, res) {
    const textoDep = req.body.idDepProv;
    const partesD = textoDep.split('-');
    var depo = partesD[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoCentro = req.body.idCentro;
    const partesC = textoCentro.split('-');
    var cen = partesC[0].trim();

    const resultado = await DistribucionDeposito.findAll({ attributes: [[Sequelize.fn('sum', Sequelize.col('DistribucionDeposito.cantidadDeVacunas')), 'cantidadTotalVacunas']], include: { model: LoteProveedor }, where: [{ nroLote: lote }, { idDepProv: depo }, { descartado: false }, { '$LoteProveedor.vencidas$': false }, { cantidadDeVacunas: { [Op.gt]: 0 } }], raw: true });
    const cantidadTotalVacunas = resultado[0].cantidadTotalVacunas || 0;
    try {
        if (req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" && req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentro != null || req.body.idCentro != "") {
            if (parseInt(req.body.cantidadDeVacunas) > parseInt(cantidadTotalVacunas)) {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
            } else {
                DistribucionCentro.create({ idDepProv: depo, nroLote: lote, cantidadDeVacunas: req.body.cantidadDeVacunas, idCentro: cen, fechaDeSalidaDepProv: null, fechaLlegadaCentro: null, descartado: false })
                    .then(async (result) => {
                        let cantidadRestante = parseInt(req.body.cantidadDeVacunas);

                        const distribuciones = await DistribucionDeposito.findAll({ include: { model: LoteProveedor }, where: [{ nroLote: lote }, { idDepProv: depo }, { descartado: false }, { '$LoteProveedor.vencidas$': false }, { cantidadDeVacunas: { [Op.gt]: 0 } }], order: [['fechaLlegadaDepProv', 'ASC']] });
                        for (let distribucion of distribuciones) {
                            if (cantidadRestante <= 0) break;

                            const cantidadDisponible = distribucion.cantidadDeVacunas;

                            if (cantidadDisponible <= cantidadRestante) {
                                await distribucion.update({ cantidadDeVacunas: 0 });
                                cantidadRestante -= cantidadDisponible;
                            } else {
                                await distribucion.update({ cantidadDeVacunas: cantidadDisponible - cantidadRestante });
                                cantidadRestante = 0;
                            }
                        }
                        res.redirect("/distribucion/distribucionCentroVac");
                    })
                    .catch((err) => res.render("error", { error: err }));
            }
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.consultarDistribucionCentroVac = function (req, res) {
    DistribucionCentro.findByPk(req.params.id, { include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }, { model: DepositoProvincial }, { model: CentroDeVacunacion, as: 'DistribucionCentroVac' }] })
        .then((result) => {
            res.render("distribucion/centroVacunacionDis/consultar", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, distri: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.consultarEnvioCentro = function (req, res) {
    Traslado.findByPk(req.params.id, { include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }, { model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }] })
        .then((result) => {
            res.render("distribucion/centroVacunacionDis/consultarEnvio", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, distri: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.solicitudesCentro = function (req, res) {
    DistribucionCentro.findAll({ include: [{ model: LoteProveedor }, { model: DepositoProvincial }, { model: CentroDeVacunacion, as: 'DistribucionCentroVac' }], where: [{ fechaDeSalidaDepProv: null }, { fechaLlegadaCentro: null }, { idCentro: { [Op.in]: req.session.trabaja } }] })
        .then(async (result) => {
            res.render("distribucion/centroVacunacionDis/solicitudesEnProceso", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, solicitudes: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.obtenerListaIngresosCentro = function (req, res) {
    DistribucionCentro.findAll({ include: [{ model: LoteProveedor }, { model: DepositoProvincial }, { model: CentroDeVacunacion, as: 'DistribucionCentroVac' }], where: [{ fechaDeSalidaDepProv: { [Op.not]: null } }, { fechaLlegadaCentro: null }, { idCentro: { [Op.in]: req.session.trabaja } }] })
        .then(async (result) => {
            res.render("distribucion/centroVacunacionDis/ingresosEnProceso", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ingresos: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.obtenerIngresoCentro = function (req, res) {
    DistribucionCentro.findByPk(req.params.id, { include: [{ model: LoteProveedor }, { model: DepositoProvincial }, { model: CentroDeVacunacion, as: 'DistribucionCentroVac' }] })
        .then(async (result) => {
            res.render("distribucion/centroVacunacionDis/formIngreso", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ingreso: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.registrarIngresoCentro = function (req, res) {
    try {
        if (req.body.fechaLlegadaCentro != null || req.body.fechaLlegadaCentro != "") {
            DistribucionCentro.update({ fechaLlegadaCentro: req.body.fechaLlegadaCentro }, { where: { idDisCentro: req.params.id } })
                .then((result) => {
                    res.redirect("/distribucion/distribucionCentroVac");
                })
                .catch((err) => res.render("error", { error: err }));
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.registroDescartesCentro = async function (req, res) {
    const nroLote = await DistribucionCentro.findAll({ where: [{ idCentro: { [Op.in]: req.session.trabaja } }, { descartado: true }], attributes: ['nroLote'] });
    const listaDescarte = [];
    for (var i = 0; i < nroLote.length; i++) {
        listaDescarte.push(nroLote[i].nroLote);
    }
    if (listaDescarte == null || listaDescarte.length == 0) {
        res.render("distribucion/centroVacunacionDis/registroDescartes", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDescarte: [] });
    } else {
        Descarte.findAll({ include: [{ model: LoteProveedor }, { model: CentroDeVacunacion }], where: [{ nroLote: { [Op.in]: listaDescarte } }, { idCentro: { [Op.in]: req.session.trabaja } }] })
            .then((result) => {
                res.render("distribucion/centroVacunacionDis/registroDescartes", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDescarte: result });
            })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.registroEnviosCentro = function (req, res) {
    Traslado.findAll({ include: [{ model: LoteProveedor }, { model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }], where: [{ idCentroEnvia: { [Op.in]: req.session.trabaja } }, { fechaLlegada: { [Op.not]: null } }] })
        .then((result) => {
            res.render("distribucion/centroVacunacionDis/registroEnvios", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaEnvios: result });
        })
        .catch((err) => res.render("error", { error: err }));
};


//SOLO ADMIN
//DEPOSITO NACIONAL
exports.eliminarDistribucionDepoNac = function (req, res) {
    TrasladoDeposito.findByPk(req.params.id)
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Registro de Distribucion con esa informacion." } });
            } else {
                const distribuido = await DistribucionDeposito.findOne({ where: [{ nroLote: result.nroLote }, { idDepNac: result.idDepNac }] });
                if (distribuido == null) {
                    result.destroy();
                    res.status(200).json({ message: 'Registro borrado exitosamente.' });
                } else {
                    res.status(400).json({ message: 'No se puede eliminar porque ya se han enviado vacunas de este lote.' });
                }
            }
        })
        .catch((err) => res.render("error", { error: err }));
};

//DEPOSITO PROVINCIAL
exports.editarEnvio = async function (req, res) {
    const centros = await CentroDeVacunacion.findAll({ where: { provincia: req.session.provincia } });
    const descartadas = await Descarte.findAll({ attributes: ['nroLote'] });
    const listaDescarte = [];
    for (var i = 0; i < descartadas.length; i++) {
        listaDescarte.push(descartadas[i].nroLote);
    }
    await DistribucionCentro.findByPk(req.params.id, { include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }, { model: DepositoProvincial }, { model: CentroDeVacunacion }] })
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun registro de Distribucion hacia Deposito Provincial con esa informacion." } });
            }
            if (Object.values(listaDescarte).includes(result.nroLote)) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se puede editar Distribucion Provincial cuando vencio el Lote Proveedor." } });
            } else {
                await DistribucionDeposito.findOne({ include: LoteProveedor, where: [{ idDepProv: result.idDepProv }, { nroLote: result.nroLote }] })
                    .then((resultado) => {
                        if (resultado == null) {
                            res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun registro de Distribucion hacia Deposito Provincial con esa informacion." } });
                        }
                        res.render("distribucion/depositoProvincialDis/editarEnvio", { title: "Editar Envio", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, distri: result, centros: centros, cantidad: resultado });
                    })
                    .catch((err) => res.render("error", { error: err }));
            }
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.putEnvio = async function (req, res) {
    const textoC = req.body.idCentro;
    const partesC = textoC.split('-');
    var depoC = partesC[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoP = req.body.idDepProv;
    const partesP = textoP.split('-');
    var depoP = partesP[0].trim();

    var disDepD = await DistribucionDeposito.findOne({ include: { model: LoteProveedor }, where: [{ idDepProv: depoP }, { nroLote: lote }] });
    const cantidadDepD = parseInt(disDepD.cantidadDeVacunas);
    var disDepC = await DistribucionCentro.findByPk(req.params.id);
    const cantidadDepC = parseInt(disDepC.cantidadDeVacunas);
    const cantidadTotal = cantidadDepD + cantidadDepC;

    try {
        if (req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" && req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentro != null || req.body.idCentro != "" && req.body.fechaDeSalidaDepProv != null || req.body.fechaDeSalidaDepProv != "") {
            if (req.body.fechaDeSalidaDepProv > disDepD.fechaLlegadaDepProv || req.body.fechaDeSalidaDepNac > disDepD.LoteProveedor.fechaDeVencimiento) {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
            } else {
                if (req.body.cantidadDeVacunas > cantidadTotal) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
                } else {
                    await DistribucionCentro.update({ cantidadDeVacunas: req.body.cantidadDeVacunas, idCentro: depoC, fechaDeSalidaDepProv: req.body.fechaDeSalidaDepProv, fechaLlegadaCentro: null }, { where: { idDisCentro: req.params.id } });
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidadTotal - numero2;
                    await DistribucionDeposito.update({ cantidadDeVacunas: cant }, { where: { idDisDep: disDepD.idDisDep } })
                        .then((result) => {
                            if (result[0] == 1) {
                                res.redirect("/distribucion/distribucionDepoPro");
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                }
            }
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.editDistribucionDepoPro = async function (req, res) {
    const depos = await DepositoProvincial.findAll({ where: [{ provincia: req.session.provincia }, { idDepProv: { [Op.in]: req.session.trabaja } }] });
    const descartadas = await Descarte.findAll({ attributes: ['nroLote'] });
    const listaDescarte = [];
    for (var i = 0; i < descartadas.length; i++) {
        listaDescarte.push(descartadas[i].nroLote);
    }
    await DistribucionDeposito.findByPk(req.params.id, { include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }, { model: DepositoProvincial }, { model: DepositoNacional }] })
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No see encontro ningun registro de Distribucion hacia Deposito Provincial con esa informacion." } });
            }
            if (Object.values(listaDescarte).includes(result.nroLote)) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se puede editar Distribucion Provincial cuando vencio el Lote Proveedor." } });
            } else {
                TrasladoDeposito.findOne({ include: { model: LoteProveedor }, where: [{ idDepNac: result.idDepNac }, { nroLote: result.nroLote }] })
                    .then((resultado) => {
                        if (resultado == null) {
                            res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun registro de Distribucion hacia Deposito Provincial con esa informacion." } });
                        }
                        res.render("distribucion/depositoProvincialDis/editar", { title: "Distribucion Deposito Provincial", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, distri: result, depositos: depos, cantidad: resultado });
                    })
                    .catch((err) => res.render("error", { error: err }));
            }
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.putDistribucionDepoPro = async function (req, res) {
    const textoN = req.body.idDepNac;
    const partesN = textoN.split('-');
    var depoN = partesN[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoP = req.body.idDepProv;
    const partesP = textoP.split('-');
    var depoP = partesP[0].trim();

    var disDepN = await TrasladoDeposito.findOne({ where: [{ idDepNac: depoN }, { nroLote: lote }] });
    const cantidadDepN = parseInt(disDepN.cantidadDeVacunas);
    var disDepP = await DistribucionDeposito.findByPk(req.params.id);
    const cantidadDepP = parseInt(disDepP.cantidadDeVacunas);
    const cantidadTotal = cantidadDepN + cantidadDepP;

    try {
        if (req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" && req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idDepNac != null || req.body.idDepNac != "" && req.body.fechaDeSalidaDepNac != null || req.body.fechaDeSalidaDepNac != "") {
            if (req.body.fechaLlegadaDepProv) {
                if (req.body.fechaDeSalidaDepNac > req.body.fechaLlegadaDepProv || req.body.fechaDeSalidaDepNac < disDepN.fechaDeAdquisicion) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
                } else {
                    if (req.body.cantidadDeVacunas > cantidadTotal) {
                        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
                    } else {
                        await DistribucionDeposito.update({ idDepNac: depoN, nroLote: lote, cantidadDeVacunas: req.body.cantidadDeVacunas, idDepProv: depoP, fechaDeSalidaDepNac: req.body.fechaDeSalidaDepNac, fechaLlegadaDepProv: req.body.fechaLlegadaDepProv }, { where: { idDisDep: req.params.id } });
                        const numero2 = parseInt(req.body.cantidadDeVacunas);
                        const cant = cantidadTotal - numero2;
                        await TrasladoDeposito.update({ idTrasladoDep: disDepN.idTrasladoDep, nroLote: disDepN.nroLote, cantidadDeVacunas: cant, idDepNac: disDepN.idDepNac, fechaDeAdquisicion: disDepN.fechaDeAdquisicion }, { where: { idTrasladoDep: disDepN.idTrasladoDep } })
                            .then((result) => {
                                if (result[0] == 1) {
                                    res.redirect("/distribucion/distribucionDepoPro");
                                }
                            })
                            .catch((err) => res.render("error", { error: err }));
                    }
                }
            } else {
                if (req.body.fechaDeSalidaDepNac < disDepN.fechaDeAdquisicion) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
                } else {
                    if (req.body.cantidadDeVacunas > cantidadTotal) {
                        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
                    } else {
                        await DistribucionDeposito.update({ idDepNac: depoN, nroLote: lote, cantidadDeVacunas: req.body.cantidadDeVacunas, idDepProv: depoP, fechaDeSalidaDepNac: req.body.fechaDeSalidaDepNac, fechaLlegadaDepProv: null }, { where: { idDisDep: req.params.id } });
                        const numero2 = parseInt(req.body.cantidadDeVacunas);
                        const cant = cantidadTotal - numero2;
                        await TrasladoDeposito.update({ idTrasladoDep: disDepN.idTrasladoDep, nroLote: disDepN.nroLote, cantidadDeVacunas: cant, idDepNac: disDepN.idDepNac, fechaDeAdquisicion: disDepN.fechaDeAdquisicion }, { where: { idTrasladoDep: disDepN.idTrasladoDep } })
                            .then((result) => {
                                if (result[0] == 1) {
                                    res.redirect("/distribucion/distribucionDepoPro");
                                }
                            })
                            .catch((err) => res.render("error", { error: err }));
                    }
                }
            }

        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.eliminarDistribucionDepoPro = function (req, res) {
    DistribucionDeposito.findByPk(req.params.id)
        .then(async (result) => {
            console.log(result.fechaDeSalidaDepNac == null);
            console.log(result.fechaDeSalidaDepNac == null);
            /*if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Registro de Distribucion con esa informacion." } });
            } else if (result.fechaDeSalidaDepNac == null && result.fechaLlegadaCentro == null) {
                res.status(400).json({ message: 'No se puede borrar.' });
            } else {
                result.destroy();
                res.status(200).json({ message: 'Registro borrado exitosamente.' });
            }*/
        })
        .catch((err) => res.render("error", { error: err }));
};

//CENTRO DE VACUNACION
exports.editDistribucionCentroVac = async function (req, res) {
    const centros = await CentroDeVacunacion.findAll({ where: { provincia: req.session.provincia } });
    const descartadas = await Descarte.findAll({ attributes: ['nroLote'] });
    const listaDescarte = [];
    for (var i = 0; i < descartadas.length; i++) {
        listaDescarte.push(descartadas[i].nroLote);
    }
    await DistribucionCentro.findByPk(req.params.id, { include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }, { model: DepositoProvincial }, { model: CentroDeVacunacion, as: 'DistribucionCentroVac' }] })
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun registro de Distribucion hacia Centro de Vacunacion con esa informacion." } });
            }
            if (Object.values(listaDescarte).includes(result.nroLote)) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se puede editar Distribucion Centro de Vacunacion cuando vencio el Lote Proveedor." } });
            } else {
                var ress = await DistribucionDeposito.findOne({ include: LoteProveedor, where: [{ idDepProv: result.idDepProv }, { nroLote: result.nroLote }] });
                res.render("distribucion/centroVacunacionDis/editar", { title: "Distribucion Centro Vacunacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, distri: result, centros: centros, cantidad: ress });
            }
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.putDistribucionCentroVac = async function (req, res) {
    const textoDep = req.body.idDepProv;
    const partesD = textoDep.split('-');
    var depo = partesD[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoCentro = req.body.idCentro;
    const partesC = textoCentro.split('-');
    var cen = partesC[0].trim();

    var disDep = await DistribucionDeposito.findOne({ where: [{ idDepProv: depo }, { nroLote: lote }] });
    const cantidadDep = parseInt(disDep.cantidadDeVacunas);
    var disCen = await DistribucionCentro.findByPk(req.params.id);
    const cantidadCen = parseInt(disCen.cantidadDeVacunas);
    const cantidadTotal = cantidadDep + cantidadCen;

    try {
        if (req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" && req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentro != null || req.body.idCentro != "" && req.body.fechaDeSalidaDepProv != null || req.body.fechaDeSalidaDepProv != "" && req.body.fechaLlegadaCentro != null || req.body.fechaLlegadaCentro != "") {
            if (req.body.fechaDeSalidaDepProv > req.body.fechaLlegadaCentro || req.body.fechaDeSalidaDepProv < disDep.fechaLlegadaDepProv) {
                console.log("entro error 1");
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
            } else {
                if (req.body.cantidadDeVacunas > cantidadTotal) {
                    console.log("entro error 2");
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
                } else {
                    await DistribucionCentro.update({ idDepProv: depo, nroLote: lote, cantidadDeVacunas: req.body.cantidadDeVacunas, idCentro: cen, fechaDeSalidaDepProv: req.body.fechaDeSalidaDepProv, fechaLlegadaCentro: req.body.fechaLlegadaCentro }, { where: { idDisCentro: req.params.id } });
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidadTotal - numero2;
                    await DistribucionDeposito.update({ idDisDep: req.body.idDisDep, nroLote: disDep.nroLote, cantidadDeVacunas: cant, idDepNac: disDep.idDepNac, fechaDeSalidaDepNac: disDep.fechaDeSalidaDepNac, idDepProv: disDep.idDepProv, fechaLlegadaDepProv: disDep.fechaLlegadaDepProv }, { where: { idDisDep: disDep.idDisDep } })
                        .then((result) => {
                            if (result[0] == 1) {
                                res.redirect("/distribucion/distribucionCentroVac");
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                }
            }
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.eliminarDistribucionCentroVac = function (req, res) {
    DistribucionCentro.findByPk(req.params.id)
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Registro de Distribucion con esa informacion." } });
            }
            result.destroy();
            res.status(200).json({ message: 'Registro borrado exitosamente.' });
        })
        .catch((err) => res.render("error", { error: err }));
};