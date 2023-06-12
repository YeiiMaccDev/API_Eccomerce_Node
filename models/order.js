const { Schema, model } = require("mongoose");

const OrderSchema = Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String
        // type: Schema.Types.ObjectId,
        // ref: 'Address',
        // required: true
    },
    payment: {
        type: String
        // type: Schema.Types.ObjectId,
        // ref: 'Payment',
        // required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    total: {
        type: Schema.Types.Decimal128,
        default: 0
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true });

OrderSchema.methods.toJSON = function () {
    const { __v, status, total, ...data } = this.toObject();
    return {
        total: (total) ? parseFloat(total) : 0,
        ...data
    };
}


module.exports = model('Order', OrderSchema);