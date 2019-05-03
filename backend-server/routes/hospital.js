// Requires
var express = require('express');
var bcrypt = require('bcrypt');
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializacion
var app = express();

// Require del modelo
var Hospital = require('../models/hospital');

// ===============================================
// Listado de hospitales
// =============================================== 
app.get('/', (req, res, next) => {
    var desde = req.query.desde;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                // Si hay error lo devuelvo
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'ERROR cargando hospitales',
                        errors: err
                    })
                }

                Hospital.count({}, (err, conteo) => {
                    // Si hay error lo devuelvo
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'ERROR contando hospitales',
                            errors: err
                        })
                    }

                    // Si no hay error devuelvo los usuarios
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    })
                })


            }
        )
});

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospitalcon ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
});

// ===============================================
// Crear Hospital
// ===============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // Obtenemos el body del post con la libreria body parser node
    var body = req.body;

    // Creamos el hospital con el modelo hospital hecho con mongoose
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    })

    // Guardamos el hospital en mongodb usando mongoose
    hospital.save((err, hospitalGuardado) => {
        // Si hay error lo devuelvo
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR guardando hospitales',
                errors: err
            })
        }
        // Si no hay error devuelvo hospital creado
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariotoken: req.usuario
        })
    })
});

// ===============================================
// Actualizar Hospitales
// ===============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    // Obtenemos el id del hospital a modificar
    var id = req.params.id;
    // Obtenemos del body del post, los datos para modificar
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR obteniendo hospital por id',
                errors: err
            })
        }

        // Si no existe hospital con el id recibido
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'No existe hospital con el ID enviado',
                errors: err
            })
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        // Guardamos el hospital en mongodb usando mongoose
        hospital.save((err, hospitalGuardado) => {
            // Si hay error lo devuelvo
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'ERROR guardando hospital',
                    errors: err
                })
            }

            // Si no hay error devuelvo hospital creado
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            })
        })
    })
})


// ===============================================
// Borrar hospitales
// ===============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        // Si hay error lo devuelvo
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR al borrar hospital.',
                errors: err
            })
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe hospital con ese ID.',
                errors: err
            })
        }

        // Si no hay error devuelvo hospital borrado
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    })
})


module.exports = app;