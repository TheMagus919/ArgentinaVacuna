const {TipoVacuna} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');


exports.listar = async function (req, res){
    TipoVacuna.findAll().then((tip)=> {
        res.render("tipoVacuna/ListarTiposDeVacunas",{title:"Tipo de Vacuna", listaDeTipos:tip});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editTipo= function (req, res){
    TipoVacuna.findByPk(req.params.id)
    .then(async (tip)=>{
        if(tip == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Tipo de Vacuna con esa informacion."}});
        }
        res.render("tipoVacuna/editar",{title:"Tipo de Vacuna", tip:tip});
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putTipo =async function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null){
            await TipoVacuna.update({nombre:req.body.nombre},{where:{idTipoVacuna: req.params.id}})
            .then((result)=> {
                if(result[0] == 1){
                    res.redirect("/tipoVacuna");
                }
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.crear = function (req, res){
    res.render("tipoVacuna/crear",{title:"Tipo de Vacuna"});
};

exports.alta = function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null){
            TipoVacuna.create({nombre:req.body.nombre})
            .then((result)=>{
                res.redirect("/tipoVacuna");
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.eliminar = function (req, res){
    TipoVacuna.findByPk(req.params.id)
    .then(async (result)=>{
        if(ag == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Tipo de Vacuna con esa informacion."}});
        }
        result.destroy();
        res.redirect("/tipoVacuna");
    })
    .catch((err) => res.render("error", {error:err}));
};
