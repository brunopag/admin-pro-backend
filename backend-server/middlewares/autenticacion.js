var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ===============================================
// Verificacion de token
// ===============================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                errors: err
            })
        }

        req.usuario = decoded.usuario;

        next();
    })
}

// ===============================================
// Verificacion de ADMIN_ROLE
// ===============================================
exports.verificaAdminRole = function(req, res, next) {
    var role = req.usuario.role;

    if (role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Acceso incorrecto - No es admin',
            errors: { message: 'Error de autenticacion' }
        })
    }

}

// ===============================================
// Verificacion de ADMIN_ROLE o Mismo Usuario
// ===============================================
exports.verificaAdminRole_o_mismoUsuario = function(req, res, next) {
    var role = req.usuario.role;
    var id = req.params.id;

    console.log(req);

    if (role === 'ADMIN_ROLE' || id === req.usuario._id) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Acceso incorrecto - No es admin ni mismo usuario',
            errors: { message: 'Error de autenticacion' }
        })
    }

}