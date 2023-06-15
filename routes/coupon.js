const { Router } = require("express");
const { check } = require("express-validator");

const { validateJWT, isAdminRole, validateFields } = require("../middlewares");
const { existsAddressById, existsCouponById } = require("../helpers");
const { getCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon } = require("../controllers/coupon");

const router = Router();

/**
 * {{url}}/api/coupons
 */

router.get('/', [
    validateJWT,
    isAdminRole,
    validateFields
], getCoupons);

router.get('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCouponById),
    validateFields
], getCouponById);

router.post('/', [
    validateJWT,
    isAdminRole,
    check('code', 'El código es obligatorio.').not().isEmpty(),
    check('discount', 'El descuento es obligatorio.').not().isEmpty(),
    check('expirationDate', 'La fecha de expiración del cupón es obligatoria.').not().isEmpty(),
    check('maxUses', 'El número máximo de usos es obligatorio.').not().isEmpty(),
    validateFields
], createCoupon);

router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCouponById),
    validateFields,
    check('code', 'El código es obligatorio.').optional().not().isEmpty(),
    check('discount', 'El descuento es obligatorio.').optional().not().isEmpty(),
    check('expirationDate', 'La fecha de expiración del cupón es obligatoria.').optional().not().isEmpty(),
    check('maxUses', 'El número máximo de usos es obligatorio.').optional().not().isEmpty(),
    validateFields
], updateCoupon);

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCouponById),
    validateFields
], deleteCoupon);



module.exports = router;