const {Traslado, CentroDeVacunacion,Descarte, DistribucionCentro, LoteProveedor, TipoVacuna, Laboratorio} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");


exports.listarCentros = async function (req, res){
    CentroDeVacunacion.findAll()
    .then((centros)=> {
        res.render("traslado/ListarCentros",{title:"Traslado", listaDeCentros:centros});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.listarTrasladosPorCentros = async function (req, res){
    Traslado.findAll({where:{idCentroEnvia:req.params.id}})
    .then((res)=>{
        res.render("traslado/listar",{title:"Traslado", traslado:res});
    })
    .catch((err)=> res.render("error", {error:err}));
};

exports.consultarTraslados = async function (req, res){
    Traslado.findByPk(req.params.id,{include:[{model:LoteProveedor,include:[{model:TipoVacuna},{model:Laboratorio}]},{model:CentroDeVacunacion, as:'centroEnvia'},{model:CentroDeVacunacion, as:'centroRecibe'}]})
    .then((result)=>{
        console.log(result);
        res.render("traslado/consultar",{title:"Traslado", traslado:result});
    })
    .catch((err)=> res.render("error", {error:err}));
};

exports.crear = async function (req, res){
    const centros = await CentroDeVacunacion.findAll({where:{[Op.not]:{idCentro:req.params.id}}});
    const dist = await DistribucionCentro.findOne({include:[{model:LoteProveedor},{model:CentroDeVacunacion}],where:{nroLote:req.params.lote,idCentro:req.params.id}})
    res.render("traslado/trasladar",{title:"Traslado", centros:centros,distri:dist});
};

exports.listarLotes = async function (req, res){
    const centroPrincipal = await CentroDeVacunacion.findByPk(req.params.id);
    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
        listaDescarte.push(descartadas[i].nroLote);
    }
    if(descartadas==null || descartadas.length === 0){
        const ress = await DistribucionCentro.findAll({include:LoteProveedor,where:[{idCentro:req.params.id},{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false}]});
        res.render("traslado/ListarLotes",{title:"Traslado", listaDeLotes:ress,centroPrincipal:centroPrincipal});
    }else{
        const ress = await DistribucionCentro.findAll({include:LoteProveedor,where:[{idCentro:req.params.id},{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false},{'$LoteProveedor.nroLote$':{[Op.notIn]: listaDescarte}}]});
        res.render("traslado/ListarLotes",{title:"Traslado", listaDeLotes:ress,centroPrincipal:centroPrincipal});
    }
};

exports.alta = async function (req, res){
    const textoCentro = req.body.idCentroEnvia;
    const partesC = textoCentro.split('-');
    var centro = partesC[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoCe = req.body.idCentroRecibe;
    const partesCe = textoCe.split('-');
    var cen = partesCe[0].trim();

    var dis = await DistribucionCentro.findOne({where:[{idCentro:centro},{nroLote:lote}]});
    const cantidad = parseInt(dis.cantidadDeVacunas);
    
    try {
        if(req.body.idCentroEnvia != null || req.body.idCentroEnvia != "" && req.body.nroLote != null || req.body.nroLote != "" &&  req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentroRecibe != null || req.body.idCentroRecibe != "" && req.body.fechaSalida != null || req.body.fechaSalida != "" && req.body.fechaLlegada != null || req.body.fechaLlegada != ""){
            const fechaDis = moment(dis.fechaLlegadaCentro).format('L');
            const fechaSalida = moment(req.body.fechaSalida).format('L');
            const fechaLlegada = moment(req.body.fechaLlegada).format('L');
            if(fechaSalida > fechaLlegada || fechaSalida < fechaDis){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Fechas ingresadas son invalidas."}});
            }else{
                if(req.body.cantidadDeVacunas > cantidad){
                    res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Cantidad de Vacunas ingresadas no son invalidas."}});
                }else{
                    Traslado.create({idCentroEnvia:centro, nroLote:lote, cantidadDeVacunas:req.body.cantidadDeVacunas, idCentroRecibe:cen, fechaSalida:req.body.fechaSalida, fechaLlegada:req.body.fechaLlegada});
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidad - numero2;
                        await DistribucionCentro.update({idDisCentro:dis.idDisCentro, nroLote:dis.nroLote, cantidadDeVacunas:cant, idDepPro:dis.idDepPro, fechaDeSalidaDepPro:dis.fechaDeSalidaDepPro, idCentro:dis.idCentro, fechaLlegadaCentro:dis.fechaLlegadaCentro},{where:{idDisCentro:dis.idDisCentro}})
                        .then((respu)=>{
                            if(respu){
                                res.redirect("/traslado");
                            }else{
                                res.render("error", {message:"Internal Server Error",error:{status:500,stack:"No se pudo realizar el traslado."}});
                            }
                        })
                        .catch((err)=>res.render("error", {error:err}));
                }
            }
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.editTraslado = async function (req, res){
    Traslado.findByPk(req.params.id,{include:[{model:LoteProveedor},{model:CentroDeVacunacion, as:'centroEnvia'},{model:CentroDeVacunacion, as:'centroRecibe'}]})
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Agente de Salud con esa informacion."}});
        }else{
            const centros = await CentroDeVacunacion.findAll({where:{idCentro:{[Op.not]:result.idCentroEnvia}}});
            const ress = await DistribucionCentro.findOne({include:LoteProveedor},{where:[{idCentro:result.idCentroEnvia},{nroLote:result.nroLote}]});
            res.render("traslado/editar",{title:"Traslado", tras:result,centros:centros, cantidad:ress});
        }
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.putTraslado = async function (req, res){
    const textoCentro = req.body.idCentroEnvia;
    const partesC = textoCentro.split('-');
    var centro = partesC[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoCe = req.body.idCentroRecibe;
    const partesCe = textoCe.split('-');
    var cen = partesCe[0].trim();

    var dis = await DistribucionCentro.findOne({where:[{idCentro:centro},{nroLote:lote}]});
    const cantidad = parseInt(dis.cantidadDeVacunas);
    var disT = await Traslado.findByPk(req.params.id);
    const cantidadT = parseInt(disT.cantidadDeVacunas);
    const cantidadTotal = cantidad + cantidadT;
    try {
        if(req.body.idCentroEnvia != null || req.body.idCentroEnvia != "" && req.body.nroLote != null || req.body.nroLote != "" &&  req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentroRecibe != null || req.body.idCentroRecibe != "" && req.body.fechaSalida != null || req.body.fechaSalida != "" && req.body.fechaLlegada != null || req.body.fechaLlegada != ""){
            const fechaDis = moment(dis.fechaLlegadaCentro).format('L');
            const fechaSalida = moment(req.body.fechaSalida).format('L');
            const fechaLlegada = moment(req.body.fechaLlegada).format('L');
            if(fechaSalida > fechaLlegada || fechaSalida < fechaDis){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Fechas ingresadas son invalidas."}});
            }else{
                if(req.body.cantidadDeVacunas > cantidadTotal){
                    res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Cantidad de Vacunas ingresadas no son invalidas."}});
                }else{
                    Traslado.update({idCentroEnvia:centro, nroLote:lote, cantidadDeVacunas:req.body.cantidadDeVacunas, idCentroRecibe:cen, fechaSalida:req.body.fechaSalida, fechaLlegada:req.body.fechaLlegada},{where:{idTraslado:req.params.id}});
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidadTotal - numero2;
                        await DistribucionCentro.update({idDisCentro:dis.idDisCentro, nroLote:dis.nroLote, cantidadDeVacunas:cant, idDepPro:dis.idDepPro, fechaDeSalidaDepPro:dis.fechaDeSalidaDepPro, idCentro:dis.idCentro, fechaLlegadaCentro:dis.fechaLlegadaCentro},{where:{idDisCentro:dis.idDisCentro}})
                        .then((respu)=>{
                            res.redirect("/traslado");
                        })
                        .catch((err)=>res.render("error", {error:err}));
                }
            }
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.eliminar = function (req, res){
    Traslado.findByPk(req.params.id)
    .then(async(result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Registro de Traslado con esa informacion."}});
        }else{
            result.destroy();
            res.redirect("/traslado");
        }
    })
    .catch((err)=>res.render("error", {error:err}));
};

exports.listarTraslados = async function (req, res){
    Traslado.findAll({include:[{model:CentroDeVacunacion, as:'centroEnvia'},{model:CentroDeVacunacion, as:'centroRecibe'},{model:LoteProveedor}]})
    .then((result)=>{
        res.render("traslado/listar",{title:"Traslado", ListaTraslados:result});
    })
    .catch((err)=>res.render("error", {error:err}));
};