const { request, response } = require("express");
const { Order } = require("../models");


const getOrders = async (req = request, res = response) => {
    const { offset = 0, limit = 100 } = req.query;
    const queryStatus = { status: true };

    const [totalOrders, orders] = await Promise.all([
        Order.countDocuments(queryStatus),
        Order.find(queryStatus)
            .populate('user', 'name')
            // .populate('address', 'name')
            .skip(Number(offset))
            .limit(Number(limit))
    ]);

    res.json({
        totalOrders,
        orders
    });
}

const getOrdersById = async (req = request, res = response) => {
    const { id } = req.params;
    const orders = await Order.findById(id);
    return res.json(orders);
}

const createOrder = async (req = request, res = response) => {
    const { productsList } = req.body;
    const customer = req.authenticatedUser._id;
    const order = new Order({ customer });

    await order.save();
    return res.json(order);
}

const updateOrder = async (req = request, res = response) => {
    const { id } = req.params;
    const { status, customer, orderStatus, payment, address } = req.body;

    const statusOrderUpdate = ['pending', 'confirmed', 'processing']
    const orderTemp = await Order.findById(id);

    if (!statusOrderUpdate.includes(orderTemp.orderStatus)) {
        return res.status(400).json({
            message: `El pedido ya ha sido enviado y no puede modificarse. Realizar el proceso de devolución.`
        });
    }

    let dataToUpdate = {};
    // Cancel or pay the order.
    if (orderTemp.orderStatus === 'pending') {
        if (orderStatus === 'cancelled') {
            dataToUpdate.orderStatus = 'cancelled';
        }
        if (payment) {
            dataToUpdate.payment = payment;
            dataToUpdate.orderStatus = 'confirmed';
        }
    }

    if (address) {
        dataToUpdate.address = address;
    }

    if (Object.keys(dataToUpdate).length > 0) {
        const order = await Order.findByIdAndUpdate(id, dataToUpdate, { new: true });
        return res.json(order);
    }

    return res.json({
        message: 'Datos enviados no válidos, intentando actualizar algo que no existe.'
    });
}

const deleteOrder = async (req = request, res = response) => {
    const { id } = req.params;
    const user = req.authenticatedUser._id;

    const order = await Order.findByIdAndUpdate(id, { status: false, user }, { new: true });
    res.json(order);
}


module.exports = {
    getOrders,
    getOrdersById,
    createOrder,
    updateOrder,
    deleteOrder,
}