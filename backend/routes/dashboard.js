// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const mysql = require('mysql2/promise');
const pool = require('../config/database'); // Import the common database pool
require('dotenv').config();

const COMPREHENSIVE_VIEW_ROLES = ['Senior Manager', 'Senior Client Support Executive'];
const ALL_DASHBOARD_ACCESS_ROLES = ['Senior Manager', 'Senior Client Support Executive', 'Client Support Executive'];



router.get('/summary', authMiddleware, async (req, res) => {
    const userRole = req.user.emp_pos;
    const userId = req.user.emp_id;

    //console.log(`[Backend Dashboard] Request received for user: ${userId}, role: ${userRole}`);

    if (!ALL_DASHBOARD_ACCESS_ROLES.includes(userRole)) {
        //console.warn(`[Backend Dashboard] Forbidden access for user ${userId} with role ${userRole}.`);
        return res.status(403).json({ message: 'Forbidden: You do not have permission to view the dashboard summary.' });
    }

    try {
       const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

// Helper function to format YYYY-MM-DD in local time
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const currentMonthStart = formatDate(new Date(year, month, 1));  // 01-08-2025
const currentMonthEnd = formatDate(new Date(year, month + 1, 0)); // 31-08-2025
const currentDay = formatDate(today);

//console.log(`[Backend Dashboard] Date Range: ${currentMonthStart} to ${currentMonthEnd}, Today: ${currentDay}`);

        let employeesToFetch = [];

        if (COMPREHENSIVE_VIEW_ROLES.includes(userRole)) {
            query = `
                SELECT ep.employee_id, ep.emp_name,
                SUM(CASE WHEN hae.status = 'Pending' THEN 1 ELSE 0 END) as awaiting_information,
                SUM(CASE WHEN hae.status = 'Escalated' THEN 1 ELSE 0 END) as escalate_case,
                SUM(CASE WHEN DATE(hae.received_date) = ? THEN 1 ELSE 0 END) as today_count,
                SUM(CASE WHEN hae.status = 'Resolved' AND hae.received_date >= ? AND hae.received_date <= ? THEN 1 ELSE 0 END) as resolved_month_count
                FROM employee_personal ep
                LEFT JOIN hd_add_entry hae ON ep.employee_id = hae.employee_id
                WHERE ep.emp_dept = 'ACS_HD' AND ep.emp_pos <> 'Senior Manager'
                GROUP BY ep.employee_id, ep.emp_name
                ORDER BY ep.employee_id
            `;
            params = [currentDay, currentMonthStart, currentMonthEnd];
        } else {
            query = `
                SELECT ep.employee_id, ep.emp_name,
                SUM(CASE WHEN hae.status = 'Pending' THEN 1 ELSE 0 END) as awaiting_information,
                SUM(CASE WHEN hae.status = 'Escalated' THEN 1 ELSE 0 END) as escalate_case,
                SUM(CASE WHEN DATE(hae.received_date) = ? THEN 1 ELSE 0 END) as today_count,
                SUM(CASE WHEN hae.status = 'Resolved' AND hae.received_date >= ? AND hae.received_date <= ? THEN 1 ELSE 0 END) as resolved_month_count
                FROM employee_personal ep
                LEFT JOIN hd_add_entry hae ON ep.employee_id = hae.employee_id
                WHERE ep.employee_id = ?
                GROUP BY ep.employee_id, ep.emp_name
            `;
            params = [currentDay, currentMonthStart, currentMonthEnd, userId];
        }

        const [rows] = await pool.execute(query, params);
        const dashboardSummary = rows.map(row => ({
            emp_id: row.employee_id,
            emp_name: row.emp_name,
            awaiting_information: row.awaiting_information || 0,
            escalate_case: row.escalate_case || 0,
            today_count: row.today_count || 0,
            resolved_month_count: row.resolved_month_count || 0,
        }));

        //console.log(`[Backend Dashboard] Sending final summary data:`, dashboardSummary);
        res.json(dashboardSummary);

    } catch (error) {
        //console.error(`[Backend Dashboard] Server error during summary fetch for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error fetching dashboard summary.' });
    }
});

/* router.get('/fetch-shift-notification', authMiddleware, async (req, res) => {
    const userRole = req.user.emp_pos;
    const userId = req.user.emp_id;
    try {
        const [shiftnotifycount] = await pool.execute('SELECT COUNT(*) AS count FROM login_details WHERE shift IS NULL AND user_id = ?',
            [userId]
        );
       
        res.json(shiftnotifycount);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching shift Notification' });
    }

});   */  

module.exports = router;
