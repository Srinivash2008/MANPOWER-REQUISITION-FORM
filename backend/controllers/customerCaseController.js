const pool = require('../config/database'); // Assume this is configured correctly

/**
 * Helper function to format case data for response
 */
const formatCaseEntry = (row) => ({
    custom_case_pid: row.custom_case_pid,
    custom_case_no: row.custom_case_no,
    custom_emp_id: row.custom_emp_id,
    employee_name: row.employee_name, // Assigned Employee Name (JOIN)
    custom_esc_date: row.custom_esc_date,
    custom_case_mode: row.custom_case_mode,
    custom_feedbacks: row.custom_feedbacks,
    custom_created_by: row.custom_created_by,
    created_by_name: row.created_by_name, // Creator Name (JOIN)
    custom_created_at: row.custom_created_at,
});


/**
 * @desc Get all active customer case entries
 * @route GET /api/cases
 * @access Private
 */
exports.getAllCaseEntries = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                cce.*,
                ep_assigned.emp_name AS employee_name,
                ep_creator.emp_name AS created_by_name
            FROM customer_case_entry cce
            JOIN employee_personal ep_assigned ON cce.custom_emp_id = ep_assigned.employee_id
            JOIN employee_personal ep_creator ON cce.custom_created_by = ep_creator.employee_id
            WHERE cce.custom_is_delete = 'Active'
            ORDER BY cce.custom_created_at DESC
        `);
        res.json(rows.map(formatCaseEntry));
    } catch (error) {
        console.error('Error fetching case entries:', error);
        res.status(500).json({ message: 'Server error fetching cases.' });
    }
};

/**
 * @desc Create a new customer case entry
 * @route POST /api/cases
 * @access Private
 */
exports.createCaseEntry = async (req, res) => {
    const { custom_case_no, custom_emp_id, custom_esc_date, custom_case_mode, custom_feedbacks } = req.body;
    
    // 🛑 MODIFICATION: Ensure you use the NUMERIC primary key (employee_id) 
    // for the foreign key constraint, not the string identifier (emp_id).
    const custom_created_by = req.user.emp_id; 
    
    // Validation: Ticket No, Employee ID, and Escalation Date are mandatory
    if (!custom_case_no || !custom_emp_id || !custom_esc_date) {
        return res.status(400).json({ message: 'Ticket No, Employee, and Escalation Date are mandatory.' });
    }

    try {
        const [result] = await pool.execute(
            `INSERT INTO customer_case_entry (
                custom_case_no, custom_emp_id, custom_esc_date, custom_case_mode, custom_feedbacks, custom_created_by
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            // custom_created_by (which is req.user.employee_id) must be a number here.
            [custom_case_no, custom_emp_id, custom_esc_date, custom_case_mode || null, custom_feedbacks, custom_created_by]
        );

        // Fetch the newly created entry to return to the frontend, including names
        const [newEntry] = await pool.execute(`
            SELECT 
                cce.*,
                ep_assigned.emp_name AS employee_name,
                ep_creator.emp_name AS created_by_name
            FROM customer_case_entry cce
            JOIN employee_personal ep_assigned ON cce.custom_emp_id = ep_assigned.employee_id
            JOIN employee_personal ep_creator ON cce.custom_created_by = ep_creator.employee_id
            WHERE cce.custom_case_pid = ?
        `, [result.insertId]);

        res.status(201).json(formatCaseEntry(newEntry[0]));
    } catch (error) {
        console.error('Error creating case entry:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Case with this Ticket No already exists.' });
        }
        // Catch foreign key constraint violation if custom_created_by was a string
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ message: 'Invalid Employee ID provided for assignment or creator.' });
        }
        res.status(500).json({ message: 'Server error creating case.' });
    }
};


/**
 * @desc Update a customer case entry
 * @route PUT /api/cases/:id
 * @access Private
 */
exports.updateCaseEntry = async (req, res) => {
    const { id } = req.params;
    const { custom_case_no, custom_emp_id, custom_esc_date, custom_case_mode, custom_feedbacks } = req.body;

    if (!custom_case_no || !custom_emp_id || !custom_esc_date) {
        return res.status(400).json({ message: 'Ticket No, Employee, and Escalation Date are mandatory.' });
    }

    try {
        await pool.execute(
            `UPDATE customer_case_entry SET 
                custom_case_no = ?, custom_emp_id = ?, custom_esc_date = ?, custom_case_mode = ?, custom_feedbacks = ? 
             WHERE custom_case_pid = ?`,
            [custom_case_no, custom_emp_id, custom_esc_date, custom_case_mode || null, custom_feedbacks, id]
        );

        // Fetch the updated entry
        const [updatedEntry] = await pool.execute(`
            SELECT 
                cce.*,
                ep_assigned.emp_name AS employee_name,
                ep_creator.emp_name AS created_by_name
            FROM customer_case_entry cce
            JOIN employee_personal ep_assigned ON cce.custom_emp_id = ep_assigned.employee_id
            JOIN employee_personal ep_creator ON cce.custom_created_by = ep_creator.employee_id
            WHERE cce.custom_case_pid = ?
        `, [id]);

        if (updatedEntry.length === 0) {
            return res.status(404).json({ message: 'Case entry not found.' });
        }

        res.json(formatCaseEntry(updatedEntry[0]));

    } catch (error) {
        console.error('Error updating case entry:', error);
        res.status(500).json({ message: 'Server error updating case.' });
    }
};

/**
 * @desc Soft delete a customer case entry
 * @route DELETE /api/cases/:id
 * @access Private
 */
exports.softDeleteCaseEntry = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute(
            `UPDATE customer_case_entry SET custom_is_delete = 'Inactive' WHERE custom_case_pid = ?`,
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Case entry not found.' });
        }
        res.json({ message: 'Case entry soft-deleted successfully.' });
    } catch (error) {
        console.error('Error soft deleting case entry:', error);
        res.status(500).json({ message: 'Server error deleting case.' });
    }
};

/**
 * @desc Get list of employees for dropdown (id and name only)
 * @route GET /api/cases/employees/names
 * @access Private
 */
exports.getEmployeeNames = async (req, res) => {
    try {
        // Fetch employee_id (numeric) and emp_name
        const [rows] = await pool.execute(
            `SELECT employee_id, emp_name 
            FROM employee_personal 
            WHERE emp_is_delete = 'Active' 
                AND emp_pos != 'Senior Manager'
            ORDER BY emp_name ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employee names:', error);
        res.status(500).json({ message: 'Server error fetching employees.' });
    }
};