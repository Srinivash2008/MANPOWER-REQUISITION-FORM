// backend/controllers/userController.js

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const userPosition = req.user.emp_pos;

        // FIX: The logical operator should be OR (||), not AND (&&)
        if (userPosition !== "Senior Manager" && userPosition !== "Senior Client Support Executive") {
            return res.status(403).json({ message: "Forbidden: You do not have permission to view this data." });
        }

        // FIX: Removed the extra space after the column name
        const [rows] = await pool.execute('SELECT * FROM employee_personal WHERE emp_is_delete = "Active"');

        const users = rows.map(user => ({
            emp_id: user.employee_id,
            mail_id: user.mail_id,
            employee_id: user.employee_id,
            emp_name: user.emp_name,
            gender: user.gender,
            emp_dept: user.emp_dept,
            emp_team: user.emp_team,
            emp_pos: user.emp_pos,
        }));

        res.status(200).json(users);
    } catch (error) {
        //console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error fetching user data." });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { employee_id, mail_id, emp_name, emp_pos, emp_dept, emp_team, gender, emp_pass } = req.body;

        // FIX: Added parentheses for correct SQL logic
        const [existing] = await pool.execute(
            'SELECT employee_id FROM employee_personal WHERE emp_is_delete = "Active" AND (employee_id = ? OR mail_id = ?)',
            [employee_id, mail_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'User with this Employee ID or Mail ID already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(emp_pass, salt);

        // FIX: Removed extra space from column name and standardized soft delete value to "Active"
        const [result] = await pool.execute(
            'INSERT INTO employee_personal (employee_id, mail_id, emp_name, emp_pos, emp_dept, emp_team, gender, emp_pass, emp_is_delete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Active")',
            [employee_id, mail_id, emp_name, emp_pos, emp_dept, emp_team, gender, hashedPassword]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: 'Failed to add user.' });
        }

        const newUser = {
            emp_id: employee_id,
            mail_id,
            employee_id,
            emp_name,
            gender,
            emp_dept,
            emp_team,
            emp_pos
        };

        res.status(201).json(newUser);
    } catch (error) {
        //console.error("Error adding user:", error);
        res.status(500).json({ message: "Server error adding user." });
    }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params; // this is employee_id
    const { mail_id, emp_name, emp_pos, emp_dept, emp_team, gender } = req.body;

    // Perform update
    const [result] = await pool.execute(
      `UPDATE employee_personal 
       SET mail_id = ?, emp_name = ?, emp_pos = ?, emp_dept = ?, emp_team = ?, gender = ?
       WHERE employee_id = ?`,
      [mail_id, emp_name, emp_pos, emp_dept, emp_team, gender, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes were made." });
    }

    // Fetch updated record to return accurate data
    const [rows] = await pool.execute(
      `SELECT emp_id, employee_id, mail_id, emp_name, emp_pos, emp_dept, emp_team, gender
       FROM employee_personal
       WHERE employee_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found after update." });
    }

    res.status(200).json(rows[0]); // return updated user
  } catch (error) {
    //console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error updating user." });
  }
};


exports.softDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // FIX: Removed the extra space after the column name and standardized value
        const [result] = await pool.execute(
            'UPDATE employee_personal SET emp_is_delete = "Inactive" WHERE employee_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User successfully deleted.' });
    } catch (error) {
        //console.error("Error soft-deleting user:", error);
        res.status(500).json({ message: "Server error soft-deleting user." });
    }
};