const {AgenteDeSalud} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");


exports.listar = async function (req, res){
    AgenteDeSalud.findAll().then((ag)=> {
        res.render("agenteDeSalud/ListarAgentes",{listaDeAgentes:ag, title:"Agentes de Salud"});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editAgente= function (req, res){
    AgenteDeSalud.findByPk(req.params.id)
    .then(async (ag)=>{
        if(ag == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Agente de Salud con esa informacion."}});
        }
        res.render("agenteDeSalud/editar",{ag:ag, title:"Agentes de Salud"});
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putAgente =async function (req, res){
    try {
        const fechaActual = moment();
        if(req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.mail != "" || req.body.mail != null && req.body.matricula != "" || req.body.matricula != null){
            const fecha = moment(req.body.fechaDeNacimiento);
            if(fecha.date() >= fechaActual.date() && fecha.month()>= fechaActual.month() && fecha.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Nacimiento invalida."}});
            }else if(req.body.genero == "masculino" || req.body.genero == "femenino"){
                await AgenteDeSalud.update({dniAgente:req.params.id, nombre:req.body.nombre, apellido:req.body.apellido, fechaDeNacimiento:req.body.fechaDeNacimiento, genero:req.body.genero, mail:req.body.mail, matricula:req.body.matricula},{where:{dniAgente: req.params.id}})
                .then((result)=> {
                    if(result[0] == 1){
                        res.redirect("/agenteDeSalud");
                    }
                })
                .catch((err) => res.render("error", {error:err}));
            }else{
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
            }
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    } catch (error) {
        res.status(500).json({ message: "Error al editar un Agente de Salud." });
    }
};

exports.crear = function (req, res){
    res.render("agenteDeSalud/crear",{title:"Agentes de Salud"});
};

exports.alta = function (req, res){
    try {
        const fechaActual = moment();
        if(req.body.dniAgente != "" || req.body.dniAgente != null && req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.mail != "" || req.body.mail != null && req.body.matricula != "" || req.body.matricula != null){
            const fecha = moment(req.body.fechaDeNacimiento);
            if(fecha.date() >= fechaActual.date() && fecha.month()>= fechaActual.month() && fecha.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Nacimiento invalida."}});
            }else if(req.body.genero == "masculino" || req.body.genero == "femenino"){
                AgenteDeSalud.findByPk(req.body.dniAgente).then((result)=>{
                    if(result){
                        res.render("error", {message:"Bad Request",error:{status:400,stack:"El Agente de Salud ya existe."}});
                    }else{
                        AgenteDeSalud.create({dniAgente:req.body.dniAgente, nombre:req.body.nombre, apellido:req.body.apellido, fechaDeNacimiento:req.body.fechaDeNacimiento, genero:req.body.genero, mail:req.body.mail, matricula:req.body.matricula})
                        .then((result)=>{
                        res.redirect("/agenteDeSalud");
                        })
                        .catch((err) => res.render("error", {error:err}));
                    }
                });
                
            }else{
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
            }
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.eliminar = function (req, res){
    AgenteDeSalud.findByPk(req.params.id)
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Agente de Salud con esa informacion."}});
        }
        result.destroy();
        res.redirect("/agenteDeSalud");
    })
    .catch((err) => res.render("error", {error:err}));
};
