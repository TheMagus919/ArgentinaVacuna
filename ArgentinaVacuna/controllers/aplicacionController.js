const { Aplicacion, AgenteDeSalud, Descarte, CentroDeVacunacion, LoteProveedor, TipoVacuna, Traslado, Paciente, DistribucionCentro, Laboratorio } = require("../models");
const { Sequelize, Op, fn, col, literal } = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");

exports.listar = function (req, res) {
    Aplicacion.findAll({ include: [{ model: Paciente }, { model: AgenteDeSalud }, { model: CentroDeVacunacion }, { model: LoteProveedor, include: [{ model: TipoVacuna }] }], where: [{ '$CentroDeVacunacion.provincia$': req.session.provincia }, { '$AgenteDeSalud.dniAgente$': req.session.userId }] }).then((ap) => {
        res.render("aplicacion/ListarAplicaciones", { title: "Aplicacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaDeAplicaciones: ap });
    })
        .catch((err) => res.render("error", { error: err }));
};

exports.listarCentros = async function (req, res) {
    CentroDeVacunacion.findAll({ where: { idCentro: { [Op.in]: req.session.trabaja } } })
        .then((result) => {
            if (result == null || result.length === 0) {
                res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ningun Centro de Vacunacion con esa informacion." } });
            } else {
                res.render("aplicacion/formCentros", { title: "Aplicacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, listaCentros: result });
            }
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.obtener = async function (req, res) {
    const agentes = await AgenteDeSalud.findByPk(req.session.userId);
    const pacientes = await Paciente.findAll({ where: { provincia: req.session.provincia } });
    const descartadas = await Descarte.findAll({ where: { idCentro: req.body.idCentro }, attributes: ['nroLote'] });
    var centroNombre = await CentroDeVacunacion.findByPk(req.body.idCentro);
    const listaDescarte = [];
    for (var i = 0; i < descartadas.length; i++) {
        listaDescarte.push(descartadas[i].nroLote);
    }
    if (descartadas == null || descartadas.length === 0) {
        const distribucion = await DistribucionCentro.findAll({ include: { model: LoteProveedor }, where: [{ idCentro: req.body.idCentro }, { fechaLlegadaCentro: { [Op.not]: null } }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }], attributes: ['nroLote', 'cantidadDeVacunas'] });
        const traslado = await Traslado.findAll({ include: { model: LoteProveedor }, where: [{ idCentroRecibe: req.body.idCentro }, { fechaLlegada: { [Op.not]: null } }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }], attributes: ['nroLote', 'cantidadDeVacunas'] });

        const listaLote = new Set();
        for (var i = 0; i < distribucion.length; i++) {
            listaLote.add(distribucion[i].nroLote);
        }
        for (var i = 0; i < traslado.length; i++) {
            listaLote.add(traslado[i].nroLote);
        }
        const lotesArray = Array.from(listaLote);
        if (lotesArray != null || lotesArray.length != 0) {
            LoteProveedor.findAll({ where: { nroLote: { [Op.in]: lotesArray } } })
                .then((result) => {
                    res.render("aplicacion/registrarAplicacion", { title: "Aplicacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, agente: agentes, listPacientes: pacientes, listaLote: result, centro: centroNombre });
                })
                .catch((err) => res.render("error", { error: err }));
        } else {
            res.render("error", { message: "Not Found", error: { status: 404, stack: "No hay vacunas disponibles en el Centro de Vacunacion." } });
        }
    } else {
        const distribucion = await DistribucionCentro.findAll({ include: { model: LoteProveedor }, where: [{ idCentro: req.body.idCentro }, { fechaLlegadaCentro: { [Op.not]: null } }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }, { '$LoteProveedor.nroLote$': { [Op.notIn]: listaDescarte } }], attributes: ['nroLote'] });
        const traslado = await Traslado.findAll({ include: { model: LoteProveedor }, where: [{ idCentroRecibe: req.body.idCentro }, { fechaLlegada: { [Op.not]: null } }, { cantidadDeVacunas: { [Op.gt]: 0 } }, { '$LoteProveedor.vencidas$': false }, { '$LoteProveedor.nroLote$': { [Op.notIn]: listaDescarte } }], attributes: ['nroLote'] });

        const listaLote = new Set();
        for (var i = 0; i < distribucion.length; i++) {
            listaLote.add(distribucion[i].nroLote);
        }
        for (var i = 0; i < traslado.length; i++) {
            listaLote.add(traslado[i].nroLote);
        }
        const lotesArray = Array.from(listaLote);

        if (listaLote != null || listaLote.length != 0) {
            LoteProveedor.findAll({ where: { nroLote: { [Op.in]: lotesArray } } })
                .then((result) => {
                    res.render("aplicacion/registrarAplicacion", { title: "Aplicacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, agente: agentes, listPacientes: pacientes, listaLote: result, centro: centroNombre });
                })
                .catch((err) => res.render("error", { error: err }));
        } else {
            res.render("error", { message: "Not Found", error: { status: 404, stack: "No hay vacunas disponibles en el Centro de Vacunacion." } });
        }
    }

};

exports.alta = async function (req, res) {
    try {
        const textoC = req.body.idCentro;
        const partesC = textoC.split('-');
        var centro = partesC[0].trim();

        const fechaActual = moment().format('L');
        const loteF = await LoteProveedor.findByPk(req.body.nroLote);
        const fechaVen = moment(loteF.fechaDeVencimiento).format('L');

        let distribucionCantidad = await DistribucionCentro.sum('cantidadDeVacunas', { where: [{ nroLote: req.body.nroLote }, { idCentro: req.body.idCentro }, { fechaLlegadaCentro: { [Op.not]: null } }] });
        let trasladoCantidad = await Traslado.sum('cantidadDeVacunas', { where: [{ nroLote: req.body.nroLote }, { idCentroRecibe: req.body.idCentro }, { fechaLlegada: { [Op.not]: null } }] });
        const aplicacionCantidad = await Aplicacion.count({ where: [{ nroLote: req.body.nroLote }, { idCentro: req.body.idCentro }] });

        let cantidadDisponible = (distribucionCantidad || 0) + (trasladoCantidad || 0) - (aplicacionCantidad || 0);
        if (cantidadDisponible == 0 || cantidadDisponible == null) {
            res.render("error", { message: "Bad Request", error: { status: 404, stack: "No hay vacunas Disponibles." } });
        } else {
            if (req.body.dniPaciente != "" || req.body.dniPaciente != null && req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nroLote != "" || req.body.nroLote != null && req.body.fechaDeAplicacion != "" || req.body.fechaDeAplicacion != null && req.body.idCentro != "" || req.body.idCentro != null) {
                const fechaAp = moment(req.body.fechaDeAplicacion).format('L');
                const pacienteExistente = await Paciente.findByPk(req.body.dniPaciente);

                const distribucion = await DistribucionCentro.findOne({ where: [{ idCentro: centro }, { nroLote: req.body.nroLote }, { cantidadDeVacunas: { [Op.gt]: 0 } }] });
                let fechaDistribucion = new Date();
                if (distribucion != null) {
                    fechaDistribucion = new Date(distribucion.fechaLlegadaCentro);
                } else {
                    fechaDistribucion = new Date('2500-01-01T00:00:00');
                }

                const traslado = await Traslado.findOne({ where: [{ idCentroRecibe: centro }, { nroLote: req.body.nroLote }, { cantidadDeVacunas: { [Op.gt]: 0 } }] });
                let fechaTraslado = new Date();
                if (traslado != null) {
                    fechaTraslado = new Date(traslado.fechaLlegada);
                } else {
                    fechaTraslado = new Date('2500-01-01T00:00:00');
                }

                if (pacienteExistente == null) {
                    res.render("error", { message: "Not Found", error: { status: 404, stack: "Paciente no encontrado." } });
                }
                const fechaAplicacion = new Date(req.body.fechaDeAplicacion);
                if (fechaAp > fechaActual || fechaAp > fechaVen) {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fechas invalidas." } });
                } else if (fechaAplicacion < fechaTraslado && fechaAplicacion > fechaDistribucion && distribucionCantidad > 0) {
                    console.log("entro distribucion y 1 fechas");
                    Aplicacion.create({ dniPaciente: req.body.dniPaciente, dniAgente: req.session.userId, nroLote: req.body.nroLote, fechaDeAplicacion: req.body.fechaDeAplicacion, idCentro: centro })
                        .then((result) => {
                            if (result == null) {
                                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                            } else {
                                distribucionCantidad = distribucionCantidad - 1;
                                DistribucionCentro.update({ cantidadDeVacunas: distribucionCantidad }, { where: { idDisCentro: distribucion.idDisCentro } })
                                    .then((resulta) => {
                                        if (resulta == 0) {
                                            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                                        } else {
                                            res.redirect("/aplicacion");
                                        }
                                    })
                                    .catch((err) => res.render("error", { error: err }));
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                } else if (fechaAplicacion < fechaDistribucion && fechaAplicacion > fechaTraslado && trasladoCantidad > 0) {
                    console.log("entro traslado y 1 fechas");
                    Aplicacion.create({ dniPaciente: req.body.dniPaciente, dniAgente: req.session.userId, nroLote: req.body.nroLote, fechaDeAplicacion: req.body.fechaDeAplicacion, idCentro: centro })
                        .then((result) => {
                            if (result == null) {
                                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                            } else {
                                console.log("aca traslado y 1 fechas");
                                trasladoCantidad = trasladoCantidad - 1;
                                console.log("cantidad traslado y 1 fechas");
                                Traslado.update({ cantidadDeVacunas: trasladoCantidad }, { where: { idTraslado: traslado.idTraslado } })
                                    .then((resulta) => {
                                        console.log("traslado update traslado y 1 fechas");
                                        if (resulta == 0) {
                                            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                                        } else {
                                            res.redirect("/aplicacion");
                                        }
                                    })
                                    .catch((err) => res.render("error", { error: err }));
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                } else if (fechaAplicacion > fechaDistribucion && fechaAplicacion > fechaTraslado && trasladoCantidad > 0 && fechaDistribucion > 0) {
                    console.log("entro 2 y 2 fechas");
                    Aplicacion.create({ dniPaciente: req.body.dniPaciente, dniAgente: req.session.userId, nroLote: req.body.nroLote, fechaDeAplicacion: req.body.fechaDeAplicacion, idCentro: centro })
                        .then((result) => {
                            if (result == null) {
                                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                            } else {
                                console.log("aca 2 y 2")
                                distribucionCantidad = distribucionCantidad - 1;
                                DistribucionCentro.update({ cantidadDeVacunas: distribucionCantidad }, { where: { idDisCentro: centroFecha.idDisCentro } })
                                    .then((resulta) => {
                                        if (resulta == 0) {
                                            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                                        } else {
                                            res.redirect("/aplicacion");
                                        }
                                    })
                                    .catch((err) => res.render("error", { error: err }));
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                } else if (fechaAplicacion > fechaDistribucion && fechaAplicacion > fechaTraslado && trasladoCantidad <= 0 && fechaDistribucion > 0) {
                    console.log("entro distribucion y 2 fechas");
                    Aplicacion.create({ dniPaciente: req.body.dniPaciente, dniAgente: req.session.userId, nroLote: req.body.nroLote, fechaDeAplicacion: req.body.fechaDeAplicacion, idCentro: centro })
                        .then((result) => {
                            if (result == null) {
                                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                            } else {
                                distribucionCantidad = distribucionCantidad - 1;
                                DistribucionCentro.update({ cantidadDeVacunas: distribucionCantidad }, { where: { idDisCentro: centroFecha.idDisCentro } })
                                    .then((resulta) => {
                                        if (resulta == 0) {
                                            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                                        } else {
                                            res.redirect("/aplicacion");
                                        }
                                    })
                                    .catch((err) => res.render("error", { error: err }));
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                } else if (fechaAplicacion > fechaDistribucion && fechaAplicacion > fechaTraslado && trasladoCantidad > 0 && fechaDistribucion <= 0) {
                    console.log("entro traslado y 2 fechas");
                    Aplicacion.create({ dniPaciente: req.body.dniPaciente, dniAgente: req.session.userId, nroLote: req.body.nroLote, fechaDeAplicacion: req.body.fechaDeAplicacion, idCentro: centro })
                        .then((result) => {
                            if (result == null) {
                                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                            } else {
                                trasladoCantidad = trasladoCantidad - 1;
                                Traslado.update({ cantidadDeVacunas: trasladoCantidad }, { where: { idTraslado: traslado.idTraslado } })
                                    .then((resulta) => {
                                        if (resulta == 0) {
                                            res.render("error", { message: "Bad Request", error: { status: 400, stack: "Error al crear registro de Aplicacion." } });
                                        } else {
                                            res.redirect("/aplicacion");
                                        }
                                    })
                                    .catch((err) => res.render("error", { error: err }));
                            }
                        })
                        .catch((err) => res.render("error", { error: err }));
                } else {
                    res.render("error", { message: "Bad Request", error: { status: 400, stack: "Fecha de aplicacion o cantidad de vacunas incorrectas." } });
                }
            } else {
                res.render("error", { message: "Bad Request", error: { status: 400, stack: "Datos invalidos o incompletos." } });
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Error al agregar un Registro de Aplicacion." });
    }
};

exports.eliminar = function (req, res) {
    Aplicacion.findByPk(req.params.id)
        .then(async (result) => {
            const distribucion = await DistribucionCentro.findOne({ where: [{ idCentro: result.idCentro }, { nroLote: result.nroLote }] });
            const traslado = await Traslado.findOne({ where: [{ idCentroRecibe: result.idCentro }, { nroLote: result.nroLote }] });
            if (distribucion != null && traslado == null) {
                let cantidad = distribucion.cantidadDeVacunas + 1;
                DistribucionCentro.update({ cantidadDeVacunas: cantidad }, { where: { idDisCentro: distribucion.idDisCentro } })
                    .then((resultado) => {
                        result.destroy();
                        res.status(200).json({ message: 'Registro borrado exitosamente.' });
                    })
                    .catch((err) => res.render("error", { error: err }));
            } else if (distribucion == null && traslado != null) {
                let cantidad = traslado.cantidadDeVacunas + 1;
                Traslado.update({ cantidadDeVacunas: cantidad }, { where: { idTraslado: traslado.idTraslado } })
                    .then((resultado) => {
                        result.destroy();
                        res.status(200).json({ message: 'Registro borrado exitosamente.' });
                    })
                    .catch((err) => res.render("error", { error: err }));
            } else if (distribucion != null && traslado != null) {
                let cantidad = distribucion.cantidadDeVacunas + 1;
                DistribucionCentro.update({ cantidadDeVacunas: cantidad }, { where: { idDisCentro: distribucion.idDisCentro } })
                    .then((resultado) => {
                        result.destroy();
                        res.status(200).json({ message: 'Registro borrado exitosamente.' });
                    })
                    .catch((err) => res.render("error", { error: err }));
            }
        })
        .catch((err) => res.render("error", { error: err }));
};


exports.listaPacientesXTipoVacuna = function (req, res) {
    try {
        Aplicacion.findAll({
            include: [
                {
                    model: LoteProveedor,
                    include: {
                        model: TipoVacuna,
                        attributes: ['nombre']
                    },
                    attributes: []
                },
                {
                    model: CentroDeVacunacion,
                    attributes: ['provincia', 'localidad']
                },
                {
                    model: Paciente,
                    attributes: []
                }
            ],
            where: [
                { '$CentroDeVacunacion.provincia$': req.session.provincia }
            ],
            attributes: [
                [sequelize.col('LoteProveedor.TipoVacuna.nombre'), 'tipoVacuna'],
                [sequelize.fn('COUNT', sequelize.col('Paciente.dniPaciente')), 'cantidadPacientes']
            ],
            group: ['LoteProveedor.TipoVacuna.nombre', 'CentroDeVacunacion.provincia', 'CentroDeVacunacion.localidad']
        })
            .then(async (result) => {
                if (result == null) {
                    res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ninguna informacion." } });
                } else {
                    res.render("aplicacion/listaPacientes", { listaPacientes: result, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Aplicacion" });
                }
            })
            .catch((err) => res.render("error", { error: err }));

    } catch (error) {
        console.error('Error al obtener la cantidad de pacientes vacunados por tipo de vacuna, provincia y localidad:', error);
        throw error;
    }
};
/*
exports.listaPacientesXVacunaVencida = function (req, res) {
    try {
        Aplicacion.findAll({
            include: [
                {
                    model: Paciente,
                    attributes: ['dniPaciente', 'nombre', 'apellido']
                },
                {
                    model: CentroDeVacunacion,
                    attributes: ['nombre', 'provincia']
                },
                {
                    model: LoteProveedor,
                    where: { vencidas: true },
                    include: {
                        model: TipoVacuna,
                        attributes: ['nombre']
                    }
                }
            ],
            where: [
                { '$CentroDeVacunacion.provincia$': req.session.provincia }
            ]
        })
            .then((result) => {
                if (result == null) {
                    res.render("error", { message: "Not Found", error: { status: 404, stack: "No se encontro ninguna informacion." } });
                } else {
                    const resultados = result.map(aplicacion => ({
                        dni: aplicacion.Paciente.dniPaciente,
                        paciente: aplicacion.Paciente.nombre + " " + aplicacion.Paciente.apellido,
                        centro: aplicacion.CentroDeVacunacion.nombre,
                        provincia: aplicacion.CentroDeVacunacion.provincia,
                        tipoVacuna: aplicacion.LoteProveedor.TipoVacuna.nombre
                    }));
                    res.render('aplicacion/listaVencidas', { listadoVencidas: resultados, rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, title: "Aplicacion" });
                }
            })
            .catch((err) => {
                res.render("error", { error: err })
            });
    } catch (error) {
        res.status(500).send('Error al obtener el listado de pacientes con vacunas vencidas');
    }
};
*/

exports.crearPaciente = function (req, res) {
    res.render("aplicacion/crearPaciente", { title: "Agregar Nuevo Paciente", name: req.session.nombre, mail: req.session.mail, rol: req.session.rol });
};

exports.altaPaciente = async function (req, res) {
    try {
        const fechaActual = moment().format('L');
        if (req.body.dniPaciente != "" || req.body.dniPaciente != null && req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.mail != "" || req.body.mail != null && req.body.localidad != "" || req.body.localidad != null && req.body.celular != "" || req.body.celular != null && req.body.celularDeRespaldo != "" || req.body.celularDeRespaldo != null) {
            const fecha = moment(req.body.fechaDeNacimiento).format('L');
            if (fecha >= fechaActual) {
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

exports.stockDisponible = async function (req, res) {
    LoteProveedor.findAll({
        attributes: [
            'nombreComercial',
            'nroLote',
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
                attributes: ['idCentro', 'descartado'],
                required: false,
                where: [{ idCentro: { [Op.in]: req.session.trabaja } }, { descartado: false }, { fechaLlegadaCentro: { [Op.not]: null } }]
            },
            {
                model: Traslado,
                include: [{ model: CentroDeVacunacion, as: 'centroRecibe', attributes: ['nombre'], required: false }],
                attributes: ['idCentroRecibe', 'descartado'],
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
                res.render("aplicacion/stockDisponible", { title: "Stock Disponible", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, stock: result });
            }
        })
        .catch((err) => res.render("error", { error: err }));
};

exports.consultar = async function (req, res) {
    Aplicacion.findByPk(req.params.id, { include: [{ model: CentroDeVacunacion }, { model: Paciente }, { model: AgenteDeSalud }, { model: LoteProveedor, include: [{ model: TipoVacuna }, { model: Laboratorio }] }] })
        .then((result) => {
            const fechaDeNacimiento = new Date(result.Paciente.fechaDeNacimiento);
            const fechaActual = new Date();
            let edad = fechaActual.getFullYear() - fechaDeNacimiento.getFullYear();
            const mes = fechaActual.getMonth() - fechaDeNacimiento.getMonth();
            if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaDeNacimiento.getDate())) {
                edad--;
            }
            res.render("aplicacion/consultar", { title: "Consultar Aplicacion", rol: req.session.rol, name: req.session.nombre, mail: req.session.mail, informacion: result, edad: edad });
        })
        .catch((err) => res.render("error", { error: err }));
};