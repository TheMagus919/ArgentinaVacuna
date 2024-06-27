const {Descarte , AgenteDeSalud, LoteProveedor, DistribucionCentro, DistribucionDeposito} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');

exports.crear = function (req, res){
    res.render("descarte/descartar",{title:"Descarte"});
};

exports.alta = async function (req, res){
    if(req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nroLote != null || req.body.nroLote != "" && req.body.formaDescarte != "" || req.body.formaDescarte != null && req.body.empresaResponsable != "" || req.body.empresaResponsable != null && req.body.motivo != "" || req.body.motivo != null && req.body.fechaDeDescarte != "" || req.body.fechaDeDescarte != null){
        const AgenteExistente = await AgenteDeSalud.findByPk(req.body.dniAgente);
        const LoteExistente = await LoteProveedor.findByPk(req.body.nroLote);
        if(AgenteExistente===null && LoteExistente===null){
            Descarte.create({ dniAgente:req.body.dniAgente, nroLote:req.body.nroLote, cantidadDeVacunas:resultado.cantidadDeVacunas, formaDescarte:req.body.formaDescarte, empresaResponsable:req.body.empresaResponsable, motivo:req.body.motivo, fechaDeDescarte:req.body.fechaDeDescarte})
            .then((result)=>{
                if(result){
                    DistribucionDeposito.update({cantidadDeVacunas:0},{where:{nroLote:req.body.nroLote}})
                    DistribucionCentro.update({cantidadDeVacunas:0},{where:{nroLote:req.body.nroLote}});
                    res.redirect("../");
                }else{
                    res.render("error", {message:"Internal Server Error",error:{status:500,stack:"No se pudo realizar el Descarte."}});
                }
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            res.render("error", {message:"Not Found",error:{status:404,stack:"Responsable o Lote no encontrado"}});
            }
    }else{
        res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos o incompletos."}});
    }
};
