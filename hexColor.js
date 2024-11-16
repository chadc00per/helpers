const { newError } = require('../middleware/errors');

const formatColor = async (color) => {

    const cleanedColor = color.replace(/^#/, '');
    const isValidHex = /^[0-9A-F]{6}$/i.test(cleanedColor) || /^[0-9A-F]{3}$/i.test(cleanedColor);
    if (!isValidHex) {
        throw newError('Invalid hex color code');
    }

    // If 3 characters, convert to 6
    const formattedColor = cleanedColor.length === 3
        ? cleanedColor.split('').map(char => char + char).join('')
        : cleanedColor;

    // Return with pound sign
    return `#${formattedColor.toUpperCase()}`;
}

module.exports = {
    formatColor
}
