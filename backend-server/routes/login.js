// Requires
var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializacion
var app = express();

// Require del modelo
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

// ===============================================
// RENOVACION DE TOKEN
// ===============================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {
    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }) //4horas 
    res.status(200).json({
        ok: true,
        mensaje: 'Token renovado correctamente',
        usuario: req.usuario,
        token: token,
    });
});


// ===============================================
// LOGIN GOOGLE
// ===============================================
app.post('/google/', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch((e) => {
            res.status(403).json({
                ok: false,
                mensaje: 'Error al verificar token google.',
            })
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR obteniendo usuarios',
                errors: err
            })
        }

        if (usuarioDB) {
            if (!usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    message: 'Usuario registrado de forma normal, repita el login de esa manera',
                    errors: err
                })
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) //4horas 

                res.status(200).json({
                    ok: true,
                    mensaje: 'Login post ejecutado correctamente',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: getMenu(usuarioDB.role)
                })
            }
        } else {
            // El usario no existe, hay que crearlo

            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'ERROR guardando usuarios',
                        errors: err
                    })
                }

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) //4horas 

                res.status(200).json({
                    ok: true,
                    mensaje: 'Login post ejecutado correctamente',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: getMenu(usuarioDB.role)
                })
            })

        }

    })

})

// ===============================================
// LOGIN NORMAL
// ===============================================
app.post('/', (req, res) => {
    // Obtenemos el body del post con la libreria body parser node
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR obteniendo usuarios',
                errors: err
            })
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                message: 'ERROR de credenciales - email',
                errors: err
            })
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'ERROR de credenciales - password',
                errors: err
            })
        }

        // Crear token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) //4horas 

        res.status(200).json({
            ok: true,
            mensaje: 'Login post ejecutado correctamente',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: getMenu(usuarioDB.role)
        })

    })


})

function getMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Graficos', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                //{titulo: 'Usuarios', url: '/usuarios'},
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE == 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}

module.exports = app;