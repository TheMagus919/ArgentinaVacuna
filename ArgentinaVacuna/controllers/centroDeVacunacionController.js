const {CentroDeVacunacion} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');


exports.listar = async function (req, res){
    CentroDeVacunacion.findAll().then((centro)=> {
        res.render("centroDeVacunacion/ListaDeCentros",{title:"Centro de Vacunacion", listaDeCentros:centro});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editCentro= function (req, res){
    CentroDeVacunacion.findByPk(req.params.id)
    .then(async (centro)=>{
        if(centro == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Centro de Vacunacion con esa informacion."}});
        }
        res.render("centroDeVacunacion/editar",{title:"Centro de Vacunacion", centro:centro});
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putCentro =async function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.provincia != "" || req.body.provincia != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null){
            await CentroDeVacunacion.update({idCentro:req.params.id, nombre:req.body.nombre, provincia:req.body.provincia, direccion:req.body.direccion},{where:{idCentro: req.params.id}})
            .then((result)=> {
                if(result[0] == 1){
                    res.redirect("/centroDeVacunacion");
                }
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    }catch (error) {
            res.render("error", {error:error});
    }
};

exports.crear = function (req, res){
    res.render("centroDeVacunacion/crear",{title:"Centro de Vacunacion"});
};

exports.alta = function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.provincia != "" || req.body.provincia != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null){
            CentroDeVacunacion.create({nombre:req.body.nombre, provincia:req.body.provincia, localidad:req.body.localidad, direccion:req.body.direccion})
             .then((result)=>{
                 res.redirect("/centroDeVacunacion");
             })
             .catch((err) => res.render("error", {error:err}));
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    }catch (error) {
            res.render("error", {error:error});
    }
};

exports.eliminar = function (req, res){
    CentroDeVacunacion.findByPk(req.params.id)
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Centro de Vacunacion con esa informacion."}});
        }
        result.destroy();
        res.redirect("/centroDeVacunacion");
    })
    .catch((err) => res.render("error", {error:err}));
};
