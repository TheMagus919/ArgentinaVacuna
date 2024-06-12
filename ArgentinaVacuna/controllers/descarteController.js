const {Descarte , AgenteDeSalud, LoteProveedor} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');

exports.crear = function (req, res){
    res.render("descarte/descartar",{title:"Descarte"});
};

exports.alta = function (req, res){
    if(req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nroLote != null || req.body.nroLote != "" && req.body.formaDescarte != "" || req.body.formaDescarte != null && req.body.empresaResponsable != "" || req.body.empresaResponsable != null && req.body.motivo != "" || req.body.motivo != null && req.body.fechaDeDescarte != "" || req.body.fechaDeDescarte != null){
        AgenteDeSalud.findByPk(req.body.dniAgente).then((result)=> {
            console.log(result)
            if(result != null){
                LoteProveedor.findByPk(req.body.nroLote).then((resultado)=> {
                    if(resultado!=null){
                        Descarte.create({ dniAgente:req.body.dniAgente, nroLote:req.body.nroLote, formaDescarte:req.body.formaDescarte, empresaResponsable:req.body.empresaResponsable, motivo:req.body.motivo, fechaDeDescarte:req.body.fechaDeDescarte})
                        .then((result)=>{
                            res.redirect("../");
                        })
                        .catch((err) => res.render("error", {error:err}));
                    }else{
                        res.render("error", {message:"Bad Request",error:{status:400,stack:"Lote no encontrado"}});
                    }
                }).catch((err) => res.render("error", {error:err}));
            }else{
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Responsable no encontrado"}});
            }
        }).catch((err) => res.render("error", {error:err}));
    }else{
        res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos"}});
    }
};
