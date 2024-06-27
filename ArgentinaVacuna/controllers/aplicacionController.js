const {Aplicacion, AgenteDeSalud, Descarte, CentroDeVacunacion, LoteProveedor,TipoVacuna, Paciente, DistribucionCentro} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");

exports.listar = function (req, res){
    Aplicacion.findAll({include:[{model:Paciente},{model:AgenteDeSalud},{model:CentroDeVacunacion},{model:LoteProveedor,include:[{model:TipoVacuna}]}]}).then((ap)=> {
      res.render("aplicacion/ListarAplicaciones",{title:"Aplicacion", listaDeAplicaciones:ap});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editAplicacion=async function (req, res){
    
    const agentes =await AgenteDeSalud.findAll();
    const pacientes =await Paciente.findAll();
    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
    }
    if(descartadas==null || descartadas.length === 0){
        Aplicacion.findByPk(req.params.id)
        .then(async (ap)=>{
            const centro =await CentroDeVacunacion.findByPk(ap.idCentro);
            const lotes =await LoteProveedor.findAll({where:{idCentro:centro.idCentro}});
            res.render("aplicacion/editarRegistro",{title:"Aplicacion", ap:ap,centros:centro,listAgentes:agentes,listPacientes:pacientes,listaLote:lotes});
        })
        .catch((err) => res.render("error", {error:err}));
    }else{
        Aplicacion.findByPk(req.params.id)
        .then(async (ap)=>{
            const centro = await CentroDeVacunacion.findByPk(ap.idCentro);
            const lotes = await DistribucionCentro.findAll({include:LoteProveedor, where:[{idCentro:centro.idCentro}]})
            res.render("aplicacion/editarRegistro",{title:"Aplicacion", ap:ap,centros:centro,listAgentes:agentes,listPacientes:pacientes,listaLote:lotes,});
        })
        .catch((err) => res.render("error", {error:err}));
    }
    
};

exports.putAplicacion =async function (req, res){
    try {
        
        const textoC = req.body.idCentro;
        const partesC = textoC.split('-');
        var centro = partesC[0].trim();

        const fechaActual = moment();
        const loteF = await LoteProveedor.findByPk(req.body.nroLote);
        const fechaVen = moment(loteF.fechaDeVencimiento);
        if(req.body.dniPaciente != "" || req.body.dniPaciente != null && req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nroLote != "" || req.body.nroLote != null && req.body.fechaDeAplicacion != "" || req.body.fechaDeAplicacion != null && req.body.idCentro!= "" || req.body.idCentro != null){
            const fecha = moment(req.body.fechaDeAplicacion);
            if(fecha.date() > fechaActual.date() && fecha.month()>= fechaActual.month() && fecha.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Aplicacion invalida."}});
            }else{
                if(fecha.date() > fechaVen.date()  && fecha.month() >= fechaVen.month() && fecha.year() >= fechaVen.year() || loteF.vencidas == true){
                    res.render("error", {message:"Bad Request",error:{status:400,stack:"No se puede aplicar vacunas vencidas."}});
                }else{
                    await Aplicacion.update({idAplicacion:req.params.id, dniPaciente:req.body.dniPaciente, dniAgente:req.body.dniAgente, nroLote:req.body.nroLote, fechaDeAplicacion:req.body.fechaDeAplicacion, idCentro:centro},{where:{idAplicacion: req.params.id}})
                    .then((result)=> {
                        if(result[0] == 1){
                            res.redirect("/aplicacion");
                        }
                    })
                    .catch((err) => res.render("error", {error:err}));
                }
            }
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    } catch (error) {
        res.status(500).json({ message: "Error al editar un Registro de Aplicacion." });
    }
};
exports.listarCentros = async function (req, res){
    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
    }
    if(descartadas==null || descartadas.length === 0){
        DistribucionCentro.findAll({
            include:[{
                model:LoteProveedor
            },{
                model:CentroDeVacunacion
            }
        ],where:[{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false}],
        group:'idCentro'
        })
        .then((result)=>{
            if(result == null || result.length === 0){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun registro de Distribucion hacia Centro de Vacunacion con esa informacion."}});
            }else{
                res.render("aplicacion/formCentros", {title:"Aplicacion", listaCentros:result});
            }
        })
        .catch((err) => res.render("error", {error:err}));
    }else{
        DistribucionCentro.findAll({
            include:[{
                model:LoteProveedor
            },{
                model:CentroDeVacunacion
            }
        ],where:[{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false, '$LoteProveedor.nroLote$':{[Op.notIn]:listaDescarte}}],
        group:'idCentro'
        })
        .then((result)=>{
            if(result == null || result.length === 0){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun registro de Distribucion hacia Centro de Vacunacion con esa informacion."}});
            }else{
                res.render("aplicacion/formCentros", {title:"Aplicacion", listaCentros:result});
            }
        })
        .catch((err) => res.render("error", {error:err}));
    }
    
};

exports.obtener = async function (req, res){
    const agentes =await AgenteDeSalud.findAll();
    const pacientes =await Paciente.findAll();
    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
    }
    if(descartadas==null || descartadas.length === 0){
        await DistribucionCentro.findAll({
            include:[{
                model:LoteProveedor
            },{
                model:CentroDeVacunacion
            }
        ],where:[{idCentro:req.body.idCentro},{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false}]
        })
        .then((result)=>{
            if(result == null || result.length === 0){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun registro de Distribucion hacia Centro de Vacunacion con esa informacion."}});
            }else{
                const centroNombre =CentroDeVacunacion.findByPk(req.body.idCentro);
                res.render("aplicacion/registrarAplicacion",{title:"Aplicacion", listAgentes:agentes, listPacientes:pacientes, listaLote:result, centro:centroNombre});
            }
        })
        .catch((err) => res.render("error", {error:err}));
    }else{
        await DistribucionCentro.findAll({
            include:[{
                model:LoteProveedor
            },{
                model:CentroDeVacunacion
            }
        ],where:[{idCentro:req.body.idCentro},{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false},{'$LoteProveedor.nroLote$':{[Op.notIn]:listaDescarte}}]
        })
        .then(async(result)=>{
            if(result == null || result.length === 0){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun registro de Distribucion hacia Centro de Vacunacion con esa informacion."}});
            }else{
                const centroNombre =await CentroDeVacunacion.findByPk(req.body.idCentro);
                console.log(req.body.idCentro);
                res.render("aplicacion/registrarAplicacion",{title:"Aplicacion", listAgentes:agentes, listPacientes:pacientes, listaLote:result, centro:centroNombre});
            }
        })
        .catch((err) => res.render("error", {error:err}));
    }
    
};

exports.alta =async function (req, res){
    try {
        const textoC = req.body.idCentro;
        const partesC = textoC.split('-');
        var centro = partesC[0].trim();

        const fechaActual = moment().format('L');
        const loteF = await LoteProveedor.findByPk(req.body.nroLote);
        const fechaVen = moment(loteF.fechaDeVencimiento).format('L');
        
        if(req.body.dniPaciente != "" || req.body.dniPaciente != null && req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nroLote != "" || req.body.nroLote != null && req.body.fechaDeAplicacion != "" || req.body.fechaDeAplicacion != null && req.body.idCentro!= "" || req.body.idCentro != null){
            const fechaAp = moment(req.body.fechaDeAplicacion).format('L');

            const centroFecha = await DistribucionCentro.findOne({where:[{idCentro:centro},{nroLote:req.body.nroLote},{cantidadDeVacunas:{[Op.gt]:0}}]});
            const fechaCentro = moment(centroFecha.fechaLlegadaCentro).format('L');
            if(fechaAp > fechaActual || fechaAp > fechaVen || fechaAp < fechaCentro){
               res.render("error", {message:"Bad Request",error:{status:400,stack:"Fechas invalidas."}});
            }else{
                Aplicacion.create({dniPaciente:req.body.dniPaciente, dniAgente:req.body.dniAgente, nroLote:req.body.nroLote, fechaDeAplicacion:req.body.fechaDeAplicacion, idCentro:centro})
                .then((result)=>{
                    if(result==0){
                        res.render("error", {message:"Bad Request",error:{status:400,stack:"Error al crear registro de Aplicacion."}});
                    }else{
                        var cantidad = parseInt(centroFecha.cantidadDeVacunas);
                        cantidad = cantidad - 1;
                        DistribucionCentro.update({idDisCentro:centroFecha.idDisCentro, nroLote:centroFecha.nroLote, cantidadDeVacunas:cantidad, idDepProv:centroFecha.idDepProv, fechaDeSalidaDepProv:centroFecha.fechaDeSalidaDepProv, idCentro:centroFecha.idCentro, fechaLlegadaCentro:centroFecha.fechaLlegadaCentro},{where:{idDisCentro:centroFecha.idDisCentro}})
                        .then((resulta)=>{
                            if(resulta==0){
                                res.render("error", {message:"Bad Request",error:{status:400,stack:"Error al crear registro de Aplicacion."}});
                            }else{
                                res.redirect("/aplicacion");
                                }
                            })
                            .catch((err) => res.render("error", {error:err}));
                    }
                })
                .catch((err) => res.render("error", {error:err}));
            }
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos o incompletos."}});
        }
    } catch (error) {
        res.status(500).json({ message: "Error al agregar un Registro de Aplicacion." });
    }
};

exports.eliminar = function (req, res){
    Aplicacion.findByPk(req.params.id)
    .then(async (result)=>{
        result.destroy();
        res.redirect("/aplicacion");
    })
    .catch((err) => res.render("error", {error:err}));
};


exports.listaPacientesXTipoVacuna = function (req, res){
    try {
        Aplicacion.findAll({
            include: [
                {
                    model: LoteProveedor,
                    include:{
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
            attributes: [
                [sequelize.col('LoteProveedor.TipoVacuna.nombre'), 'tipoVacuna'],
                [sequelize.fn('COUNT', sequelize.col('Paciente.dniPaciente')), 'cantidadPacientes']
            ],
            group: ['LoteProveedor.TipoVacuna.nombre', 'CentroDeVacunacion.provincia', 'CentroDeVacunacion.localidad']
        })
        .then(async (result)=>{
            if(result == null){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ninguna informacion."}});
            }else{
                res.render("aplicacion/listaPacientes",{listaPacientes:result, title:"Aplicacion"});
            }
        })
        .catch((err) => res.render("error", {error:err}));

    } catch (error) {
        console.error('Error al obtener la cantidad de pacientes vacunados por tipo de vacuna, provincia y localidad:', error);
        throw error;
    }
};

exports.listaPacientesXVacunaVencida =function (req, res){
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
              where: { vencidas:true },
              include: {
                model: TipoVacuna,
                attributes: ['nombre']
              }
            }
          ]
        })
        .then((result)=>{
            if(result==null){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ninguna informacion."}});
            }else{
                const resultados =result.map(aplicacion => ({
                dni: aplicacion.Paciente.dniPaciente,
                paciente: aplicacion.Paciente.nombre+" "+aplicacion.Paciente.apellido,
                centro: aplicacion.CentroDeVacunacion.nombre,
                provincia: aplicacion.CentroDeVacunacion.provincia,
                tipoVacuna: aplicacion.LoteProveedor.TipoVacuna.nombre
                }));
            res.render('aplicacion/listaVencidas', {listadoVencidas:resultados, title:"Aplicacion"});
            }
        })
        .catch((err) =>{
            console.log("aqui");
            res.render("error", {error:err})
        });
      } catch (error) {
        console.error('Error al obtener el listado de pacientes con vacunas vencidas:', error);
        res.status(500).send('Error al obtener el listado de pacientes con vacunas vencidas');
      }
};
