const { Router } = require("express");
const { check } = require("express-validator");

const {
    validateFields,
    isAdminRole,
    validateJWT,
    validateOrderDetails,
    validateProductData,
    validateDuplicateProducts
} = require("../middlewares");

const {
    existsOrderById,
    existsUserById,
    isArrayOfObject,
    existsAddressById
} = require("../helpers");

const {
    getOrders,
    getOrdersById,
    createOrder,
    updateOrder,
    deleteOrder
} = require("../controllers/order");

const router = Router();

/**
 * {{url}}/api/orders
 */

router.get('/', [
    validateJWT,
    isAdminRole,
    validateFields
], getOrders);

router.get('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsOrderById),
    validateFields
], getOrdersById);

router.post('/', [
    validateJWT,
    check('address', 'La dirección es obligatoria.').not().isEmpty(),
    validateFields,
    check('address', 'Dirección no es un ID válido.').isMongoId(),
    validateFields,
    check('address').custom(existsAddressById),
    check('products', 'Lista de productos es obligatoria.').not().isEmpty(),
    validateFields,
    check('products', 'Lista de productos debe ser un array de objetos de producto.').isArray(),
    check('products', 'Lista de productos debe contener al menos un producto.').isArray({ min: 1 }),
    validateFields,
    check('products').custom(productsOrder => isArrayOfObject(productsOrder)),
    validateFields,
    validateDuplicateProducts,
    validateFields,
    validateProductData,
    validateFields,
    validateOrderDetails,
    validateFields
], createOrder);

router.put('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsOrderById),
    validateFields,
    check('address', 'Dirección no es un ID válido.').optional().isMongoId(),
    validateFields,
    check('address').optional().custom(existsAddressById),
    validateFields
], updateOrder);


router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido').isMongoId(),
    validateFields,
    check('id').custom(existsOrderById),
    validateFields
], deleteOrder);

module.exports = router;