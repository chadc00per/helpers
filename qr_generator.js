const QRCode = require('qrcode');
const fs = require('fs');
const { log } = require('../logging');
const path = require('path');
const { generateId } = require('../id/uid');

async function generateQRCode(address) {
    const outputDir = path.join('storage', 'qr codes');
    const outputPath = path.join(outputDir, `${generateId()}.png`);
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        await QRCode.toFile(outputPath, address);
        return outputPath;
    } catch (error) {
        log(`Error generating QR code: ${error.message}`);
        throw error;
    }
}

module.exports = { generateQRCode };
