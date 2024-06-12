const {LoteProveedor, Laboratorio, TipoVacuna, DistribucionCentro, DistribucionDeposito, TrasladoDeposito, Aplicacion, Descarte} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");


exports.listar =async function (req, res){
    LoteProveedor.findAll({include:[{model:Laboratorio},{model:TipoVacuna}]})
    .then((lotes)=>{
        res.render("loteProveedor/ListaLotesProveedores",{title:"Lote Proveedor",listaDeLotesProveedores:lotes});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editLote= function (req, res){
    LoteProveedor.findByPk(req.params.id,{include:[{model:Laboratorio},{model:TipoVacuna}]})
    .then(async (lote)=>{
        if(lote==null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Lote Proveedor con esa informacion."}});
        }
        var Labs =await Laboratorio.findAll();
        var Tipos =await TipoVacuna.findAll();
        res.render("loteProveedor/actualizar",{title:"Lote Proveedor",lote:lote,labs:Labs,tipos:Tipos});
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putLote =async function (req, res){
    try {
        if(req.body.idLab != "" || req.body.idLab != null && req.body.idTipoVacuna != "" || req.body.idTipoVacuna != null && req.body.tipoDeFrasco != "" || req.body.tipoDeFrasco != null && req.body.nombreComercial != "" || req.body.nombreComercial != null && req.body.cantidadDeVacunas != "" || req.body.cantidadDeVacunas != null && req.body.fechaDeFabricacion != "" || req.body.fechaDeFabricacion != null && req.body.fechaDeVencimiento != "" || req.body.fechaDeVencimiento != null && req.body.fechaDeCompra != "" || req.body.fechaDeCompra != null){
            const fechaActual = moment();
            const fechaFab = moment(req.body.fechaDeFabricacion);
            const fechaCom = moment(req.body.fechaDeCompra);
            const fechaVen = moment(req.body.fechaDeVencimiento);
            if(fechaFab.date() >= fechaActual.date() && fechaFab.month()>= fechaActual.month() && fechaFab.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Fabricacion incorrecta."}});
            }else if(fechaCom.date() >= fechaActual.date() && fechaCom.month()>= fechaActual.month() && fechaCom.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Compra incorrecta."}});
            }else{
                await LoteProveedor.update({nroLote:req.params.id, idLab:req.body.idLab, idTipoVacuna:req.body.idTipoVacuna, tipoDeFrasco:req.body.tipoDeFrasco, nombreComercial:req.body.nombreComercial, cantidadDeVacunas:req.body.cantidadDeVacunas, fechaDeFabricacion:req.body.fechaDeFabricacion, fechaDeVencimiento:req.body.fechaDeVencimiento, fechaDeCompra:req.body.fechaDeCompra},{where:{nroLote: req.params.id}})
                .then((result)=> {
                    if(result[0] == 1){
                        res.redirect("/loteProveedor");
                    }
                })
                .catch((err) => res.render("error", {error:err}));
            }
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }   
    } catch (error) {
        res.status(500).json({ message: "Error al editar un Lote Proveedor." });    
    }
    
};

exports.crear = async function (req, res){
    var Labs =await Laboratorio.findAll();
    var Tipos =await TipoVacuna.findAll();
    res.render("loteProveedor/crear",{title:"Lote Proveedor",labs:Labs,tipos:Tipos});
};

exports.alta = async function (req, res){
    try {
        if(req.body.nroLote != "" || req.body.nroLote != null && req.body.idLab != "" || req.body.idLab != null && req.body.idTipoVacuna != "" || req.body.idTipoVacuna != null && req.body.tipoDeFrasco != "" || req.body.tipoDeFrasco != null && req.body.nombreComercial != "" || req.body.nombreComercial != null && req.body.cantidadDeVacunas != "" || req.body.cantidadDeVacunas != null && req.body.fechaDeFabricacion != "" || req.body.fechaDeFabricacion != null && req.body.fechaDeVencimiento != "" || req.body.fechaDeVencimiento != null && req.body.fechaDeCompra != "" || req.body.fechaDeCompra != null){
            const fechaActual = moment();
            const fechaFab = moment(req.body.fechaDeFabricacion);
            const fechaCom = moment(req.body.fechaDeCompra);
            const fechaVen = moment(req.body.fechaDeVencimiento);
            if(fechaFab.date() >= fechaActual.date() && fechaFab.month()>= fechaActual.month() && fechaFab.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Fabricacion incorrecta."}});
            }else if(fechaCom.date() >= fechaActual.date() && fechaCom.month()>= fechaActual.month() && fechaCom.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Compra incorrecta."}});
            }else{
                LoteProveedor.findByPk(req.body.nroLote).then((result)=>{
                    if(result){
                        res.render("error", {message:"Bad Request",error:{status:400,stack:"El Lote ya existe."}});
                    }else{
                        LoteProveedor.create({nroLote:req.body.nroLote, idLab:req.body.idLab, idTipoVacuna:req.body.idTipoVacuna, tipoDeFrasco:req.body.tipoDeFrasco, nombreComercial:req.body.nombreComercial, cantidadDeVacunas:req.body.cantidadDeVacunas, fechaDeFabricacion:req.body.fechaDeFabricacion, fechaDeVencimiento:req.body.fechaDeVencimiento, fechaDeCompra:req.body.fechaDeCompra})
                        .then((result)=>{
                            res.redirect("/loteProveedor");
                        })
                        .catch((err) => res.render("error", {error:err}));
                    }
                });
            }
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }   
    } catch (error) {
        res.status(500).json({ message: "Error al añadir nuevo Lote Proveedor." });    
    }
};

exports.eliminar = function (req, res){
    LoteProveedor.findByPk(req.params.id)
    .then(async (result)=>{
        if(result==null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Lote Proveedor con esa informacion."}});
        }
        result.destroy();
        res.redirect("/loteProveedor");
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.listadoLotesXTipo = async function (req, res){
    try {
        await LoteProveedor.findAll({
            attributes: ['nroLote', 'cantidadDeVacunas', 'vencidas'],
            include: [
              {
                model: TipoVacuna,
                attributes: ['nombre']
              },
              {
                model: DistribucionDeposito,
                attributes: ['cantidadDeVacunas']
              },
              {
                model: DistribucionCentro,
                attributes: ['cantidadDeVacunas']
              },
              {
                model: TrasladoDeposito,
                attributes: ['cantidadDeVacunas']
              },
              {
                model: Aplicacion,
                attributes: ['nroLote']
              },
              {
                model: Descarte,
                attributes: ['nroLote']
              }
            ]
          })
          .then(async(result)=>{
            const agrupadosPorTipoVacuna = result.reduce((acc, lote) => {
                const tipoVacuna = lote.TipoVacuna.nombre;
          
                if (!acc[tipoVacuna]) {
                  acc[tipoVacuna] = {
                    nombre: tipoVacuna,
                    almacenadasEnProvincia: 0,
                    almacenadasEnCentro: 0,
                    almacenadasEnNacion: 0,
                    aplicadas: 0,
                    descartadas: 0,
                    vencidas: 0
                  };
                }
          
                const almacenadasEnProvincia = (lote.DistribucionDepositos || []).reduce((acc, distribucion) => acc + distribucion.cantidadDeVacunas, 0);
                const almacenadasEnCentro = (lote.DistribucionCentros || []).reduce((acc, distribucion) => acc + distribucion.cantidadDeVacunas, 0);
                const almacenadasEnNacion = (lote.TrasladoDepositos || []).reduce((acc, traslado) => acc + traslado.cantidadDeVacunas, 0);
                const aplicadas = (lote.Aplicacions || []).length;
                const descartadas = (lote.Descartes || []).length;
                const vencidas = lote.vencidas === true ? lote.cantidadDeVacunas : 0;
          
                acc[tipoVacuna].almacenadasEnProvincia += almacenadasEnProvincia;
                acc[tipoVacuna].almacenadasEnCentro += almacenadasEnCentro;
                acc[tipoVacuna].almacenadasEnNacion += almacenadasEnNacion;
                acc[tipoVacuna].aplicadas += aplicadas;
                acc[tipoVacuna].descartadas += descartadas;
                acc[tipoVacuna].vencidas += vencidas;
          
                return acc;
              }, {});
              res.render("loteProveedor/listaDeLotes",{listaLotes:agrupadosPorTipoVacuna, title:"Lote Proveedor"});
          });
    } catch (error) {
        console.error('Error al obtener el listado de lotes de proveedores por tipo de vacuna y estado:', error);
        throw error;
    }
};

exports.listarVacunasVencidas = function (req, res){
    try {
        LoteProveedor.findAll({
          where: {
            vencidas: true
          },
          attributes: ['nroLote', 'cantidadDeVacunas', 'idTipoVacuna'],
          include: [
            {
              model: TipoVacuna,
              attributes: ['nombre']
            },
            {
              model: DistribucionDeposito,
              attributes: ['cantidadDeVacunas']
            },
            {
              model: DistribucionCentro,
              attributes: ['cantidadDeVacunas']
            },
            {
              model: Descarte,
              required: false,
              attributes: ['nroLote']
            }
          ]
        })
        .then((result)=>{
            const lotesNoDescartados = result.filter(lote => lote.Descartes.length === 0);
            const resultados = lotesNoDescartados.map(lote => {
                const enProvincia = (lote.DistribucionDepositos || []).reduce((acc, distribucion) => acc + distribucion.cantidadDeVacunas, 0);
                const enCentro = (lote.DistribucionCentros || []).reduce((acc, distribucion) => acc + distribucion.cantidadDeVacunas, 0);
          
                return {
                  nroLote: lote.nroLote,
                  tipoVacuna: lote.TipoVacuna.nombre,
                  enProvincia,
                  enCentro,
                  vencidas: lote.cantidadDeVacunas - enProvincia - enCentro
                };
              });
            res.render("loteProveedor/listarVencidas",{listaVacunasVencidas:resultados,  title:"Lote Proveedor"});
        })
        .catch((err) => res.render("error", {error:err}));
        
      } catch (error) {
        console.error('Error al obtener el listado de lotes de proveedores:', error);
      }
};