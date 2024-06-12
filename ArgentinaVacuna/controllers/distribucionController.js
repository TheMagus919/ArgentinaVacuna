const {DistribucionCentro, TrasladoDeposito, DistribucionDeposito, DepositoProvincial, DepositoNacional, CentroDeVacunacion, LoteProveedor, TipoVacuna, Laboratorio, Descarte} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");

exports.menu = function (req, res){
    res.render("distribucion/menu",{title:"Menu de Distribucion"});
};

//DEPOSITO NACIONAL
exports.listarDistribucionDepoNac = function (req, res){
    TrasladoDeposito.findAll({include:[{model:DepositoNacional},{model:LoteProveedor}]})
    .then((result)=>{
        res.render("distribucion/depositoNacionalDis/listarDis",{title:"Distribucion Deposito Nacional", listaDeDistribucion:result});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.listarLotesDepoNac = async function (req, res){
    try {
        const descartadas = await Descarte.findAll({attributes:['nroLote']});
        const listaDescarte = [];
        for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
        }
        if(descartadas==null || descartadas.length === 0){
            await LoteProveedor.findAll({include:TipoVacuna, where:{cantidadDeVacunas:{[Op.gt]:0},vencidas: false}})
            .then((result)=>{
                if(result == null || result.length === 0){
                    res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ninguna informacion con los datos proporcionados."}});
                }else{
                    res.render("distribucion/depositoNacionalDis/listarLotes",{title:"Distribucion Deposito Nacional", listaDeLotes:result});
                }
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            await LoteProveedor.findAll({include:TipoVacuna, where:{cantidadDeVacunas:{[Op.gt]:0},vencidas: false,nroLote:{[Op.notIn]: listaDescarte}}})
            .then((result)=>{
                if(result == null || result.length === 0){
                    res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ninguna informacion con los datos proporcionados."}});
                }else{
                    res.render("distribucion/depositoNacionalDis/listarLotes",{title:"Distribucion Deposito Nacional", listaDeLotes:result});
                }
            })
            .catch((err) => res.render("error", {error:err}));
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.editDistribucionDepoNac = async function (req, res){
    try {
        const trasladoDep = await TrasladoDeposito.findByPk(req.params.id,{include:[{model:LoteProveedor},{model:DepositoNacional}]});
        const descartadas = await Descarte.findAll({attributes:['nroLote']});
        const listaDescarte = [];
        for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
        }
        if(trasladoDep.LoteProveedor.vencidas == true || Object.values(listaDescarte).includes(trasladoDep.LoteProveedor.nroLote)){
            res.render("error", {message:"Bad Request",error:{status:400,stack:"No se puede editar el registro de distribucion a Deposito Nacional cuando el lote esta vencido o fue descartado."}});
        }else{
            const depositosNac = await DepositoNacional.findAll();
            const lote = await LoteProveedor.findByPk(trasladoDep.nroLote);
            const cantLote = parseInt(lote.cantidadDeVacunas);
            const cantT = parseInt(trasladoDep.cantidadDeVacunas);
            const total = cantLote + cantT;
            res.render("distribucion/depositoNacionalDis/editar",{title:"Distribucion Deposito Nacional", cantidad:total,traslado:trasladoDep,depositos:depositosNac});
        }
        } catch (error) {
        res.render("error", {error:error});
    }
};

exports.putDistribucionDepoNac = async function (req, res){
    const textoN = req.body.idDepNac;
    const partesN = textoN.split('-');
    var depoN = partesN[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const loteP = await LoteProveedor.findByPk(lote);
    const cantidad = parseInt(loteP.cantidadDeVacunas);
    const trasD = await TrasladoDeposito.findByPk(req.params.id);
    const cantidadD = parseInt(trasD.cantidadDeVacunas);
    const cantidadTotal = cantidad + cantidadD;
    try {
        if(req.body.idDepNac!= null || req.body.idDepNac != "" && req.body.nroLote != null || req.body.nroLote != "" &&  req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.fechaDeAdquisicion != null || req.body.fechaDeAdquisicion != ""){
            if(req.body.fechaDeAdquisicion < loteP.fechaDeFabricacion || req.body.fechaDeAdquisicion > loteP.fechaDeVencimiento || loteP.vencidas == true){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Fechas ingresadas son invalidas."}});
            }else {
                    if(req.body.cantidadDeVacunas > cantidadTotal){
                        res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Cantidad de Vacunas ingresadas no son invalidas."}});
                    }else{
                        TrasladoDeposito.update({idDepNac:depoN, nroLote:lote, cantidadDeVacunas:req.body.cantidadDeVacunas, fechaDeAdquisicion:req.body.fechaDeAdquisicion},{where:{idTrasladoDep:req.params.id}});
                        const numero2 = parseInt(req.body.cantidadDeVacunas);
                        const cant = cantidadTotal - numero2;
                            await LoteProveedor.update({nroLote:loteP.nroLote, idLab:loteP.idLab, idTipoVacuna:loteP.idTipoVacuna, tipoDeFrasco:loteP.tipoDeFrasco, nombreComercial:loteP.nombreComercial, cantidadDeVacunas:cant, fechaDeFabricacion:loteP.fechaDeFabricacion, fechaDeVencimiento:loteP.fechaDeVencimiento, fechaDeCompra:loteP.fechaDeCompra},{where:{nroLote:loteP.nroLote}})
                            .then((respu)=>{
                                res.redirect("/distribucion/distribucionDepoNac");
                            })
                            .catch((err)=>res.render("error", {error:err}));
                    }
                }
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.crearDistribucionDepoNac = async function (req, res){
    try {
        const depositosNac = await DepositoNacional.findAll();
        LoteProveedor.findByPk(req.params.id)
        .then((result)=>{
            res.render("distribucion/depositoNacionalDis/distribuir",{title:"Distribucion Deposito Nacional", depositos:depositosNac,lote:result});
        })
        .catch((err) => res.render("error", {error:err}));
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.altaDistribucionDepoNac = async function (req, res){
    const textoN = req.body.idDepNac;
    const partesN = textoN.split('-');
    var depoN = partesN[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    var loteP = await LoteProveedor.findByPk(lote);
    const cantidad = parseInt(loteP.cantidadDeVacunas);

    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
        for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
        }

    try {
        if(req.body.idDepNac!= null || req.body.idDepNac != "" && req.body.nroLote != null || req.body.nroLote != "" &&  req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.fechaDeAdquisicion != null || req.body.fechaDeAdquisicion != ""){
            if(req.body.fechaDeAdquisicion < loteP.fechaDeFabricacion || req.body.fechaDeAdquisicion > loteP.fechaDeVencimiento || loteP.vencidas == true){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Fechas ingresadas son invalidas."}});
            }else if(Object.values(listaDescarte).includes(lote)){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"El Lote a sido descartado."}});
            }else{
                if(req.body.cantidadDeVacunas > cantidad){
                    res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Cantidad de Vacunas ingresadas no son invalidas."}});
                }else{
                    TrasladoDeposito.create({idDepNac:depoN, nroLote:lote, cantidadDeVacunas:req.body.cantidadDeVacunas, fechaDeAdquisicion:req.body.fechaDeAdquisicion});
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidad - numero2;
                        await LoteProveedor.update({nroLote:loteP.nroLote, idLab:loteP.idLab, idTipoVacuna:loteP.idTipoVacuna, tipoDeFrasco:loteP.tipoDeFrasco, nombreComercial:loteP.nombreComercial, cantidadDeVacunas:cant, fechaDeFabricacion:loteP.fechaDeFabricacion, fechaDeVencimiento:loteP.fechaDeVencimiento, fechaDeCompra:loteP.fechaDeCompra},{where:{nroLote:loteP.nroLote}})
                        .then((respu)=>{
                            res.redirect("/distribucion/distribucionDepoNac");
                        })
                        .catch((err)=>res.render("error", {error:err}));
                }
            }
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.consultarDistribucionDepoNac = function (req, res){
    TrasladoDeposito.findByPk(req.params.id,{include:[{model:LoteProveedor,include:[{model:TipoVacuna},{model:Laboratorio}]},{model:DepositoNacional}]})
    .then((result)=>{
        res.render("distribucion/depositoNacionalDis/consultar",{title:"Distribucion Deposito Nacional", distri:result});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.eliminarDistribucionDepoNac = function (req, res){
    TrasladoDeposito.findByPk(req.params.id)
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Registro de Distribucion con esa informacion."}});
        }
        result.destroy();
        res.redirect("/distribucion/distribucionDepoNac");
    })
    .catch((err) => res.render("error", {error:err}));
};


//DEPOSITO PROVINCIAL
exports.listarDistribucionDepoPro = async function (req, res){
    DistribucionDeposito.findAll({include:[{model:DepositoNacional},{model:DepositoProvincial},{model:LoteProveedor}]})
    .then((result)=>{
        res.render("distribucion/depositoProvincialDis/listarDis",{title:"Distribucion Deposito Provincial",listaDeDistribucion:result});
    })
    .catch((err) => res.render("error", {error:err}))
};

exports.listarDepositosNacDepoPro = async function (req, res){
    TrasladoDeposito.findAll({include:{ model: DepositoNacional},where:{cantidadDeVacunas:{[Op.gt]:0}},group: 'nombre'})
    .then((result)=>{
        console.log(result);
        if(result == null || result.length === 0){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ninguna informacion con los datos proporcionados."}});
        }else{
            res.render("distribucion/depositoProvincialDis/listarDepNac",{title:"Distribucion Deposito Provincial",listaDeDepositos:result});
        }
    });
};

exports.listarLotesDepoPro = async function (req, res){
        const descartadas = await Descarte.findAll({attributes:['nroLote']});
        const listaDescarte = [];
        for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
        }
        if(descartadas==null || descartadas.length === 0){
            TrasladoDeposito.findAll({include:{model:LoteProveedor,include:[{model:TipoVacuna}]}, where:[{idDepNac:req.params.id},{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false}], group:'nroLote'})
            .then((result)=>{
                res.render("distribucion/depositoProvincialDis/listarLotes",{title:"Distribucion Deposito Provincial", listaDeLotes:result});
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            TrasladoDeposito.findAll({include:{model:LoteProveedor,include:[{model:TipoVacuna}]}, where:[{idDepNac:req.params.id},{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false, '$LoteProveedor.nroLote$':{[Op.notIn]:listaDescarte}}], group:'nroLote'})
            .then((result)=>{
                res.render("distribucion/depositoProvincialDis/listarLotes",{title:"Distribucion Deposito Provincial", listaDeLotes:result});
            })
            .catch((err) => res.render("error", {error:err}));
        }
};

exports.editDistribucionDepoPro = async function (req, res){
    const depos = await DepositoProvincial.findAll();
    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
        listaDescarte.push(descartadas[i].nroLote);
    }
    await DistribucionDeposito.findByPk(req.params.id,{include:[{model:LoteProveedor,include:[{model:TipoVacuna},{model:Laboratorio}]},{model:DepositoProvincial},{model:DepositoNacional}]})
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun registro de Distribucion hacia Deposito Provincial con esa informacion."}});
        }
        if(Object.values(listaDescarte).includes(result.nroLote)){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se puede editar Distribucion Provincial cuando vencio el Lote Proveedor."}});
        }else{
            await TrasladoDeposito.findOne({include:LoteProveedor,where:[{idDepNac:result.idDepNac},{nroLote:result.nroLote}]})
            .then((resultado)=>{
                if(resultado == null){
                    res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun registro de Distribucion hacia Deposito Provincial con esa informacion."}});
                }
                res.render("distribucion/depositoProvincialDis/editar",{title:"Distribucion Deposito Provincial",distri:result,depositos:depos,cantidad:resultado});
            })
            .catch((err) => res.render("error", {error:err}));
        }
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.putDistribucionDepoPro = async function (req, res){
    const textoN = req.body.idDepNac;
    const partesN = textoN.split('-');
    var depoN = partesN[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoP = req.body.idDepProv;
    const partesP = textoP.split('-');
    var depoP = partesP[0].trim();

    var disDepN = await TrasladoDeposito.findOne({where:[{idDepNac:depoN},{nroLote:lote}]});
    const cantidadDepN = parseInt(disDepN.cantidadDeVacunas);
    var disDepP = await DistribucionDeposito.findByPk(req.params.id);
    const cantidadDepP = parseInt(disDepP.cantidadDeVacunas);
    const cantidadTotal = cantidadDepN + cantidadDepP;

    try {
        if(req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" &&  req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idDepNac!= null || req.body.idDepNac != "" && req.body.fechaDeSalidaDepNac != null || req.body.fechaDeSalidaDepNac != "" && req.body.fechaLlegadaDepProv != null || req.body.fechaLlegadaDepProv != ""){
            if(req.body.fechaDeSalidaDepNac > req.body.fechaLlegadaDepProv || req.body.fechaDeSalidaDepNac < disDepN.fechaDeAdquisicion){
                console.log("entro error 1");
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Fechas ingresadas son invalidas."}});
            }else{
                if(req.body.cantidadDeVacunas > cantidadTotal){
                    console.log("entro error 2");
                    res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Cantidad de Vacunas ingresadas no son invalidas."}});
                }else{
                    await DistribucionDeposito.update({idDepNac:depoN, nroLote:lote, cantidadDeVacunas:req.body.cantidadDeVacunas, idDepProv:depoP, fechaDeSalidaDepNac:req.body.fechaDeSalidaDepNac, fechaLlegadaDepProv:req.body.fechaLlegadaDepProv},{where:{idDisDep:req.params.id}});
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidadTotal - numero2;
                        await TrasladoDeposito.update({idTrasladoDep:disDepN.idTrasladoDep, nroLote:disDepN.nroLote, cantidadDeVacunas:cant, idDepNac:disDepN.idDepNac, fechaDeAdquisicion:disDepN.fechaDeAdquisicion},{where:{idTrasladoDep:disDepN.idTrasladoDep}})
                        .then((result)=> {
                            if(result[0] == 1){
                                res.redirect("/distribucion/distribucionDepoPro");
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

exports.crearDistribucionDepoPro = async function (req, res){
    const depositosProv = await DepositoProvincial.findAll();
    const descartadas = await Descarte.findAll({attributes:['nroLote']});
        const listaDescarte = [];
        for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
        }
    const tras = await TrasladoDeposito.findOne({include:[{model:LoteProveedor},{model:DepositoNacional}],where:[{nroLote:req.params.lote,idDepNac:req.params.id},{cantidadDeVacunas:{[Op.gt]:0}}]})
    res.render("distribucion/depositoProvincialDis/distribuir",{title:"Distribucion Deposito Provincial", distri:tras,depositos:depositosProv});
};

exports.altaDistribucionDepoPro = async function (req, res){
    const textoN = req.body.idDepNac;
    const partesN = textoN.split('-');
    var depoN = partesN[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoP = req.body.idDepProv;
    const partesP = textoP.split('-');
    var depoP = partesP[0].trim();

    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
    }

    const loteComprobar = await LoteProveedor.findByPk(lote); 
    var dis = await TrasladoDeposito.findOne({where:[{idDepNac:depoN},{nroLote:lote}]});
    const cantidad = parseInt(dis.cantidadDeVacunas);
    try {
        if(req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" &&  req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idDepNac != null || req.body.idDepNac != "" && req.body.fechaDeSalidaDepNac != null || req.body.fechaDeSalidaDepNac != "" && req.body.fechaLlegadaDepProv != null || req.body.fechaLlegadaDepProv != ""){
            if(req.body.fechaDeSalidaDepNac > req.body.fechaLlegadaDepProv || req.body.fechaDeSalidaDepNac < dis.fechaDeAdquisicion){
                console.log("entro error 1");
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Fechas ingresadas son invalidas."}});
            }else if(Object.values(listaDescarte).includes(lote)){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"El Lote a sido descartado."}});
            }else{
                if(req.body.cantidadDeVacunas > cantidad){
                    console.log("entro error 2");
                    res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Cantidad de Vacunas ingresadas no son invalidas."}});
                }else{
                    DistribucionDeposito.create({idDepNac:depoN, idDepProv:depoP, nroLote:lote, cantidadDeVacunas:req.body.cantidadDeVacunas, fechaDeSalidaDepNac:req.body.fechaDeSalidaDepNac, fechaLlegadaDepProv:req.body.fechaLlegadaDepProv});
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidad - numero2;
                        await TrasladoDeposito.update({idTrasladoDep:dis.idTrasladoDep, nroLote:dis.nroLote, cantidadDeVacunas:cant, idDepNac:dis.idDepNac, fechaDeAdquisicion:dis.fechaDeAdquisicion},{where:{idTrasladoDep:dis.idTrasladoDep}})
                        .then((respu)=>{
                            res.redirect("/distribucion/distribucionDepoPro");
                        })
                        .catch((err)=>res.render("error", {error:err}));
                }
            }
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.consultarDistribucionDepoPro = function (req, res){
    DistribucionDeposito.findByPk(req.params.id,{include:[{model:LoteProveedor,include:[{model:TipoVacuna},{model:Laboratorio}]},{model:DepositoProvincial},{model:DepositoNacional}]})
    .then((result)=>{
        res.render("distribucion/depositoProvincialDis/consultar",{title:"Distribucion Deposito Provincial", distri:result});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.eliminarDistribucionDepoPro = function (req, res){
    DistribucionDeposito.findByPk(req.params.id)
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Registro de Distribucion con esa informacion."}});
        }
        result.destroy();
        res.redirect("/distribucion/distribucionDepoPro");
    })
    .catch((err) => res.render("error", {error:err}));
};


//CENTRO DE VACUNACION
exports.listarDistribucionCentroVac = async function (req, res){
    DistribucionCentro.findAll({include:[{model:CentroDeVacunacion},{model:DepositoProvincial},{model:LoteProveedor}]})
    .then((result)=>{
        res.render("distribucion/centroVacunacionDis/listarDis",{title:"Distribucion Centro Vacunacion",listaDeDistribucion:result});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.listarDepProCentro = async function (req, res){
    DistribucionDeposito.findAll({include:{ model: DepositoProvincial},where:{cantidadDeVacunas:{[Op.gt]:0}},group: 'nombre'})
    .then((result)=>{
        res.render("distribucion/centroVacunacionDis/listarDepositosPro",{title:"Distribucion Centro Vacunacion", listaDeDepositos:result});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.listarLotesCentro = async function (req, res){
    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
        listaDescarte.push(descartadas[i].nroLote);
    }
    if(descartadas==null || descartadas.length === 0){
        DistribucionDeposito.findAll({include:{model:LoteProveedor,include:[{model:TipoVacuna}]}, where:[{idDepProv:req.params.id},{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false}], group:'nroLote'})
        .then((result)=>{
            res.render("distribucion/centroVacunacionDis/listarLotes",{title:"Distribucion Centro Vacunacion",listaDeLotes:result});
        })
        .catch((err) => res.render("error", {error:err}));
    }else{
        DistribucionDeposito.findAll({include:{model:LoteProveedor,include:[{model:TipoVacuna}]}, where:[{idDepProv:req.params.id},{cantidadDeVacunas:{[Op.gt]:0}},{'$LoteProveedor.vencidas$':false},{'$LoteProveedor.nroLote$':{[Op.notIn]: listaDescarte}}], group:'nroLote'})
        .then((result)=>{
            res.render("distribucion/centroVacunacionDis/listarLotes",{title:"Distribucion Centro Vacunacion",listaDeLotes:result});
        })
        .catch((err) => res.render("error", {error:err}));
    }
    
};

exports.editDistribucionCentroVac = async function (req, res){
    const centros = await CentroDeVacunacion.findAll();
    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
        listaDescarte.push(descartadas[i].nroLote);
    }
    await DistribucionCentro.findByPk(req.params.id,{include:[{model:LoteProveedor,include:[{model:TipoVacuna},{model:Laboratorio}]},{model:DepositoProvincial},{model:CentroDeVacunacion}]})
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun registro de Distribucion hacia Centro de Vacunacion con esa informacion."}});
        }
        if(Object.values(listaDescarte).includes(result.nroLote)){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se puede editar Distribucion Centro de Vacunacion cuando vencio el Lote Proveedor."}});
        }else{
            var ress = await DistribucionDeposito.findOne({include:LoteProveedor,where:[{idDepProv:result.idDepProv},{nroLote:result.nroLote}]});
        res.render("distribucion/centroVacunacionDis/editar",{title:"Distribucion Centro Vacunacion",distri:result,centros:centros,cantidad:ress});
        }
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.putDistribucionCentroVac =async function (req, res){
    const textoDep = req.body.idDepProv;
    const partesD = textoDep.split('-');
    var depo = partesD[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoCentro = req.body.idCentro;
    const partesC = textoCentro.split('-');
    var cen = partesC[0].trim();

    var disDep = await DistribucionDeposito.findOne({where:[{idDepProv:depo},{nroLote:lote}]});
    const cantidadDep = parseInt(disDep.cantidadDeVacunas);
    var disCen = await DistribucionCentro.findByPk(req.params.id);
    const cantidadCen = parseInt(disCen.cantidadDeVacunas);
    const cantidadTotal = cantidadDep + cantidadCen;

    try {
        if(req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" &&  req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentro != null || req.body.idCentro != "" && req.body.fechaDeSalidaDepProv != null || req.body.fechaDeSalidaDepProv != "" && req.body.fechaLlegadaCentro != null || req.body.fechaLlegadaCentro != ""){
            if(req.body.fechaDeSalidaDepProv > req.body.fechaLlegadaCentro || req.body.fechaDeSalidaDepProv < disDep.fechaLlegadaDepProv){
                console.log("entro error 1");
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Fechas ingresadas son invalidas."}});
            }else{
                if(req.body.cantidadDeVacunas > cantidadTotal){
                    console.log("entro error 2");
                    res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Cantidad de Vacunas ingresadas no son invalidas."}});
                }else{
                    await DistribucionCentro.update({idDepProv:depo, nroLote:lote, cantidadDeVacunas:req.body.cantidadDeVacunas, idCentro:cen, fechaDeSalidaDepProv:req.body.fechaDeSalidaDepProv, fechaLlegadaCentro:req.body.fechaLlegadaCentro},{where:{idDisCentro:req.params.id}});
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidadTotal - numero2;
                        await DistribucionDeposito.update({idDisDep:req.body.idDisDep, nroLote:disDep.nroLote, cantidadDeVacunas:cant, idDepNac:disDep.idDepNac, fechaDeSalidaDepNac:disDep.fechaDeSalidaDepNac, idDepProv:disDep.idDepProv, fechaLlegadaDepProv:disDep.fechaLlegadaDepProv},{where:{idDisDep:disDep.idDisDep}})
                        .then((result)=> {
                            if(result[0] == 1){
                                res.redirect("/distribucion/distribucionCentroVac");
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

exports.crearDistribucionCentroVac = async function (req, res){
    const centros = await CentroDeVacunacion.findAll();
    const dist = await DistribucionDeposito.findOne({include:[{model:LoteProveedor},{model:DepositoProvincial}],where:{nroLote:req.params.lote,idDepProv:req.params.id}})
    res.render("distribucion/centroVacunacionDis/distribuir",{title:"Distribucion Centro Vacunacion",centros:centros,distri:dist});
};

exports.altaDistribucionCentroVac = async function (req, res){
    const textoDep = req.body.idDepProv;
    const partesD = textoDep.split('-');
    var depo = partesD[0].trim();

    const textoLote = req.body.nroLote;
    const partesL = textoLote.split('-');
    var lote = partesL[0].trim();

    const textoCentro = req.body.idCentro;
    const partesC = textoCentro.split('-');
    var cen = partesC[0].trim();

    const descartadas = await Descarte.findAll({attributes:['nroLote']});
    const listaDescarte = [];
    for(var i=0;i<descartadas.length;i++){
            listaDescarte.push(descartadas[i].nroLote);
    }

    var dis = await DistribucionDeposito.findOne({where:[{idDisDep:depo},{nroLote:lote}]});
    const cantidad = parseInt(dis.cantidadDeVacunas);
    try {
        if(req.body.idDepProv != null || req.body.idDepProv != "" && req.body.nroLote != null || req.body.nroLote != "" &&  req.body.cantidadDeVacunas != null || req.body.cantidadDeVacunas != "" && req.body.idCentro != null || req.body.idCentro != "" && req.body.fechaDeSalidaDepProv != null || req.body.fechaDeSalidaDepProv != "" && req.body.fechaLlegadaCentro != null || req.body.fechaLlegadaCentro != ""){
            if(req.body.fechaDeSalidaDepProv > req.body.fechaLlegadaCentro || req.body.fechaDeSalidaDepProv < dis.fechaLlegadaDepProv){
                console.log("entro error 1");
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Fechas ingresadas son invalidas."}});
            }else if(Object.values(listaDescarte).includes(lote)){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"El Lote a sido descartado."}});
            }else{
                if(req.body.cantidadDeVacunas > cantidad){
                    console.log("entro error 2");
                    res.render("error", {message:"Bad Request",error:{status:400,stack:"Las Cantidad de Vacunas ingresadas no son invalidas."}});
                }else{
                    DistribucionCentro.create({idDepProv:depo, nroLote:lote, cantidadDeVacunas:req.body.cantidadDeVacunas, idCentro:cen, fechaDeSalidaDepProv:req.body.fechaDeSalidaDepProv, fechaLlegadaCentro:req.body.fechaLlegadaCentro});
                    const numero2 = parseInt(req.body.cantidadDeVacunas);
                    const cant = cantidad - numero2;
                        await DistribucionDeposito.update({idDisDep:dis.idDisDep, nroLote:dis.nroLote, cantidadDeVacunas:cant, idDepNac:dis.idDepNac, fechaDeSalidaDepNac:dis.fechaDeSalidaDepNac, idDepProv:dis.idDepProv, fechaLlegadaDepProv:dis.fechaLlegadaDepProv},{where:{idDisDep:dis.idDisDep}})
                        .then((respu)=>{
                            res.redirect("/distribucion/distribucionCentroVac");
                        })
                        .catch((err)=>res.render("error", {error:err}));
                }
            }
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.consultarDistribucionCentroVac = function (req, res){
    DistribucionCentro.findByPk(req.params.id,{include:[{model:LoteProveedor,include:[{model:TipoVacuna},{model:Laboratorio}]},{model:DepositoProvincial},{model:CentroDeVacunacion}]})
    .then((result)=>{
        res.render("distribucion/centroVacunacionDis/consultar",{title:"Distribucion Centro Vacunacion",distri:result});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.eliminarDistribucionCentroVac = function (req, res){
    DistribucionCentro.findByPk(req.params.id)
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Registro de Distribucion con esa informacion."}});
        }
        result.destroy();
        res.redirect("/distribucion/distribucionCentroVac");
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.listaStock =async  function (req, res){
    try {
        const descartadas = await Descarte.findAll({attributes:['nroLote']});
        const listaDescarte = [];
        for(var i=0;i<descartadas.length;i++){
                listaDescarte.push(descartadas[i].nroLote);
        };
        await DistribucionCentro.findAll({
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
                    attributes: ['provincia']
                }
            ],
            where:[{'$LoteProveedor.nroLote$':{[Op.notIn]:listaDescarte},
                    '$LoteProveedor.vencidas$':false
        }],
            attributes: [
                [sequelize.col('LoteProveedor.TipoVacuna.nombre'), 'tipoVacuna'],
                [sequelize.col('CentroDeVacunacion.provincia'), 'provincia'],
                [sequelize.fn('SUM', sequelize.col('DistribucionCentro.cantidadDeVacunas')), 'stockDisponible']
            ],
            group: ['LoteProveedor.TipoVacuna.nombre', 'CentroDeVacunacion.provincia']
        })
        .then((result)=>{
            if(result == null){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Registro con esa informacion."}});
            }else{
                res.render("distribucion/centroVacunacionDis/stock",{listaStock:result, title:"Stock Disponible"});
            }
        })
        .catch((err) => res.render("error", {error:err}));
    } catch (error) {
        console.error('Error al obtener el stock disponible por tipo de vacuna por provincia:', error);
        throw error;
    }
};
