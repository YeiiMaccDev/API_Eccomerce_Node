const { request, response } = require("express");
const { Order, OrderDetail } = require("../models");
const { createOrderDetail } = require("./orderDetail");


const getOrders = async (req = request, res = response) => {
    const { offset = 0, limit = 100 } = req.query;
    const queryStatus = { status: true };

    const [totalOrders, orders] = await Promise.all([
        Order.countDocuments(queryStatus),
        Order.find(queryStatus)
            .populate('customer', 'name')
            .populate('address', 'address')
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
    
    const [order, details] = await Promise.all([
        Order.find({_id: id, status: true})
        .populate('customer', 'name')
        .populate('address', 'address'),
        OrderDetail.find({order: id, status: true})
            .populate('product', 'name')
    ]);
    return res.json({order, details});
}

const createOrder = async (req = request, res = response) => {
    const { address } = req.body;
    const customer = req.authenticatedUser._id;
    const order = new Order({ address, customer });

    await order.save();
    
    req.body.idOrder = order._id;
    return createOrderDetail(req, res);

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

    const order = await Order.findByIdAndUpdate(id, { status: false }, { new: true });
    res.json(order);
}


module.exports = {
    getOrders,
    getOrdersById,
    createOrder,
    updateOrder,
    deleteOrder,
}