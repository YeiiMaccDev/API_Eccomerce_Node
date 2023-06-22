const { request, response } = require("express");
const { Product, ShoppingCartDetail, ShoppingCart } = require("../models");
const {
    calculatePriceTotal,
    calculateTotalShoppingCartWithoutCoupon
} = require("../helpers");
const { updateTotalShoppingCartWithCoupon } = require("./coupon");

const getDetailsByIdShoppingCart = async (req = request, res = response) => {
    try {
        const { idShoppingCart } = req.params;
        const shoppingCart = await ShoppingCartDetail.find({ shoppingCart: idShoppingCart });
        return res.json(shoppingCart);
    } catch (error) {
        console.log('Error al consultar detalles del carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar detalles del carrito de compras.'
        });
    }
}

const createShoppingCartDetail = async (req = request, res = response) => {
    try {
        const { products, idShoppingCart } = req.body;
        let totalShoppingCart = 0;
        const details = [];

        const productIds = products.map(product => product.id);
        const productDetails = await Product.find({ _id: { $in: productIds } });

        products.forEach((newProduct) => {
            const productDetail = productDetails.find(detail => detail._id.toString() === newProduct.id);

            const total = calculatePriceTotal(productDetail.price, newProduct.quantity, productDetail.discount);

            const shoppingCartDetail = new ShoppingCartDetail({
                shoppingCart: idShoppingCart,
                product: productDetail._id,
                quantity: newProduct.quantity,
                price: productDetail.price,
                discount: productDetail.discount,
                total
            });
            details.push(shoppingCartDetail);
            totalShoppingCart += total;
        });

        const [shoppingCartDetailsUpdated, shoppingCart] = await Promise.all([
            ShoppingCartDetail.insertMany(details),
            ShoppingCart.findByIdAndUpdate({ _id: idShoppingCart },
                {
                    totalWithoutCoupon: totalShoppingCart,
                    total: totalShoppingCart
                },
                { new: true })
        ]);

        return res.json({
            message: `Detalle carrito de compras...`,
            shoppingCart,
            details
        });

    } catch (error) {
        console.log('Error al crear el carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al crear el carrito de compras.'
        });
    }
}

const updateShoppingCartDetail = async (req = request, res = response) => {
    try {
        const { idShoppingCart } = req.params;
        const { products } = req.body;

        const productIds = products.map(product => product.id);
        const [shoppingCartDB, shoppingCartDetailsDB, productsDB] = await Promise.all([
            ShoppingCart.findById(idShoppingCart),
            ShoppingCartDetail.find({ shoppingCart: idShoppingCart }),
            Product.find({ _id: { $in: productIds } })
        ]);

        const promises = products.map(async (newProduct) => {
            const productDB = productsDB.find((product) => product._id.toString() === newProduct.id);
            const detailDB = shoppingCartDetailsDB.find((detail) => detail.product.toString() === newProduct.id);
            if (detailDB) {
                const totalDetails = calculatePriceTotal(productDB.price, newProduct.quantity, productDB.discount);
                return await ShoppingCartDetail.findByIdAndUpdate(detailDB._id, { price: productDB.price, quantity: newProduct.quantity, total: totalDetails }, { new: true });
            } else {
                const total = calculatePriceTotal(productDB.price, newProduct.quantity, productDB.discount);

                const newDetail = new ShoppingCartDetail({
                    shoppingCart: idShoppingCart,
                    product: newProduct.id,
                    quantity: newProduct.quantity,
                    price: productDB.price,
                    discount: productDB.discount,
                    total,
                });
                return await newDetail.save();
            }
        });

        await Promise.all(promises);

        const totalShoppingCart = await calculateTotalShoppingCartWithoutCoupon(idShoppingCart);
        let shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { totalWithoutCoupon: totalShoppingCart }, { new: true });

        // Update the shoppingCart total by applying the redeemed coupon.
        if (shoppingCart.coupon) {
            req.body.idShoppingCart = idShoppingCart;
            req.body.idCoupon = shoppingCart.coupon;
            shoppingCart = await updateTotalShoppingCartWithCoupon(req, res);
        } else {
            shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { total: totalShoppingCart }, { new: true });
        }

        return res.json({
            message: 'Carrito actualizado con exito..',
            shoppingCart
        });
    } catch (error) {
        console.log('Error al actualizar carrito de compra: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al actualizar el carrito de compra.'
        });
    }
}

const deleteShoppingCartDetail = async (req = request, res = response) => {
    try {
        const { idShoppingCart } = req.params;
        const { details } = req.body;

        const deletedItems = await Promise.all(details.map(async (detail) => {
            console.log(detail.id);
            return await ShoppingCartDetail.findByIdAndUpdate(detail.id, { status: false }, { new: true });
        }));

        const totalShoppingCart = await calculateTotalShoppingCartWithoutCoupon(idShoppingCart);
        let shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { totalWithoutCoupon: totalShoppingCart }, { new: true });

        // Update the shoppingCart total by applying the redeemed coupon.
        if (shoppingCart.coupon) {
            req.body.idShoppingCart = idShoppingCart;
            req.body.idCoupon = shoppingCart.coupon;
            shoppingCart = await updateTotalShoppingCartWithCoupon(req, res);
        } else {
            shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { total: totalShoppingCart }, { new: true });
        }

        return res.json({
            message: 'Items eliminados.',
            shoppingCart,
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
    getDetailsByIdShoppingCart,
    createShoppingCartDetail,
    updateShoppingCartDetail,
    deleteShoppingCartDetail,
}