const { Router } = require("express");
const {
    getAddress,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress
} = require("../controllers/address");
const { check } = require("express-validator");
const { validateFields, validateJWT, isAdminRole } = require("../middlewares");
const { existsAddressById } = require("../helpers");


const router = Router();

/**
 * {{url}}/api/address
 */

router.get('/', [
    validateJWT,
    isAdminRole,
    validateFields
], getAddress);

router.get('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsAddressById),
    validateFields
], getAddressById);

router.post('/', [
    validateJWT,
    check('fullName', 'El nombre completo es obligatorio.').not().isEmpty(),
    check('phoneNumber', 'El número de teléfono es obligatorio.').not().isEmpty(),
    check('city', 'La ciudad es obligatoria.').not().isEmpty(),
    check('stateRegion', 'El estado / región / departamento es obligatorio.').not().isEmpty(),
    check('postalCode', 'El código postal de la localidad o ciudad es obligatorio.').not().isEmpty(),
    check('address', 'La dirección para entregar el pedido es obligatoria.').not().isEmpty(),
    check('description', 'La descripción para entregar el pedido es obligatoria.').not().isEmpty(),
    validateFields
], createAddress);

router.put('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsAddressById),
    validateFields,
    check('fullName', 'El nombre completo es obligatorio.').optional().not().isEmpty(),
    check('phoneNumber', 'El número de teléfono es obligatorio.').optional().not().isEmpty(),
    check('city', 'La ciudad es obligatoria.').optional().not().isEmpty(),
    check('stateRegion', 'El estado / región / departamento es obligatorio.').optional().not().isEmpty(),
    check('postalCode', 'El código postal de la localidad o ciudad es obligatorio.').optional().not().isEmpty(),
    check('address', 'La dirección para entregar el pedido es obligatoria.').optional().not().isEmpty(),
    check('description', 'La descripción para entregar el pedido es obligatoria.').optional().not().isEmpty(),
    validateFields
], updateAddress);

router.delete('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsAddressById),
    validateFields
], deleteAddress);



module.exports = router;