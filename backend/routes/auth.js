const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { transporter } = require('../utils/transporter');
const otpGenerator = require('otp-generator');
const e = require('express');
const { decryptEmployeeId } = require('../hashPassword');
require('dotenv').config();


router.post('/login', async (req, res) => {
    console.log('Login route accessed');
    let { emp_id, emp_pass } = req.body;
    if(emp_pass == "defaultPassword"){
         const decryptedId = decryptEmployeeId(
            emp_id,
            process.env.ENCRYPTION_KEY,  // Must match PHP's ENCRYPTION_KEY
            process.env.ENCRYPTION_IV   // Must match PHP's ENCRYPTION_IV
        );
        emp_id = decryptedId;
        emp_pass = "defaultPassword";
    }

    if (!emp_id || !emp_pass) {
        return res.status(400).json({ message: 'Employee ID and password are required.' });
    }

    try {
        const [rows] = await pool.execute(
            `SELECT emp_name, emp_pass, emp_pos, emp_dept, mail_id 
             FROM employee_personal 
             WHERE employee_id = ?`,
            [emp_id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = rows[0];
        let isMatch = emp_pass === user.emp_pass;

        if (emp_pass == "defaultPassword") {
            isMatch = true;
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            {
                emp_id: emp_id,
                emp_pos: user.emp_pos,
                emp_name: user.emp_name,
                emp_dept: user.emp_dept,
            },
            process.env.JWT_SECRET,
            { expiresIn: 7200 }
        );
        res.json({
            token,
            user: {
                emp_id: emp_id,
                emp_pos: user.emp_pos,
                emp_name: user.emp_name,
                emp_dept: user.emp_dept,
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});






router.post('/logout', async (req, res) => {
    const { emp_id } = req.body;

    if (!emp_id) {
        return res.status(400).json({ message: 'Employee ID is required.' });
    }

    try {
        await pool.execute(
            `UPDATE login_details
             SET last_logged_out = NOW()
             WHERE user_id = ? AND DATE(first_logged_in) = CURDATE()`,
            [emp_id]
        );

        res.json({ message: 'Logout time updated successfully.' });
    } catch (error) {
        //console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});


router.post('/forgot-password', async (req, res) => {
    const { mail_id } = req.body;

    try {
        const [rows] = await pool.execute('SELECT employee_id, emp_name FROM employee_personal WHERE mail_id = ?', [mail_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found with that email address.' });
        }

        const user = rows[0];
        const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        await pool.execute('UPDATE employee_personal SET otp_code = ?, otp_expiry = ? WHERE employee_id = ?', [otp, otpExpiry, user.employee_id]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: mail_id,
            subject: 'Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${user.emp_name},</p>
                    <p>A request has been made to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
                    <h1 style="background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px; text-align: center; color: #007bff;">${otp}</h1>
                    <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'OTP sent to your email.' });

    } catch (error) {
        //console.error('Error in forgot-password:', error);
        res.status(500).json({ message: 'Server error. Could not send OTP.' });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { mail_id, otp } = req.body;

    try {
        const [rows] = await pool.execute('SELECT employee_id, otp_expiry FROM employee_personal WHERE mail_id = ? AND otp_code = ?', [mail_id, otp]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        if (new Date(user.otp_expiry) < new Date()) {
            await pool.execute('UPDATE employee_personal SET otp_code = NULL, otp_expiry = NULL WHERE employee_id = ?', [user.employee_id]);
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        await pool.execute('UPDATE employee_personal SET otp_code = NULL, otp_expiry = NULL WHERE employee_id = ?', [user.employee_id]);

        res.json({ message: 'OTP verified successfully.' });

    } catch (error) {
        //console.error('Error in verify-otp:', error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post('/reset-password', async (req, res) => {
    const { mail_id, new_pass } = req.body;

    if (!new_pass) {
        return res.status(400).json({ message: 'New password is required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_pass, salt);

        const [result] = await pool.execute('UPDATE employee_personal SET emp_pass = ? WHERE mail_id = ?', [hashedPassword, mail_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ message: 'Password reset successfully.' });

    } catch (error) {
        //console.error('Error in reset-password:', error);
        res.status(500).json({ message: 'Server error while resetting password.' });
    }
});



module.exports = router;