    // hashPassword.js
    // This script is used to generate a bcrypt hash for a plain text password.
    // Run this script from your backend directory using: node hashPassword.js

    // const bcrypt = require('bcrypt'); // Make sure bcrypt is installed: npm install bcrypt
    import crypto from 'crypto';
    import bcrypt from 'bcrypt';

    const plainPassword = '2035'; // <--- IMPORTANT: CHANGE THIS TO THE PASSWORD YOU WANT TO HASH
    const saltRounds = 10; // The number of salt rounds (cost factor). 10-12 is common.

    // Generate the hash
    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
        if (err) {
            //console.error('Error hashing password:', err);
            return;
        }
        //console.log('----------------------------------------------------');
        //console.log('Plain Password:', plainPassword);
        //console.log('Hashed Password (COPY THIS ENTIRE STRING):');
        //console.log(hash); // This is the hash you'll put in your MySQL database
        //console.log('----------------------------------------------------');
    });
    export function decryptEmployeeId(encryptedHex, encryptionKey, encryptionIv) {
    // 1. Build key EXACTLY like PHP
    const keyString = encryptionKey.padEnd(32, '0').slice(0, 32);
    const key = Buffer.from(keyString, 'utf8');

    // 2. IV must be EXACTLY 16 bytes
    const iv = Buffer.from(encryptionIv, 'utf8');

    console.log('Key length:', key.length); // MUST be 32
    console.log('IV length:', iv.length);   // MUST be 16
    console.log('Encrypted hex:', encryptedHex);

    const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
    console.log('Encrypted buffer length:', encryptedBuffer.length);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted;
    try {
        const part1 = decipher.update(encryptedBuffer);
        const part2 = decipher.final(); // <-- ERROR usually happens here
        decrypted = Buffer.concat([part1, part2]);
    } catch (e) {
        console.error('DECIPHER ERROR:', e.message);
        throw e;
    }

    return decrypted.toString('utf8');
}
