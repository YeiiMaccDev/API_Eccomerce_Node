const { request, response } = require("express");
const { Order, Product, OrderDetail } = require("../models");
const { calculatePriceTotal } = require("../helpers");

const calculateTotalOrder = async (idOrder) => {
    try {
        const orderDetails = await OrderDetail.find({ order: idOrder, status: true });
        return orderDetails.reduce((total, product) => {
            return total + calculatePriceTotal(product.price, product.quantity, product.quantity)
        }, 0);
    } catch (error) {
        console.log('Error al calcular total del pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al crear el pedido.'
        });
    }
}

const getOrderDetailsByIdOrder = async (req = request, res = response) => {
    try {
        const { idOrder } = req.params;
        const orders = await OrderDetail.find({ order: idOrder });
        return res.json(orders);
    } catch (error) {
        console.log('Error al consultar detalles del pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar detalles del pedido.'
        });
    }
}

const createOrderDetail = async (req = request, res = response) => {
    try {
        const { products, idOrder } = req.body;
        let totalOrder = 0;
        const details = [];

        const productIds = products.map(product => product.id);
        const productDetails = await Product.find({ _id: { $in: productIds } });

        products.forEach((newProduct) => {
            const productDetail = productDetails.find(detail => detail._id.toString() === newProduct.id);

            const total = calculatePriceTotal(productDetail.price, newProduct.quantity, productDetail.discount);

            const orderDetail = new OrderDetail({
                order: idOrder,
                product: productDetail._id,
                quantity: newProduct.quantity,
                price: productDetail.price,
                discount: productDetail.discount,
                total
            });
            details.push(orderDetail);
            totalOrder += total;
        });

        await Promise.all([
            OrderDetail.insertMany(details),
            Order.findByIdAndUpdate({ _id: idOrder }, { total: totalOrder }, { new: true })
        ]);

        const order = await Order.findOne({ _id: idOrder }).populate('customer', 'name');

        return res.json({
            message: `Detalle pedido.`,
            order,
            details
        });

    } catch (error) {
        console.log('Error al crear el pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al crear el pedido.'
        });
    }
}

const updateOrderDetail = async (req = request, res = response) => {
    try {
        const { idOrder } = req.params;
        const { products } = req.body;

        const productIds = products.map(product => product.id);
        const [orderDB, orderDetailsDB, productsDB] = await Promise.all([
            Order.findById(idOrder),
            OrderDetail.find({ order: idOrder }),
            Product.find({ _id: { $in: productIds } })
        ]);

        if (orderDB.orderStatus !== 'pending') {
            return res.status(400).json({
                message: `El pedido no puede modificarse después del pago. Enviar solicitud del caso para su revisión.`
            });
        }

        const promises = products.map(async (newProduct) => {
            const detailDB = orderDetailsDB.find((detail) => detail.product.toString() === newProduct.id);
            const productDB = productsDB.find((product) => product._id.toString() === newProduct.id);
            if (detailDB) {
                const totalDetails = calculatePriceTotal(productDB.price, newProduct.quantity, productDB.discount);
                await OrderDetail.findByIdAndUpdate(detailDB._id, { quantity: newProduct.quantity, total: totalDetails }, { new: true });
            } else {
                const total = calculatePriceTotal(productDB.price, newProduct.quantity, productDB.discount);

                const newDetail = new OrderDetail({
                    order: idOrder,
                    product: newProduct.id,
                    quantity: newProduct.quantity,
                    price: productDB.price,
                    discount: productDB.discount,
                    total,
                });
                await newDetail.save();
            }
        });

        await Promise.all(promises);

        const totalOrder = await calculateTotalOrder(idOrder);
        const order = await Order.findByIdAndUpdate(idOrder, { total: totalOrder }, { new: true });

        return res.json({
            message: 'Pedido actualizado con exito.',
            order
        });
    } catch (error) {
        console.log('Error al actualizar orderm: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al actualizar el pedido.'
        });
    }
}

const deleteOrderDetail = async (req = request, res = response) => {
    try {
        const { idOrder } = req.params;
        const { details } = req.body;

        const orderDB = await Order.findById(idOrder);

        if (orderDB.orderStatus !== 'pending') {
            return res.status(400).json({
                message: `El pedido no puede modificarse después del pago. Enviar solicitud del caso para su revisión.`
            });
        }

        const deletedItems = await Promise.all(details.map(async (detail) => {
            console.log(detail.id);
            return await OrderDetail.findByIdAndUpdate(detail.id, { status: false }, { new: true });
        }));

        const totalOrder = await calculateTotalOrder(idOrder);
        const order = await Order.findByIdAndUpdate(idOrder, { total: totalOrder }, { new: true });

        return res.json({
            message: 'Items eliminados.',
            order,
            deletedItems
        });

    } catch (error) {
        console.log('Error al eliminar detallel pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al eliminar el producto del pedido.'
        });
    }
}


module.exports = {
    getOrderDetailsByIdOrder,
    createOrderDetail,
    updateOrderDetail,
    deleteOrderDetail,
}