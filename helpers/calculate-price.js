const { OrderDetail } = require("../models");


const calculatePriceTotal = (price = 0, quantity = 0, discount = 0) => {
    return (discount > 0)
        ? (quantity * price) - (quantity * price * (discount / 100))
        : (quantity * price)
}

const calculateTotalOrderWithoutCoupon = async (idOrder) => {
    try {
        const orderDetails = await OrderDetail.find({ order: idOrder, status: true });
        const total = orderDetails.reduce((total, product) => {
            return total + calculatePriceTotal(product.price, product.quantity, product.discount);
        }, 0);
        return total;
    } catch (error) {
        console.log('Error al calcular total del pedido: ', error);
        throw new Error("Error al calcular el total del pedido.");
    }
}

module.exports = {
    calculatePriceTotal,
    calculateTotalOrderWithoutCoupon
}