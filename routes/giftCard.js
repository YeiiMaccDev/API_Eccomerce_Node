const { Router } = require("express");
const { check } = require("express-validator");

const { 
    validateJWT, 
    isAdminRole, 
    validateFields 
} = require("../middlewares");

const { 
    getGiftCards, 
    getGiftCardById, 
    createGiftCard, 
    updateGiftCard, 
    deleteGiftCard, 
    redeemGiftCard
} = require("../controllers/giftCard");

const { existsGiftCardById } = require("../helpers");


const router = Router();
/**
 * {{url}}/api/gift-cards
 */

router.get('/', [
    validateJWT,
    isAdminRole,
    validateFields
], getGiftCards);

router.get('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsGiftCardById),
    validateFields
], getGiftCardById);

router.post('/', [
    validateJWT,
    isAdminRole,
    check('totalBalance', 'El saldo total es obligatorio.').not().isEmpty(),
    validateFields
], createGiftCard);

router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsGiftCardById),
    validateFields,
    check('totalBalance', 'El saldo total es obligatorio.').not().isEmpty(),
    validateFields
], updateGiftCard);

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsGiftCardById),
    validateFields
], deleteGiftCard);


router.post('/redeem', [
    validateJWT,
    check('code', 'El código de la tajeta es obligatorio.').not().isEmpty(),
    validateFields
], redeemGiftCard);

module.exports = router;