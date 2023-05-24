const dbValidators = require('./db-validators');
const generateJWT = require('./generateJWT');
const googleVeryfy = require('./google-verify');
const uploadsFiles = require('./uploads-files');
const uploadImagesCloudinary = require('./upload-images-cloudinary');


module.exports = {
    ...dbValidators,
    ...generateJWT,
    ...googleVeryfy,
    ...uploadsFiles,
    ...uploadImagesCloudinary,
}