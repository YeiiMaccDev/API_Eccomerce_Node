const { request, response } = require("express");
const { Address, Coupon } = require("../models");


const getAddress = async (req = request, res = response) => {
    try {
        const { offset = 0, limit = 100 } = req.query;
        const queryStatus = { status: true };

        const [totalAddresses, addresses] = await Promise.all([
            Address.countDocuments(queryStatus),
            Address.find(queryStatus)
                .populate('user', 'name')
                .skip(Number(offset))
                .limit(Number(limit))
        ]);

        res.json({
            totalAddresses,
            addresses
        });
    } catch (error) {
        console.log('Error al consultar dirección: ', error)
        res.status(500).json({
            message: 'Error al consultar dirección.'
        });
    }
}

const getAddressById = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const address = await Address.findById(id)
            .populate('user', 'name');

        res.json(address);
    } catch (error) {
        console.log('Error al consultar dirección por ID: ', error)
        res.status(500).json({
            message: 'Error al consultar dirección por ID.'
        });
    }
}

const createAddress = async (req = request, res = response) => {
    try {
        const { status, user, ...body } = req.body;

        const data = {
            user: req.authenticatedUser._id,
            ...body,
        };

        const address = new Address(data);
        await address.save();

        res.json(address);
    } catch (error) {
        console.log('Error al crear dirección: ', error)
        res.status(500).json({
            message: 'Error al crear dirección.'
        });
    }
}

const updateAddress = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { status, user, ...data } = req.body;

        const address = await Address.findByIdAndUpdate(id, data, { new: true });

        res.json(address);
    } catch (error) {
        console.log('Error al altualizar dirección: ', error)
        res.status(500).json({
            message: 'Error al altualizar dirección.'
        });
    }
}

const deleteAddress = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const address = await Address.findByIdAndUpdate(id, { status: false }, { new: true });

        res.json(address);
    } catch (error) {
        console.log('Error al eliminar dirección: ', error)
        res.status(500).json({
            message: 'Error al eliminar dirección.'
        });
    }
}

module.exports = {
    getAddress,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress
}