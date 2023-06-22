const { Router } = require("express");
const { check } = require("express-validator");

const {
    validateFields,
    validateJWT,
    validateOrderDetails,
    validateProductData,
    validateDuplicateProducts,
    validateProductExistInOrder
} = require("../middlewares");

const {
    isArrayOfObject,
    existsShoppingCartById
} = require("../helpers");

const { 
    getDetailsByIdShoppingCart, 
    updateShoppingCartDetail 
} = require("../controllers/shoppingCartDetail");

const { deleteOrderDetail } = require("../controllers/orderDetail");


const router = Router();

/**
 * {{url}}/api/shopping-cart-details
 */

router.get('/:idShoppingCart', [
    validateJWT,
    check('idShoppingCart', 'El ID del carrito de compras no es válido.').isMongoId(),
    validateFields,
    check('idShoppingCart').custom(existsShoppingCartById),
    validateFields
], getDetailsByIdShoppingCart);

router.put('/:idShoppingCart', [
    validateJWT,
    check('idShoppingCart', 'El ID del carrito de compras no es válido.').isMongoId(),
    validateFields,
    check('idShoppingCart').custom(existsShoppingCartById),
    validateFields,
    check('products', 'Lista de productos es obligatoria.').not().isEmpty(),
    validateFields,
    check('products', 'Lista de productos debe ser un array de objetos de producto.').isArray(),
    check('products', 'Lista de productos debe contener al menos un producto.').isArray({ min: 1 }),
    validateFields,
    check('products').custom(productsShoppingCart => isArrayOfObject(productsShoppingCart)),
    validateFields,
    validateDuplicateProducts,
    validateFields,
    validateProductData,
    validateFields,
    validateOrderDetails,
    validateFields
], updateShoppingCartDetail);

router.delete('/:idShoppingCart', [
    validateJWT,
    check('idShoppingCart', 'El ID del carrito de compras no es válido.').isMongoId(),
    validateFields,
    check('idShoppingCart').custom(existsShoppingCartById),
    validateFields,
    check('details', 'Lista de detalles de pedido es obligatoria.').not().isEmpty(),
    validateFields,
    check('details', 'Lista de detalles de pedido debe ser un array de objetos con el id detalle de orden a eliminar.').isArray(),
    check('details', 'Lista de detalles de pedido debe contener al menos un elemento a eliminar.').isArray({ min: 1 }),
    validateFields,
    check('details').custom(productsShoppingCart => isArrayOfObject(productsShoppingCart)),
    validateFields,
    validateProductExistInOrder,
    validateFields
], deleteOrderDetail);

module.exports = router;