    // hashPassword.js
    // This script is used to generate a bcrypt hash for a plain text password.
    // Run this script from your backend directory using: node hashPassword.js

    const bcrypt = require('bcrypt'); // Make sure bcrypt is installed: npm install bcrypt

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
    