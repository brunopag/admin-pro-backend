// Requires
var express = require('express');
var bcrypt = require('bcrypt');
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializacion
var app = express();

// Require del modelo
var Usuario = require('../models/usuario');

// ===============================================
// Obterer lista de usuario
// ===============================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde;
    desde = Number(desde);

    // Query de usuarios a traves de mongoose, traigo todo menos el password
    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                // Si hay error lo devuelvo
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'ERROR cargando usuarios',
                        errors: err
                    })
                }

                Usuario.count({}, (err, conteo) => {
                    // Si hay error lo devuelvo
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'ERROR cargando usuarios',
                            errors: err
                        })
                    }
                    // Si no hay error devuelvo los usuarios
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    })
                })



            })

});


// ===============================================
// Actualizar usuario
// ===============================================
app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminRole_o_mismoUsuario], (req, res) => {
    var id = req.params.id;
    // Obtenemos el body del post con la libreria body parser node
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        // Si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR obteniendo usuarios por id',
                errors: err
            })
        }

        // Si no existe usuario con el id recibido
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'No existe usuario con el ID enviado',
                errors: err
            })
        }

        usuario.nombre = body.nombre;
        usuario.role = body.role;
        usuario.email = body.email;

        // Guardamos el usuario en mongodb usando mongoose
        usuario.save((err, usuarioGuardado) => {
            // Si hay error lo devuelvo
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'ERROR guardando usuarios',
                    errors: err
                })
            }
            // Oculto el password en la respuesta
            usuarioGuardado.password = ':)';

            // Si no hay error devuelvo usuario creado
            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            })
        })

    })

})



// ===============================================
// Crear nuevo usuario
// ===============================================  
app.post('/', (req, res) => {
    // Obtenemos el body del post con la libreria body parser node
    var body = req.body;

    // Creamos el usuario con el modelo usuario hecho con mongoose
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    // Guardamos el usuario en mongodb usando mongoose
    usuario.save((err, usuarioGuardado) => {
        // Si hay error lo devuelvo
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR guardando usuarios',
                errors: err
            })
        }
        // Si no hay error devuelvo usuario creado
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        })
    })

})

// ===============================================
// Borrar Usuario
// ===============================================  
app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminRole], (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        // Si hay error lo devuelvo
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR al borrar usuario.',
                errors: err
            })
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe usuario con ese ID.',
                errors: err
            })
        }

        // Si no hay error devuelvo usuario creado
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })
    })
})



module.exports = app;