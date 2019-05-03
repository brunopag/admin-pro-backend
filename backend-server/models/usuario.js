var mongoose = require('mongoose');
var mongooseUnique = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesPermitidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El usuario es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
    password: { type: String, required: [true, 'La contraseña es requerido'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesPermitidos },
    google: { type: Boolean, default: false }
});

usuarioSchema.plugin(mongooseUnique, { message: '{PATH} debe ser único.' })

module.exports = mongoose.model('Usuario', usuarioSchema);