const { request, response } = require("express");
const { v4: uuidv4 } = require('uuid');

const { GiftCard, User } = require("../models");

const getGiftCards = async (req = request, res = response) => {
    try {
        const { offset = 0, limit = 100 } = req.query;
        const queryStatus = { status: true };

        const [totalGiftCards, giftCards] = await Promise.all([
            GiftCard.countDocuments(queryStatus),
            GiftCard.find(queryStatus)
                .populate('user', 'name')
                .populate('redeemedBy', 'name')
                .skip(Number(offset))
                .limit(Number(limit))
        ]);

        res.json({
            totalGiftCards,
            giftCards
        });
    } catch (error) {
        console.log('Error al consultar tarjeta de regalo: ', error)
        res.status(500).json({
            message: 'Error al consultar tarjeta de regalo.'
        });
    }
}

const getGiftCardById = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const giftCard = await GiftCard.findById(id)
            .populate('user', 'name')
            .populate('redeemedBy', 'name');

        res.json(giftCard);
    } catch (error) {
        console.log('Error al consultar tarjeta de regalo por ID: ', error)
        res.status(500).json({
            message: 'Error al consultar tarjeta de regalo por ID.'
        });
    }
}

const createGiftCard = async (req = request, res = response) => {
    try {
        const { totalBalance } = req.body;

        const code = 'GC-' + uuidv4();

        const data = {
            code,
            totalBalance,
            user: req.authenticatedUser._id,
        };

        const giftCard = new GiftCard(data);
        await giftCard.save();

        res.json(giftCard);
    } catch (error) {
        console.log('Error al crear tarjeta de regalo: ', error)
        res.status(500).json({
            message: 'Error al crear tarjeta de regalo.'
        });
    }
}

const updateGiftCard = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { totalBalance, isActive } = req.body; 
        
        const giftCardDB = await GiftCard.findById(id);
        if (giftCardDB.isRedeemed) {
            return res.status(400).json({
                message: `La tarjeta regalo ya ha sido canjeada, no se puede actualizar.`
            });
        }

        const data = {
            totalBalance,
            isActive,
            user: req.authenticatedUser._id,
        };
        const giftCard = await GiftCard.findByIdAndUpdate(id, data, { new: true });

        res.json(giftCard);
    } catch (error) {
        console.log('Error al altualizar tarjeta de regalo: ', error)
        res.status(500).json({
            message: 'Error al altualizar tarjeta de regalo.'
        });
    }
}

const deleteGiftCard = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const giftCardDB = await GiftCard.findById(id);
        if (giftCardDB.isRedeemed) {
            return res.status(400).json({
                message: `La tarjeta regalo ya ha sido canjeada, no se puede eliminar.`
            });
        }

        const giftCard = await GiftCard.findByIdAndUpdate(id, { status: false }, { new: true });

        res.json(giftCard);
    } catch (error) {
        console.log('Error al eliminar tarjeta de regalo: ', error)
        res.status(500).json({
            message: 'Error al eliminar tarjeta de regalo.'
        });
    }
}

const redeemGiftCard = async (req = request, res = response) => {
    try {
        const { code } = req.body;
        const userDB = req.authenticatedUser;
        const giftCardDB = await GiftCard.findOne({ code });

        if (!giftCardDB || !giftCardDB.status) {
            return res.status(400).json({
                message: `No hay tarjeta regalo con el código: ${code}`
            });
        }

        if (giftCardDB.isRedeemed || giftCardDB.redeemedBy){
            return res.status(400).json({
                message: `La tarjeta de regalo ya ha sido canjeada.`
            });
        }

        if (!giftCardDB.isActive) {
            return res.status(400).json({
                message: `La tarjeta de regalo no está activa.`
            });
        }

        const walletBalance = parseFloat(userDB.walletBalance ) + parseFloat(giftCardDB.totalBalance);
        const dataGiftCard = {
            redeemedBy: userDB._id,
            isRedeemed: true,           
        };

        const [user, giftCard] = await Promise.all([
            User.findByIdAndUpdate(userDB._id, {walletBalance}, {new: true}),
            GiftCard.findByIdAndUpdate(giftCardDB._id, dataGiftCard, {new: true})
        ]);

        res.json({
            user,
            giftCard
        });
        
    } catch (error) {
        console.log('Error al canjear tarjeta de regalo: ', error)
        res.status(500).json({
            message: 'Error al canjear tarjeta de regalo.'
        });
    }
}

module.exports = {
    getGiftCards,
    getGiftCardById,
    createGiftCard,
    updateGiftCard,
    deleteGiftCard,
    redeemGiftCard
}