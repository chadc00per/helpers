const sharp = require('sharp');
const { log } = require('../logging');
const { newError } = require('../middleware/errors');

async function compressImage(inputBuffer, quality = 80, newWidth = 1024, newHeight = 1024) {
    try {
        if (!inputBuffer || !Buffer.isBuffer(inputBuffer)) {
            throw newError('Invalid image format.');
        }
        const image = sharp(inputBuffer);
        const { format } = await image.metadata();
        if (!format) {
            throw newError('Invalid image format.');
        }
        const compressedBuffer = await image
            .resize(newWidth, newHeight, { fit: sharp.fit.inside, withoutEnlargement: true })
            .toFormat(format, { quality: quality })
            .toBuffer();
        return compressedBuffer;
    } catch (error) {
        log(`Error compressing image: ${error.message}`);
        throw error;
    }
}

module.exports = { compressImage };
