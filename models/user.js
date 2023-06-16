const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
    },
    image: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ['ADMIN_ROLE', 'USER_ROLE', 'SALES_ROLE']
    },
    walletBalance: {
        type: Schema.Types.Decimal128,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

UserSchema.methods.toJSON = function () {
    const { __v, status, password, walletBalance, _id, ...data } = this.toObject();
    data.uid = _id;
    return {
        walletBalance: (walletBalance) ? parseFloat(walletBalance) : 0,
        ...data,
    };
}

module.exports = model('User', UserSchema);