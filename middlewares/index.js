const validateFields = require('../middlewares/validate-fields');
const validateJWT  = require('../middlewares/validate-jwt');
const validateRoles  = require('../middlewares/validate-roles');
const validateUploadFiles = require('../middlewares/validate-upload-files');

module.exports = {
    ...validateFields,
    ...validateJWT,
    ...validateRoles,
    ...validateUploadFiles
}