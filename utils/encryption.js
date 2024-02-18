const crypto = require('crypto');

function encrypt(text) {
    // Generate a random 16-byte IV
    const iv = crypto.randomBytes(16);

    // Derive a key using PBKDF2
    const key = crypto.pbkdf2Sync(process.env.PAYMENTHASHPASS, 'salt', 100000, 32, 'sha256');

    // Create a cipher using AES-256-CBC algorithm
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        iv: iv.toString('hex'),
        encryptedText: encrypted
    };
}

function decrypt(encryptedData) {
    const { iv, encryptedText } = encryptedData;

    // Derive the key using PBKDF2
    const key = crypto.pbkdf2Sync(process.env.PAYMENTHASHPASS, 'salt', 100000, 32, 'sha256');

    // Create a decipher using AES-256-CBC algorithm
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));

    // Decrypt the text
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}



module.exports = {encrypt, decrypt}