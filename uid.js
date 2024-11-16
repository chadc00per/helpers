/**
 * This module generates a unique identifier with a specified number of characters and symbols combined.
 * The identifier is based on a UUID, with dashes and underscores inserted at random positions.
 * 
 * Module Exports:
 * - generateId: Function to generate a unique identifier.
 * 
 * Usage:
 * const { generateId } = require('./uid');
 * const uniqueId = generateId();
 *
 * Module Exports:
 * - generateId: Function to generate a unique identifier.
 *
 * Usage:
 * const { generateId } = require('./uid');
 * const uniqueId = generateId();
*/

const { v4: uuidv4 } = require('uuid');
const generateId = (length = 36) => {
    const uuidLength = 32;
    const numUuids = Math.ceil(length / uuidLength);
    let id = '';

    for (let i = 0; i < numUuids; i++) {
        id += uuidv4().replace(/-/g, '');
    }

    let newId = id.slice(0, length).split('');
    let currentIndex = 0;

    while (currentIndex < newId.length - 1) {
        const chunkSize = Math.floor(Math.random() * 7) + 2; // Random size between 2 and 8
        currentIndex += chunkSize;

        if (currentIndex < newId.length - 1) {
            const symbol = Math.random() < 0.5 ? '-' : '_';
            newId.splice(currentIndex, 0, symbol);
            currentIndex++;
        }
    }

    // Ensure no symbol at the start or end
    if (newId[0] === '-' || newId[0] === '_') {
        newId.shift();
    }
    if (newId[newId.length - 1] === '-' || newId[newId.length - 1] === '_') {
        newId.pop();
    }

    // Ensure no two symbols are adjacent
    for (let i = 1; i < newId.length - 1; i++) {
        if ((newId[i] === '-' || newId[i] === '_') && (newId[i + 1] === '-' || newId[i + 1] === '_')) {
            newId.splice(i + 1, 1);
        }
    }

    // Adjust the length to match
    if (newId.length > length) {
        newId = newId.slice(0, length);
    } else {
        while (newId.length < length) {
            const symbol = Math.random() < 0.5 ? '-' : '_';
            if (newId.length === 0 || (newId[newId.length - 1] !== '-' && newId[newId.length - 1] !== '_')) {
                newId.push(symbol);
            }
        }
    }

    // Ensure the last character is not a dash or underscore
    if (newId[newId.length - 1] === '-' || newId[newId.length - 1] === '_') {
        newId.pop();
        while (newId.length < length) {
            const char = uuidv4().replace(/-/g, '').charAt(0);
            newId.push(char);
        }
    }

    return newId.join('');
};

function generateApiKey(length = 72) {
    const halfLength = Math.floor((length - 3) / 2);
    const firstPart = generateId(halfLength).replace(/[-_]/g, '').slice(0, halfLength);
    const secondPart = generateId(length - 3 - halfLength).replace(/[-_]/g, '').slice(0, length - 3 - halfLength);
    let apiKey = 'sk-' + firstPart + '-' + secondPart;

    // Ensure the requested length
    if (apiKey.length < length) {
        apiKey += generateId(length - apiKey.length).replace(/[-_]/g, '').slice(0, length - apiKey.length);
    }

    return apiKey.length > length ? apiKey.slice(0, length) : apiKey;
}

function generateStorageKey(length = 128) {
    function totalLength(C) {
        return C + Math.floor((C - 1) / 8);
    }

    function findC(L) {
        for (let C = L; C > 0; C--) {
            if (totalLength(C) === L) {
                return C;
            }
        }
        throw new Error('Cannot generate key of specified length with given format');
    }

    const C = findC(length);
    let storageKey = '';

    // Make sure we have enough characters
    while (storageKey.length < C) {
        storageKey += generateId(C).replace(/[-_]/g, '');
    }
    storageKey = storageKey.slice(0, C);

    let formattedKey = '';

    for (let i = 0; i < storageKey.length; i++) {
        if (i > 0 && i % 8 === 0) {
            formattedKey += '-';
        }
        formattedKey += storageKey[i];
    }

    return formattedKey;
}

module.exports = {
    generateId,
    generateApiKey,
    generateStorageKey
};
