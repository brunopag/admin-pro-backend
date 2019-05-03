// Requires
var express = require('express');

// Importar fileupload y filesistem
var fileUpload = require('express-fileupload');
var fs = require('fs');

// Modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Inicializacion
var app = express();

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Validacion tipo de coleccion
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(500).json({
            ok: false,
            message: 'Coleccion no valida.'
        })
    }

    // Si no selecciono un archivo muestro error
    if (!req.files) {
        return res.status(500).json({
            ok: false,
            message: 'No ah seleccionado un archivo.'
        })
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones validas
    var extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(500).json({
            ok: false,
            message: 'Tipo de archivo no aceptado.'
        })
    }

    var nombreArchivo = id + '-' + new Date().getMilliseconds() + '.' + extension;

    // Mover el archivo del temporal al path
    var path = './uploads/' + tipo + '/' + nombreArchivo;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo.'
            })
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    })


})

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe usuario.'
                })
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al actualizar usuario.'
                    })
                }

                usuarioActualizado.password = ':)';

                res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo de usuario subido correctamente.',
                    usuario: usuarioActualizado
                })
            })

        })
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe medico.'
                })
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al actualizar medico.'
                    })
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo de medico subido correctamente.',
                    medico: medicoActualizado
                })
            })
        })
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe hospital.'
                })
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al actualizar hospital.'
                    })
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo de medico subido correctamente.',
                    hospital: hospitalActualizado
                })
            })
        })
    }
}

module.exports = app;