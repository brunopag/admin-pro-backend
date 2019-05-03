// Requires
var express = require('express');

// Inicializacion
var app = express();

// Modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ===============================================
// Busqueda por tabla ESPECIFICA
// ===============================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    if (String(tabla) == 'hospitales') {
        promesa = busquedaHospitales(regex);
    } else if (tabla == 'medicos') {
        promesa = busquedaMedicos(regex);
    } else if (tabla == 'usuarios') {
        promesa = busquedaUsuarios(regex);
    } else {
        return res.status(400).json({
            ok: false,
            mensaje: 'No existe tabla.'
        });
    }

    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            // Al ponerle corchetes a tabla lo toma como una variable
            [tabla]: data
        });
    })
});



// ===============================================
// Busqueda GENERAL
// ===============================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        busquedaHospitales(regex),
        busquedaMedicos(regex),
        busquedaUsuarios(regex)
    ]).then(resultados => {
        res.status(200).json({
            ok: true,
            hospitales: resultados[0],
            medicos: resultados[1],
            usuarios: resultados[2]
        });
    });

});

function busquedaHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', ' nombre email img')
            .exec(
                (err, hospitales) => {
                    if (err) {
                        reject('Ocurrio un error obteniendo hospitales', err);
                    }

                    resolve(hospitales);

                })
    });
}

function busquedaMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital', 'nombre')
            .exec(
                (err, medicos) => {
                    if (err) {
                        reject('Ocurrio un error obteniendo medicos', err);
                    }

                    resolve(medicos);
                });
    });
}

function busquedaUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Ocurrio un error obteniendo usuarios', err);
                }

                resolve(usuarios);
            })
    });
}

module.exports = app;