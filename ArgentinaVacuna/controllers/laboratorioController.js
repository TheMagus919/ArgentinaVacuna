const { Laboratorio, TrasladoDeposito, LoteProveedor, TipoVacuna } = require("../models");
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");


exports.listar = function (req, res) {
    if (req.session.rol == "Administrador") {
        Laboratorio.findAll().then((lab) => {
            res.render("laboratorio/laboratorio", { listLaboratorios: lab, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Laboratorio" });
        })
            .catch((err) => res.render("error", { error: err }));
    } else {
        Laboratorio.findAll({ where: { idLab: { [Op.in]: req.session.trabaja } } }).then((lab) => {
            res.render("laboratorio/laboratorio", { listLaboratorios: lab, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Laboratorio" });
        })
            .catch((err) => res.render("error", { error: err }));
    }
};

exports.stock = async function (req, res) {
    const loteEnviados = await TrasladoDeposito.findAll({ include: { model: LoteProveedor, include: { model: Laboratorio } }, where: [{ '$LoteProveedor.idLab$': req.params.id }, { fechaDeCompra: { [Op.not]: null } }], attributes: ['nroLote'] });
    const listaLotes = [];
    for (var i = 0; i < loteEnviados.length; i++) {
        listaLotes.push(loteEnviados[i].nroLote);
    }
    LoteProveedor.findAll({ include: { model: TipoVacuna }, where: [{ idLab: req.params.id }, { nroLote: { [Op.notIn]: listaLotes } }] })
        .then((result) => {
            res.render("laboratorio/stock", { title: "Stock Disponible", name: req.session.nombre, mail: req.session.mail, rol: req.session.rol, listaStock: result });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.formAgregar = async function (req, res) {
    const tipoVacuna = await TipoVacuna.findAll();
    Laboratorio.findByPk(req.params.id)
        .then((result) => {
            res.render("laboratorio/formAgregar", { title: "Agregar Lote", name: req.session.nombre, mail: req.session.mail, rol: req.session.rol, laboratorio: result, tipos: tipoVacuna });
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.agregar = async function (req, res) {
    if (req.body.nroLote != "" || req.body.nroLote != null && req.body.idTipoVacuna != "" || req.body.idTipoVacuna != null && req.body.tipoDeFrasco != "" || req.body.tipoDeFrasco != null && req.body.nombreComercial != "" || req.body.nombreComercial != null && req.body.cantidadDeVacunas != "" || req.body.cantidadDeVacunas != null && req.body.fechaDeFabricacion != "" || req.body.fechaDeFabricacion != null && req.body.fechaDeVencimiento != "" || req.body.fechaDeVencimiento != null) {
        const fechaActual = moment().format('L');
        const fechaFab = moment(req.body.fechaDeFabricacion).format('L');
        const fechaVen = moment(req.body.fechaDeVencimiento).format('L');
        if (fechaFab >= fechaActual || fechaVen <= fechaFab) {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fechas incorrectas." } });
        } else {
            const NombreExistente = await LoteProveedor.findOne({ where: { nombreComercial: req.body.nombreComercial } });
            const LoteExistente = await LoteProveedor.findByPk(req.body.nroLote);
            if (NombreExistente === null && LoteExistente === null) {
                LoteProveedor.create({ nroLote: req.body.nroLote, idLab: req.body.idLab, idTipoVacuna: req.body.idTipoVacuna, tipoDeFrasco: req.body.tipoDeFrasco, nombreComercial: req.body.nombreComercial, cantidadDeVacunas: req.body.cantidadDeVacunas, fechaDeFabricacion: req.body.fechaDeFabricacion, fechaDeVencimiento: req.body.fechaDeVencimiento, vencidas: false })
                    .then((result) => {
                        if (result) {
                            res.redirect("/loteProveedor");
                        } else {
                            res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "El LoteProveedor no se pudo crear." } });
                        }
                    })
                    .catch((err) => res.render("error", { error: err }));
            } else {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "El Numero de Lote o Nombre Comercial se encuentra en uso." } });
            }
        }
    } else {
        res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
    }
};

//ADMINISTRADOR
exports.crear = function (req, res) {
    res.render("laboratorio/crear", { title: "Laboratorio", name: req.session.nombre, mail: req.session.mail, rol: req.session.rol });
};

exports.alta = async function (req, res) {
    try {
        if (req.body.nombre != "" || req.body.nombre != null && req.body.pais != "" || req.body.pais != null && req.body.provincia != "" || req.body.provincia != null && req.body.email != "" || req.body.email != null && req.body.telefono != "" || req.body.telefono != null && req.body.direccion != "" || req.body.direccion != null) {
            const MailExistente = await Laboratorio.findOne({ where: { email: req.body.email } });
            if (MailExistente === null) {
                Laboratorio.create({ nombre: req.body.nombre, pais: req.body.pais, provincia: req.body.provincia, email: req.body.email, telefono: req.body.telefono, direccion: req.body.direccion })
                    .then((result) => {
                        if (result) {
                            res.redirect("/laboratorio");
                        } else {
                            res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "El Laboratorio no se pudo crear." } });
                        }
                    })
                    .catch((err) => res.render("error", { error: err }));
            } else {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "El Email ingresado es invalido." } });
            }

        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.editLaboratorio = function (req, res) {
    Laboratorio.findByPk(req.params.id)
        .then(async (lab) => {
            if (lab == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Laboratorio con esa informacion." } });
            } else {
                res.render("laboratorio/actualizar", { lab: lab, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Laboratorio" });
            }
        }
        )
        .catch((err) => res.render("error", { error: err }));
};

exports.putLaboratorio = async function (req, res) {
    try {
        if (req.body.nombre != "" || req.body.nombre != null && req.body.pais != "" || req.body.pais != null && req.body.provincia != "" || req.body.provincia != null && req.body.telefono != "" || req.body.telefono != null && req.body.direccion != "" || req.body.direccion != null) {
            await Laboratorio.update({ idLab: req.params.id, nombre: req.body.nombre, pais: req.body.pais, provincia: req.body.provincia, telefono: req.body.telefono, direccion: req.body.direccion }, { where: { idLab: req.params.id } })
                .then((result) => {
                    if (result[0] == 1) {
                        res.redirect("/laboratorio");
                    } else {
                        res.render("error", { message: "Internal Server Error", error: { status: 500, stack: "El Laboratorio no se pudo editar." } });
                    }
                })
                .catch((err) => res.render("error", { error: err }));
        } else {
            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
        }
    } catch (error) {
        res.render("error", { error: error });
    }
};

exports.eliminar = function (req, res) {
    Laboratorio.findByPk(req.params.id)
        .then(async (result) => {
            if (result == null) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Laboratorio con esa informacion." } });
            } else {
                result.destroy();
                res.status(200).json({ message: 'Registro borrado exitosamente.' });
            }
        })
        .catch((err) => res.render("error", { error: err }));
};
