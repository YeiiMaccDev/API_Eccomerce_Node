const { Schema, model } = require("mongoose")

const ShoppingCartDetailSchema = Schema({
    shoppingCart: {
        type: Schema.Types.ObjectId,
        ref: 'ShoppingCart',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es obligatoria.']
    },
    price: {
        type: Schema.Types.Decimal128,
        required: [true, 'El precio es obligatorio.']
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Schema.Types.Decimal128,
        required: [true, 'El precio es obligatorio.']
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    }

}, { timestamps: true });

ShoppingCartDetailSchema.methods.toJSON = function () {
    const { __v, status, price, total, ...data } = this.toObject();
    return {
        total: (total) ? parseFloat(total) : 0,
        price: (price) ? parseFloat(price) : 0,
        ...data,
    };
}

module.exports = model('ShoppingCartDetail', ShoppingCartDetailSchema);