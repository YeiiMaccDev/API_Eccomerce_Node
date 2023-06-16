const { model, Schema } = require("mongoose");

const GiftCardSchema = Schema({
    code: { 
        type: String, 
        require: [true, 'El código de la tajeta es obligatorio.'],
        unique: true 
    },
    totalBalance: { 
        type: Schema.Types.Decimal128,
        require: [true, 'El saldo total es obligatorio.'],
    },
    redeemedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isRedeemed: { 
        type: Boolean, 
        default: false 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: [true, 'El usuario creador de la tajeta es obligatorio.'],
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

GiftCardSchema.methods.toJSON = function () {
    const { __v, status, totalBalance, ...data } = this.toObject();
    return {
        totalBalance: (totalBalance) ? parseFloat(totalBalance) : 0,
        ...data,
    };
}

module.exports = model('GiftCard', GiftCardSchema);