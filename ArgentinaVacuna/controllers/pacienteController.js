const {Paciente} = require("../models");
const {Telefono} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
var moment = require('moment');


exports.listar = async function (req, res){
    Paciente.findAll().then((pacientes)=> {
        res.render("paciente/ListarPacientes",{listaDePacientes:pacientes,title:"Pacientes"});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editPaciente= function (req, res){
    Paciente.findByPk(req.params.id)
    .then(async (pac)=>{
        if(pac == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Paciente con esa informacion."}});
        }
        res.render("paciente/actualizar",{pac:pac,title:"Pacientes"});
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putPaciente =async function (req, res){
    try {
        const fechaActual = moment();
        if(req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.mail != "" || req.body.mail != null && req.body.localidad != "" || req.body.localidad != null && req.body.celular != "" || req.body.celular!= null && req.body.celularDeRespaldo != "" || req.body.celularDeRespaldo!= null){
            const fecha = moment(req.body.fechaDeNacimiento);
            if(fecha.date() >= fechaActual.date() && fecha.month()>= fechaActual.month() && fecha.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Nacimiento invalida."}});
            }else if(req.body.genero == "masculino" || req.body.genero == "femenino"){
                await Paciente.update({dniPaciente:req.params.id, nombre:req.body.nombre, apellido:req.body.apellido, fechaDeNacimiento:req.body.fechaDeNacimiento, genero:req.body.genero, mail:req.body.mail, localidad:req.body.localidad, celular:req.body.celular, celularDeRespaldo:req.body.celularDeRespaldo},{where:{dniPaciente: req.params.id}})
                .then((result)=> {
                    if(result[0] == 1){
                        res.redirect("/paciente");
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
        res.render("error", {error:error});
    }
};

exports.crear = function (req, res){
    res.render("paciente/crear",{title:"Pacientes"});
};

exports.alta = function (req, res){
    try {
        const fechaActual = moment();
        if(req.body.dniPaciente != "" || req.body.dniPaciente != null && req.body.nombre != "" || req.body.nombre != null && req.body.apellido != "" || req.body.apellido != null && req.body.fechaDeNacimiento != "" || req.body.fechaDeNacimiento != null && req.body.genero != "" || req.body.genero != null && req.body.mail != "" || req.body.mail != null && req.body.provincia != "" || req.body.provincia != null && req.body.localidad != "" || req.body.localidad != null && req.body.celular != "" || req.body.celular!= null && req.body.celularDeRespaldo != "" || req.body.celularDeRespaldo!= null){
            const fecha = moment(req.body.fechaDeNacimiento);
            if(fecha.date() >= fechaActual.date() && fecha.month()>= fechaActual.month() && fecha.year() >= fechaActual.year()){
                res.render("error", {message:"Bad Request",error:{status:400,stack:"Fecha de Nacimiento invalida."}});
            }else if(req.body.genero == "masculino" || req.body.genero == "femenino"){
                Paciente.create({dniPaciente:req.body.dniPaciente, nombre:req.body.nombre, apellido:req.body.apellido, fechaDeNacimiento:req.body.fechaDeNacimiento, genero:req.body.genero, mail:req.body.mail,provincia:req.body.provincia, localidad:req.body.localidad, celular:req.body.celular, celularDeRespaldo:req.body.celularDeRespaldo})
                .then((result)=>{
                    res.redirect("/paciente");
                })
                .catch((err) => res.render("error", {error:err}));
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
    Paciente.findByPk(req.params.id)
    .then(async (result)=>{
        if(result == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Paciente con esa informacion."}});
        }
        result.destroy();
        res.redirect("/paciente");
    })
    .catch((err) => res.render("error", {error:err}));
};
