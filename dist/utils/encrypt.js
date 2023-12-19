"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnlockedEcosystemVault = exports.decrypt = exports.encrypt = exports.setDynamicEncryptionKey = exports.setEncryptionKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const system_1 = require("./system");
let dynamicEncryptionKey = null;
const encryptedKey = process.env.ENCRYPTED_ENCRYPTION_KEY;
// Function to decrypt the encryption key using the admin's passphrase
function decryptEncryptionKey(encryptedKey, passphrase) {
    try {
        const [iv, authTag, cipherText, salt] = encryptedKey
            .split(':')
            .map((part) => Buffer.from(part, 'hex'));
        // Key derivation using PBKDF2
        const key = crypto_1.default.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
        const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(cipherText, null, 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Decryption failed:', error.message);
        throw new Error('Decryption failed');
    }
}
async function setEncryptionKey(passphrase) {
    try {
        const decryptedKey = decryptEncryptionKey(encryptedKey, passphrase);
        setDynamicEncryptionKey(decryptedKey);
        // Remove any existing system report for this operation
        try {
            await (0, system_1.removeSystemReport)('SetEncryptionKey');
        }
        catch (error) { }
        return true;
    }
    catch (error) {
        console.error('Failed to set the encryption key:', error);
        // Save a system report indicating that the operation failed
        await (0, system_1.storeSystemReport)('SetEncryptionKey', `Failed to set the encryption key: ${error.message}`, false);
        return false;
    }
}
exports.setEncryptionKey = setEncryptionKey;
function setDynamicEncryptionKey(key) {
    dynamicEncryptionKey = Buffer.from(key, 'hex');
}
exports.setDynamicEncryptionKey = setDynamicEncryptionKey;
function encrypt(text) {
    if (!dynamicEncryptionKey) {
        throw new Error('Encryption key is not set');
    }
    const iv = crypto_1.default.randomBytes(12); // GCM recommends 12 bytes
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', dynamicEncryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex'); // Get the authentication tag
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
exports.encrypt = encrypt;
function decrypt(text) {
    if (!dynamicEncryptionKey) {
        throw new Error('Encryption key is not set');
    }
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const authTag = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', dynamicEncryptionKey, iv);
    decipher.setAuthTag(authTag); // Set the authentication tag for decryption
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
exports.decrypt = decrypt;
function isUnlockedEcosystemVault() {
    return !!dynamicEncryptionKey;
}
exports.isUnlockedEcosystemVault = isUnlockedEcosystemVault;
