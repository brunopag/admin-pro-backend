// Requires
var express = require('express');
var bcrypt = require('bcrypt');
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializacion
var app = express();

// Require del modelo
var Medico = require('../models/medico');

// ===============================================
// Listado de medicos
// =============================================== 
app.get('/', (req, res) => {
    var desde = req.query.desde;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                // Si hay error lo devuelvo
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'ERROR cargando medicos',
                        errors: err
                    })
                }

                Medico.count({}, (err, conteo) => {
                    // Si hay error lo devuelvo
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'ERROR contando medicos',
                            errors: err
                        })
                    }
                    // Si no hay error devuelvo los usuarios
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    })
                })


            }
        )
});


// ==========================================
// Obtener Medico por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Medico.findById(id)
        .populate('usuario', 'nombre img email')
        .populate('hospital', 'nombre img')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + 'no existe',
                    errors: { message: 'No existe un medico ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                medico: medico
            });
        })
});


// ===============================================
// Crear Medico
// ===============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // Obtenemos el body del post con la libreria body parser node
    var body = req.body;

    // Creamos el medico con el modelo hospital hecho con mongoose
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    })

    // Guardamos el medico en mongodb usando mongoose
    medico.save((err, medicoGuardado) => {
        // Si hay error lo devuelvo
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR guardando medicos',
                errors: err
            })
        }
        // Si no hay error devuelvo medico creado
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        })
    })
});


// ===============================================
// Actualizar Medico
// ===============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    // Obtenemos el id del medico a modificar
    var id = req.params.id;
    // Obtenemos del body del post, los datos para modificar
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR obteniendo medico por id',
                errors: err
            })
        }

        // Si no existe medico con el id recibido
        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'No existe medico con el ID enviado',
                errors: err
            })
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        // Guardamos el medico en mongodb usando mongoose
        medico.save((err, medicoGuardado) => {
            // Si hay error lo devuelvo
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'ERROR guardando medico',
                    errors: err
                })
            }

            // Si no hay error devuelvo hospital creado
            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            })
        })
    })
});


// ===============================================
// Borrar Medico
// ===============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        // Si hay error lo devuelvo
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR al borrar medico.',
                errors: err
            })
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe medico con ese ID.',
                errors: err
            })
        }

        // Si no hay error devuelvo medico borrado
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        })
    })
});


module.exports = app;