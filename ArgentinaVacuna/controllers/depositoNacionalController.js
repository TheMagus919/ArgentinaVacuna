const {DepositoNacional} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');


exports.listar = async function (req, res){
    DepositoNacional.findAll().then((depNac)=> {
        res.render("depositoNacional/ListaDepositosNacionales",{title:"Deposito Nacional", listaDeDepositosNacionales:depNac});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editDepo= function (req, res){
    DepositoNacional.findByPk(req.params.id)
    .then(async (dep)=>{
        if(dep == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Deposito Nacional con esa informacion."}});
        }
        res.render("depositoNacional/editar",{dep:dep, title:"Deposito Nacional"});
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putDepo =async function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.provincia != "" || req.body.provincia != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null){
            await DepositoNacional.update({idDepNac:req.params.id, nombre:req.body.nombre, provincia:req.body.provincia, localidad:req.body.localidad, direccion:req.body.direccion},{where:{idDepNac:req.params.id}})
            .then((result)=> {
                if(result[0] == 1){
                    res.redirect("/depositoNacional");
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
    res.render("depositoNacional/crear",{title:"Deposito Nacional"});
};

exports.alta = function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.provincia != "" || req.body.provincia != null && req.body.localidad != "" || req.body.localidad != null && req.body.direccion != "" || req.body.direccion != null){
             DepositoNacional.create({nombre:req.body.nombre, provincia:req.body.provincia, localidad:req.body.localidad, direccion:req.body.direccion})
             .then((result)=>{
                 res.redirect("/depositoNacional");
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
    DepositoNacional.findByPk(req.params.id)
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Deposito Nacional con esa informacion."}});
        }
        result.destroy();
        res.redirect("/depositoNacional");
    })
    .catch((err) => res.render("error", {error:err}));
};
