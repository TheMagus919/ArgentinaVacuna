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
        }
        res.render("laboratorio/actualizar",{lab:lab, title:"Laboratorio"});
        }
    )
    .catch((err) => res.render("error", {error:err}));
};

exports.putLaboratorio =async function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.pais != "" || req.body.pais != null && req.body.provincia != "" || req.body.provincia != null && req.body.email != "" || req.body.email != null && req.body.telefono != "" || req.body.telefono != null && req.body.direccion != "" || req.body.direccion != null){
            await Laboratorio.update({idLab:req.params.id, nombre:req.body.nombre, pais:req.body.pais, provincia:req.body.provincia, email:req.body.email, telefono:req.body.telefono, direccion:req.body.direccion},{where:{idLab: req.params.id}})
            .then((result)=> {
                if(result[0] == 1){
                    res.redirect("/laboratorio");
                }
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    } catch (error) {
        res.status(500).json({ message: "Error al editar un Laboratorio." });
    }
};

exports.crear = function (req, res){
    res.render("laboratorio/crear",{title:"Laboratorio"});
};

exports.alta = function (req, res){
    try {
        if(req.body.nombre != "" || req.body.nombre != null && req.body.pais != "" || req.body.pais != null && req.body.provincia != "" || req.body.provincia != null && req.body.email != "" || req.body.email != null && req.body.telefono != "" || req.body.telefono != null && req.body.direccion != "" || req.body.direccion != null){
            Laboratorio.create({nombre:req.body.nombre, pais:req.body.pais, provincia:req.body.provincia, email:req.body.email, telefono:req.body.telefono, direccion:req.body.direccion})
            .then((result)=>{
                res.redirect("/laboratorio");
            })
            .catch((err) => res.render("error", {error:err}));
        }else{
            res.render("error", {message:"Bad Request",error:{status:400,stack:"Datos invalidos."}});
        }
    } catch (error) {
        res.status(500).json({ message: "Error al editar un Laboratorio." });
    }
};

exports.eliminar = function (req, res){
    Laboratorio.findByPk(req.params.id)
    .then(async (result)=>{
        if(result==null){
            res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Laboratorio con esa informacion."}});
        }
        result.destroy();
        res.redirect("/laboratorio");
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
                attributes: ['nombre'] // Selecciona solo el atributo nombre del laboratorio
            }],
            attributes: [
                [sequelize.fn('SUM', sequelize.col('cantidadDeVacunas')), 'cantidadDeVacunas'], // Cuenta las filas de TrasladoDeposito para obtener la cantidad de vacunas
            ],
            group: ['Laboratorio.nombre'] // Agrupa por el nombre del laboratorio
        })
        .then((result)=>{
            console.log(result);
            if(result==null){
                res.render("error", {message:"Not Found",error:{status:404,stack:"No se encontro ningun Laboratorio con esa informacion."}});
            }else{
                res.render("laboratorio/listaVacunas",{title:"Laboratorio",rango:rango, listaLabs:result});
            }
        })
        .catch((err) => res.render("error", {error:err}));

    } catch (error) {
        console.error('Error al obtener la cantidad de vacunas por laboratorio:', error);
        throw error;
    }
}