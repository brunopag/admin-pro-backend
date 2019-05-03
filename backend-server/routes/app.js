// Requires
var express = require('express');

// Inicializacion
var app = express();

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'Request successfully executed'
    })
})

module.exports = app;