const {Laboratorio, LoteProveedor} = require("../models");
const {Op} = require('sequelize');
const sequelize = require('sequelize');
const mysql = require('mysql2');
const moment = require("moment");


exports.listar = function (req, res){
    Laboratorio.findAll().then((lab)=> {
        res.render("laboratorio/ListaLaboratorios",{listaDeLaboratorios:lab, title:"Laboratorio"});
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.editLaboratorio= function (req, res){
    Laboratorio.findByPk(req.params.id)
    .then(async (lab)=>{
        if(lab == null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Laboratorio con esa informacion."}});
        }else{
            res.render("laboratorio/actualizar",{lab:lab, title:"Laboratorio"});
        }
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putLaboratorio = async function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.pais != "" || req.body.pais != null && req.body.provincia != "" || req.body.provincia != null && req.body.telefono != "" || req.body.telefono != null && req.body.direccion != "" || req.body.direccion != null){
            await Laboratorio.update({idLab:req.params.id, nombre:req.body.nombre, pais:req.body.pais, provincia:req.body.provincia, telefono:req.body.telefono, direccion:req.body.direccion},{where:{idLab: req.params.id}})
            .then((result)=> {
                if(result[0] == 1){
                    res.redirect("/laboratorio");
                }else{
                    res.render("error", {message:"Internal Server Error",error:{status:500,stack:"El Laboratorio no se pudo editar."}});
                }
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos o incompletos."}});
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.crear = function (req, res){
    res.render("laboratorio/crear",{title:"Laboratorio"});
};

exports.alta = async function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.pais != "" || req.body.pais != null && req.body.provincia != "" || req.body.provincia != null && req.body.email != "" || req.body.email != null && req.body.telefono != "" || req.body.telefono != null && req.body.direccion != "" || req.body.direccion != null){
            const MailExistente = await Laboratorio.findOne({where:{email:req.body.email}});
            if(MailExistente===null){
                Laboratorio.create({nombre:req.body.nombre, pais:req.body.pais, provincia:req.body.provincia, email:req.body.email, telefono:req.body.telefono, direccion:req.body.direccion})
                .then((result)=>{
                    if(result){
                        res.redirect("/laboratorio");
                    }else{
                        res.render("error", {message:"Internal Server Error",error:{status:500,stack:"El Laboratorio no se pudo crear."}});
                    }
                })
                .catch((err) => res.render("error", {error:err}));
            }else{
                res.render("error", {message:"Bad Request",error:{status:400,stack:"El Email ingresado es invalido."}});
            }
            
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos o incompletos."}});
        }
    } catch (error) {
        res.render("error", {error:error});
    }
};

exports.eliminar = function (req, res){
    Laboratorio.findByPk(req.params.id)
    .then(async (result)=>{
        if(result==null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Laboratorio con esa informacion."}});
        }else{
            result.destroy();
            res.redirect("/laboratorio");
        }
    })
    .catch((err) => res.render("error", {error:err}));
};

exports.listarVacunasXLaboratorio = function (req, res){
    try {
        const inicio = moment(req.body.fechaInicio);
        const fin = moment(req.body.fechaFin);
        const rango = req.body.fechaInicio+" - "+ req.body.fechaFin
        LoteProveedor.findAll({
            where: {
                fechaDeCompra: {
                    [Op.between]: [inicio, fin]
                }
            },
            include: [{
                model: Laboratorio,
                attributes: ['nombre']
            }],
            attributes: [
                [sequelize.fn('SUM', sequelize.col('cantidadDeVacunas')), 'cantidadDeVacunas'],
            ],
            group: ['Laboratorio.nombre']
        })
        .then((result)=>{
            if(result==null){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Laboratorio con esa informacion."}});
            }else{
                res.render("laboratorio/listaVacunas",{title:"Laboratorio",rango:rango, listaLabs:result});
            }
        })
        .catch((err) => res.render("error", {error:err}));

    } catch (error) {
        res.render("error", {error:error});
    }
}