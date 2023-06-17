const { request, response } = require("express");
const { v4: uuidv4 } = require('uuid');

const { Coupon, Order } = require("../models");
const coupon = require("../models/coupon");


const getCoupons = async (req = request, res = response) => {
    try {
        const { offset = 0, limit = 100 } = req.query;
        const queryStatus = { status: true };

        const [totalCoupons, coupons] = await Promise.all([
            Coupon.countDocuments(queryStatus),
            Coupon.find(queryStatus)
                .populate('user', 'name')
                .skip(Number(offset))
                .limit(Number(limit))
        ]);

        res.json({
            totalCoupons,
            coupons
        });
    } catch (error) {
        console.log('Error al consultar cupones: ', error)
        res.status(500).json({
            message: 'Error al consultar cupones.'
        });
    }
}

const getCouponById = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id)
            .populate('user', 'name');

        res.json(coupon);
    } catch (error) {
        console.log('Error al consultar cupón por ID: ', error)
        res.status(500).json({
            message: 'Error al consultar cupón por ID.'
        });
    }
}

const createCoupon = async (req = request, res = response) => {
    try {
        const { status, code, user, ...body } = req.body;

        const codeCoupon = 'CP-' + uuidv4();

        const data = {
            code: codeCoupon,
            user: req.authenticatedUser._id,
            ...body,
        };

        const coupon = new Coupon(data);
        await coupon.save();

        res.json(coupon);
    } catch (error) {
        console.log('Error al crear cupón: ', error)
        res.status(500).json({
            message: 'Error al crear cupón.'
        });
    }
}

const updateCoupon = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { status, user, ...data } = req.body;

        const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });

        res.json(coupon);
    } catch (error) {
        console.log('Error al altualizar cupón: ', error)
        res.status(500).json({
            message: 'Error al altualizar cupón.'
        });
    }
}

const deleteCoupon = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findByIdAndUpdate(id, { status: false }, { new: true });

        res.json(coupon);
    } catch (error) {
        console.log('Error al eliminar cupón: ', error)
        res.status(500).json({
            message: 'Error al eliminar cupón.'
        });
    }
}

// Redeem the coupon by assigning it to the order and calculating the new total with the discount.
const redeemCoupon = async (req = request, res = response) => {
    try {
        const { code, order } = req.body;
        const userId = req.authenticatedUser._id;

        const [orderDB, couponDB] = await Promise.all([
            Order.findById(order),
            Coupon.findOne({code})
        ]);

        if (!orderDB || !orderDB.status) {
            return res.status(400).json({ message: `El pedido no existe o no está disponible.` });
        }

        if (orderDB.coupon) {
            return res.status(400).json({ message: `El pedido ya tiene un cupón asignado.` });
        }


        if (!couponDB || !couponDB.status) {
            return res.status(400).json({ message: `No existe cupón con el código: ${code}` });
        }

        if (couponDB.uses >= couponDB.maxUses) {
            return res.status(400).json({
                message: `Se ha superado el número máximo de usos del cupón.`
            });
        }

        if (!couponDB.isActive) {
            return res.status(400).json({ message: `El cupón no está activo.` });
        }

        const currentDate = new Date();
        if (couponDB.expirationDate <= currentDate) {
            return res.status(400).json({ message: `El cupón ha expirado.` });
        }


        const totalDiscount = parseFloat(orderDB.totalWithoutCoupon) * ((parseFloat(couponDB.discount) / 100));
        const totalOrder = parseFloat(orderDB.totalWithoutCoupon) - totalDiscount;

        const dataOrder = {
            coupon: couponDB._id,
            couponDiscount: couponDB.discount,
            totalCouponDiscount: totalDiscount,
            total: totalOrder
        };

        const dataCoupon = {
            $push: { redeemedBy: userId },
            uses: (parseInt(couponDB.uses) + 1)
        };

        const [orderUpdated, coupon] = await Promise.all([
            Order.findByIdAndUpdate(orderDB._id, dataOrder, { new: true }),
            Coupon.findByIdAndUpdate(orderDB._id, dataCoupon, { new: true })
        ]);

        return res.json(orderUpdated);

    } catch (error) {
        console.log('Error al canjear el cupón: ', error)
        res.status(500).json({
            message: 'Error al canjear el cupón.'
        });
    }
}

// Updates the order total when a coupon has already been assigned and the order details are updated.
const updateTotalOrderWithCoupon = async (req = request, res = response) => {
    try {
        const { idOrder, idCoupon } = req.body;

        const [orderDB, couponDB] = await Promise.all([
            Order.findById(idOrder),
            Coupon.findById(idCoupon)
        ]);
        

        if (!orderDB || !orderDB.status) {
            return res.status(400).json({ message: `El pedido no existe o no está disponible.` });
        }
  
        if (!couponDB || !couponDB.status) {
            return res.status(400).json({ message: `El cupón no existe o no está disponible.` });
        }

        const totalDiscount = parseFloat(orderDB.totalWithoutCoupon) * ((parseFloat(couponDB.discount) / 100));
        const totalOrder = parseFloat(orderDB.totalWithoutCoupon) - totalDiscount;

        const dataOrder = {
            couponDiscount: couponDB.discount,
            totalCouponDiscount: totalDiscount,
            total: totalOrder
        };

        return await Order.findByIdAndUpdate(orderDB._id, dataOrder, { new: true });

    } catch (error) {
        console.log('Error al canjear el cupón: ', error)
        res.status(500).json({
            message: 'Error al canjear el cupón.'
        });
    }
}

module.exports = {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    redeemCoupon,
    updateTotalOrderWithCoupon
}