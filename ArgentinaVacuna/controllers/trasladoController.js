const { Traslado, CentroDeVacunacion, Descarte, DistribucionCentro, LoteProveedor, TipoVacuna, Laboratorio } = require("../models");
const { Sequelize, Op, fn, col, literal } = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");

const sequelize = new Sequelize('vacunatorio', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

exports.listarCentros = async function (req, res) {
    if (req.session.trabaja.length === 1) {
        CentroDeVacunacion.findAll({ where: [{ provincia: req.session.provincia }, { idCentro: { [Op.notIn]: req.session.trabaja } }] })
            .then((centros) => {
                res.render("traslado/ListarCentros", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeCentros: centros });
            })
            .catch((err) => res.render("error", { error: err }));
    } else {
        CentroDeVacunacion.findAll({ where: { provincia: req.session.provincia } })
            .then((centros) => {
                res.render("traslado/ListarCentros", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeCentros: centros });
            })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.listarLotes = async function (req, res) {
    const centroPrincipal = await CentroDeVacunacion.findByPk(req.params.id);
    LoteProveedor.findAll({
        attributes: [
            'nombreComercial',
            'nroLote',
            'DistribucionCentros.idDisCentro',
            'Traslados.idTraslado',
            'TipoVacuna.nombre',
            [Sequelize.literal('COALESCE(SUM(`DistribucionCentros`.`cantidadDeVacunas`), 0) + COALESCE(SUM(`Traslados`.`cantidadDeVacunas`), 0)'), 'cantidad_total']
        ],
        include: [
            {
                model: TipoVacuna,
                attributes: ['nombre'],
                required: true
            },
            {
                model: DistribucionCentro,
                include: [{ model: CentroDeVacunacion, as: 'DistribucionCentroVac', attributes: ['nombre'], required: false }],
                attributes: ['idDisCentro', 'idCentro', 'descartado'],
                required: false,
                where: [{ idCentro: { [Op.in]: req.session.trabaja } }, { descartado: false }, { fechaLlegadaCentro: { [Op.not]: null } }]
            },
            {
                model: Traslado,
                include: [{ model: CentroDeVacunacion, as: 'centroRecibe', attributes: ['nombre'], required: false }],
                attributes: ['idTraslado', 'idCentroRecibe'],
                required: false,
                where: [{ idCentroRecibe: { [Op.in]: req.session.trabaja } }, { descartado: false }, { fechaLlegada: { [Op.not]: null } }]
            }
        ],
        where: [{ vencidas: false }],
        group: ['LoteProveedor.nombreComercial', 'LoteProveedor.nroLote'],
        having: literal('cantidad_total > 0'),
        order: [[literal('cantidad_total'), 'DESC']]
    })
        .then((result) => {
            if (result == null || result.length === 0) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No hay vacunas disponibles en el Centro de Vacunacion." } });
            } else {
                res.render("traslado/ListarLotes", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeLotes: result, centroPrincipal: centroPrincipal });
            }
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.consultarTraslados = async function (req, res) {
    Traslado.findByPk(req.params.id, { include: [{ model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }, { model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }] })
        .then((result) => {
            res.render("traslado/consultar", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, traslado: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.crear = async function (req, res) {
    const centros = await CentroDeVacunacion.findAll({ where: { idCentro: { [Op.in]: req.session.trabaja } } });
    LoteProveedor.findAll({
        attributes: [
            'nombreComercial',
            'nroLote',
            'DistribucionCentros.idDisCentro',
            'Traslados.idTraslado',
            'Traslados.idTraslado',
            'TipoVacuna.nombre',
            [Sequelize.literal('COALESCE(SUM(`DistribucionCentros`.`cantidadDeVacunas`), 0) + COALESCE(SUM(`Traslados`.`cantidadDeVacunas`), 0)'), 'cantidad_total']
        ],
        include: [
            {
                model: TipoVacuna,
                attributes: ['nombre'],
                required: true
            },
            {
                model: DistribucionCentro,
                include: [{ model: CentroDeVacunacion, as: 'DistribucionCentroVac', attributes: ['nombre'], required: false }],
                attributes: ['idDisCentro', 'idCentro', 'descartado'],
                required: false,
                where: [{ idCentro: { [Op.in]: req.session.trabaja } }, { descartado: false }, { fechaLlegadaCentro: { [Op.not]: null } }]
            },
            {
                model: Traslado,
                include: [{ model: CentroDeVacunacion, as: 'centroRecibe', attributes: ['nombre'], required: false }],
                attributes: ['idTraslado', 'idCentroRecibe'],
                required: false,
                where: [{ idCentroRecibe: { [Op.in]: req.session.trabaja } }, { descartado: false }, { fechaLlegada: { [Op.not]: null } }]
            }
        ],
        where: [{ vencidas: false }, { nroLote: req.params.id }],
        group: ['LoteProveedor.nombreComercial', 'LoteProveedor.nroLote'],
        having: literal('cantidad_total > 0'),
        order: [[literal('cantidad_total'), 'DESC']]
    })
        .then((result) => {
            console.log(result)
            res.render("traslado/trasladar", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, centros: centros, distri: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.alta = async function (req, res) {
    const textoCentro = req.body.idCentroEnvia;
    const partesC = textoCentro.split('-');
    var centro = partesC[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoCe = req.body.idCentroRecibe;
    const partesCe = textoCe.split('-');
    var cen = partesCe[0].trim();

    const cantidadAEnviar = parseInt(req.body.cantidadDeVacunas, 10);
    try {
        const transaction = await sequelize.transaction();
        const distribuciones = await DistribucionCentro.findAll({
            where: [{ nroLote: lote }, { idCentro: centro }, { descartado: false }, { fechaLlegadaCentro: { [Op.not]: null } }],
            order: [['cantidadDeVacunas', 'DESC']],
            transaction
        });

        let cantidadRestante = cantidadAEnviar;

        for (const distribucion of distribuciones) {
            if (cantidadRestante <= 0) break;
            if (distribucion.cantidadDeVacunas >= cantidadRestante) {
                distribucion.cantidadDeVacunas -= cantidadRestante;
                await distribucion.save({ transaction });
                cantidadRestante = 0;
            } else {
                cantidadRestante -= distribucion.cantidadDeVacunas;
                distribucion.cantidadDeVacunas = 0;
                await distribucion.save({ transaction });
            }
        }

        if (cantidadRestante > 0) {
            const traslados = await Traslado.findAll({
                where: [{ nroLote: lote }, { idCentroRecibe: centro }, { descartado: false }, { fechaLlegada: { [Op.not]: null } }],
                order: [['cantidadDeVacunas', 'DESC']],
                transaction
            });

            for (const traslado of traslados) {
                if (cantidadRestante <= 0) break;
                if (traslado.cantidadDeVacunas >= cantidadRestante) {
                    traslado.cantidadDeVacunas -= cantidadRestante;
                    await traslado.save({ transaction });
                    cantidadRestante = 0;
                } else {
                    cantidadRestante -= traslado.cantidadDeVacunas;
                    traslado.cantidadDeVacunas = 0;
                    await traslado.save({ transaction });
                }
            }
        }
        Traslado.create({ idCentroEnvia: centro, nroLote: lote, cantidadDeVacunas: cantidadAEnviar, idCentroRecibe: cen, fechaSalida: null, fechaLlegada: null, descartado: false })
            .then(async (respu) => {
                if (respu) {
                    await transaction.commit();
                    res.redirect("/traslado");
                } else {
                    res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "No se pudo realizar el traslado." } });
                }
            })
            .catch((err) => res.render("error", { error: err }));

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error al enviar vacunas:', error);
        res.status(500).send('Error al enviar vacunas');
    }
};

exports.listarTraslados = async function (req, res) {
    if (req.session.rol == "Administrador") {
        Traslado.findAll({ include: [{ model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }, { model: LoteProveedor }] })
            .then((result) => {
                res.render("traslado/listar", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaTraslados: result });
            })
            .catch((err) => res.render("error", { error: err }));
    } else {
        Traslado.findAll({ include: [{ model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }, { model: LoteProveedor }], where: [{ [Op.or]: [{ '$centroEnvia.idCentro$': { [Op.in]: req.session.trabaja } }, { '$centroRecibe.idCentro$': { [Op.in]: req.session.trabaja } }] }, { descartado: false }, { fechaLlegada: { [Op.not]: null } }] })
            .then((result) => {
                res.render("traslado/listar", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaTraslados: result });
            })
            .catch((err) => res.render("error", { error: err }));
    }

};

exports.listarTrasladosEnProceso = async function (req, res) {
    Traslado.findAll({ include: [{ model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }, { model: LoteProveedor }], where: [{ fechaLlegada: null }, { fechaSalida: { [Op.not]: null } }, { idCentroRecibe: { [Op.in]: req.session.trabaja } }] })
        .then((result) => {
            res.render("traslado/listarTrasladoEnProceso", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, ListaTraslados: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.listarSolicitudes = async function (req, res) {
    Traslado.findAll({ include: [{ model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }, { model: LoteProveedor }], where: [{ fechaLlegada: null }, { fechaSalida: null }, { '$centroEnvia.idCentro$': { [Op.in]: req.session.trabaja } }] })
        .then((result) => {
            res.render("traslado/listarSolicitudesRecibidas", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, solicitudes: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.listarSolicitudesPendientes = async function (req, res) {
    Traslado.findAll({ include: [{ model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }, { model: LoteProveedor }], where: [{ fechaLlegada: null }, { fechaSalida: null }, { '$centroRecibe.idCentro$': { [Op.in]: req.session.trabaja } }] })
        .then((result) => {
            res.render("traslado/listarSolicitudesEnviadas", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, solicitudes: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.formEnviar = async function (req, res) {
    Traslado.findByPk(req.params.id, { include: [{ model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }, { model: LoteProveedor }] })
        .then((result) => {
            res.render("traslado/formEnviar", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, traslado: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.enviar = async function (req, res) {
    if (req.body.fechaSalida != null || req.body.fechaSalida != "") {
        Traslado.update({ fechaSalida: req.body.fechaSalida }, { where: { idTraslado: req.params.id } })
            .then((result) => {
                res.redirect("/traslado");
            })
            .catch((err) => res.render("error", { error: err }));
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fecha de salida incompleta o incorrecta." } });
    }
};

exports.formRecibir = async function (req, res) {
    Traslado.findByPk(req.params.id, { include: [{ model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }, { model: LoteProveedor }] })
        .then((result) => {
            res.render("traslado/formRecibir", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, traslado: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.recibir = async function (req, res) {
    if (req.body.fechaLlegada != null || req.body.fechaLlegada != "") {
        Traslado.update({ fechaLlegada: req.body.fechaLlegada }, { where: { idTraslado: req.params.id } })
            .then((result) => {
                res.redirect("/traslado");
            })
            .catch((err) => res.render("error", { error: err }));
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fecha de salida incompleta o incorrecta." } });
    }
};

exports.registroDescartes = async function (req, res) {
    const nroLote = await DistribucionCentro.findAll({ where: [{ idCentro: { [Op.in]: req.session.trabaja } }, { descartado: true }], attributes: ['nroLote'] });
    const listaDescarte = [];
    for (var i = 0; i < nroLote.length; i++) {
        listaDescarte.push(nroLote[i].nroLote);
    }
    if (listaDescarte == null || listaDescarte.length == 0) {
        res.render("distribucion/traslado/registroDescartes", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDescarte: [] });
    } else {
        Descarte.findAll({ include: [{ model: LoteProveedor }, { model: CentroDeVacunacion }], where: [{ nroLote: { [Op.in]: listaDescarte } }, { idCentro: { [Op.in]: req.session.trabaja } }] })
            .then((result) => {
                res.render("traslado/registroDescartes", { title: "Registro de Envios", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDescarte: result });
            })
            .catch((err) => res.render("error", { error: err }));
    }
};

//SOLO ADMINISTRADOR
exports.editTraslado = async function (req, res) {
    Traslado.findByPk(req.params.id, { include: [{ model: LoteProveedor }, { model: CentroDeVacunacion, as: 'centroEnvia' }, { model: CentroDeVacunacion, as: 'centroRecibe' }] })
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Agente de Salud con esa informacion." } });
            } else {
                const centros = await CentroDeVacunacion.findAll({ where: [{ idCentro: { [Op.not]: result.idCentroEnvia } }, { provincia: req.session.provincia }] });
                const ress = await DistribucionCentro.findOne({ include: LoteProveedor, where: [{ idCentro: result.idCentroEnvia }, { nroLote: result.nroLote }] });
                res.render("traslado/editar", { title: "Traslado", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, tras: result, centros: centros, cantidad: ress });
            }
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.putTraslado = async function (req, res) {
    const textoCentro = req.body.idCentroEnvia;
    const partesC = textoCentro.split('-');
    var centro = partesC[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoCe = req.body.idCentroRecibe;
    const partesCe = textoCe.split('-');
    var cen = partesCe[0].trim();

    var dis = await DistribucionCentro.findOne({ where: [{ idCentro: centro }, { nroLote: lote }] });
    const cantidad = parseInt(dis.cantidadDeVacunas);
    var disT = await Traslado.findByPk(req.params.id);
    const cantidadT = parseInt(disT.cantidadDeVacunas);
    const cantidadTotal = cantidad + cantidadT;
    try {
        if (req.body.idCentroEnvia != null || req.body.idCentroEnvia != "" && req.body.nroLote != null || req.body.nroLote != "" && req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentroRecibe != null || req.body.idCentroRecibe != "") {
            const fechaDis = moment(dis.fechaLlegadaCentro).format('L');
            if (req.body.fechaSalida && req.body.fechaLlegada) {
                const fechaSalida = moment(req.body.fechaSalida).format('L');
                const fechaLlegada = moment(req.body.fechaLlegada).format('L');

                if (fechaSalida > fechaLlegada || fechaSalida < fechaDis) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
                } else {
                    if (req.body.cantidadDeVacunas > cantidadTotal) {
                        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
                    } else {
                        Traslado.update({ idCentroEnvia: centro, nroLote: lote, cantidadDeVacunas: req.body.cantidadDeVacunas, idCentroRecibe: cen, fechaSalida: req.body.fechaSalida, fechaLlegada: req.body.fechaLlegada }, { where: { idTraslado: req.params.id } });
                        const numero2 = parseInt(req.body.cantidadDeVacunas);
                        const cant = cantidadTotal - numero2;
                        await DistribucionCentro.update({ idDisCentro: dis.idDisCentro, nroLote: dis.nroLote, cantidadDeVacunas: cant, idDepPro: dis.idDepPro, fechaDeSalidaDepPro: dis.fechaDeSalidaDepPro, idCentro: dis.idCentro, fechaLlegadaCentro: dis.fechaLlegadaCentro }, { where: { idDisCentro: dis.idDisCentro } })
                            .then((respu) => {
                                res.redirect("/traslado");
                            })
                            .catch((err) => res.render("error", { error: err }));
                    }
                }
            } else if (req.body.fechaSalida && !req.body.fechaLlegada) {
                const fechaSalida = moment(req.body.fechaSalida).format('L');

                if (fechaSalida < fechaDis) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Fechas ingresadas son invalidas." } });
                } else {
                    if (req.body.cantidadDeVacunas > cantidadTotal) {
                        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Las Cantidad de Vacunas ingresadas no son invalidas." } });
                    } else {
                        Traslado.update({ idCentroEnvia: centro, nroLote: lote, cantidadDeVacunas: req.body.cantidadDeVacunas, idCentroRecibe: cen, fechaSalida: req.body.fechaSalida, fechaLlegada: null }, { where: { idTraslado: req.params.id } });
                        const numero2 = parseInt(req.body.cantidadDeVacunas);
                        const cant = cantidadTotal - numero2;
                        await DistribucionCentro.update({ idDisCentro: dis.idDisCentro, nroLote: dis.nroLote, cantidadDeVacunas: cant, idDepPro: dis.idDepPro, fechaDeSalidaDepPro: dis.fechaDeSalidaDepPro, idCentro: dis.idCentro, fechaLlegadaCentro: dis.fechaLlegadaCentro }, { where: { idDisCentro: dis.idDisCentro } })
                            .then((respu) => {
                                res.redirect("/traslado");
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

exports.eliminar = function (req, res) {
    Traslado.findByPk(req.params.id)
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Registro de Traslado con esa informacion." } });
            } else {
                result.destroy();
                res.status(200).json({ message: 'Registro borrado exitosamente.' });
            }
        })
        .catch((err) => res.render("error", { error: err }));
};