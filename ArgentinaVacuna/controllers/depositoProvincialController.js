const {DepositoProvincial} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');


exports.listar = async function (req, res){
    DepositoProvincial.findAll().then((depPro)=> {
        res.render("depositoProvincial/ListaDepositosProvinciales",{title:"Deposito Provincial", listaDeDepositosProvinciales:depPro});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editDepo= function (req, res){
    DepositoProvincial.findByPk(req.params.id)
    .then(async (dep)=>{
        if(dep == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Deposito Provincial con esa informacion."}});
        }
        res.render("depositoProvincial/editar",{title:"Deposito Provincial", dep:dep});
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putDepo =async function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.provincia != "" || req.body.provincia != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null){
            await DepositoProvincial.update({idDepProv:req.params.id, nombre:req.body.nombre, provincia:req.body.provincia, localidad:req.body.localidad, direccion:req.body.direccion},{where:{idDepProv:req.params.id}})
            .then((result)=> {
                if(result[0] == 1){
                    res.redirect("/depositoProvincial");
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
    res.render("depositoProvincial/crear",{title:"Deposito Provincial"});
};

exports.alta = function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.provincia != "" || req.body.provincia != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null){
            DepositoProvincial.create({nombre:req.body.nombre, provincia:req.body.provincia, localidad:req.body.localidad, direccion:req.body.direccion})
             .then((result)=>{
                 res.redirect("/depositoProvincial");
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
    DepositoProvincial.findByPk(req.params.id)
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Deposito Provincial con esa informacion."}});
        }
        result.destroy();
        res.redirect("/depositoProvincial");
    })
    .catch((err) => res.render("error", {error:err}));
};
