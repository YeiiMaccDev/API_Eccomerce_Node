const { Schema, model } = require("mongoose");

const AddressSchema = Schema({
    fullName: {
        type: String,
        require: [true, 'El nombre completo es obligatorio.']
    },
    phoneNumber: {
        type: String,
        require: [true, 'El número de teléfono es obligatorio.']
    },
    city: {
        type: String,
        require: [true, 'La ciudad es obligatoria.']
    },
    stateRegion: {
        type: String,
        require: [true, 'El estado / región / departamento es obligatorio.']
    },      
    postalCode: {
        type: String,
        require: [true, 'El código postal de la ciudad es obligatorio.']
    },
    address: {
        type: String,
        require: [true, 'La dirección es obligatoria.']
    },
    description: {
        type: String,
        require: [true, 'La descripción es obligatoria.']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true });

AddressSchema.methods.toJSON = function () {
    const { __v, status, ...data } = this.toObject();
    return {
        ...data,
    };
}

module.exports = model('Address', AddressSchema);