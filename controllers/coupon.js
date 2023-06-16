const { request, response } = require("express");
const { v4: uuidv4 } = require('uuid');

const { Coupon } = require("../models");


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

module.exports = {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon
}