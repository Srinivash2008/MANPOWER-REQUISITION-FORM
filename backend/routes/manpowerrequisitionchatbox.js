// backend/routes/manpowerrequisition.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
require('dotenv').config();
const { emitManpowerRequisitionQueryRefresh } = require('../socketManager');



router.get('/get-chat-box-list/:mrfId', authMiddleware, async (req, res) => {
    try {
        const { mrfId } = req.params;
        console.log('mrfId:', mrfId)
       const [rows] = await pool.execute(
        ` SELECT 
                mrq.*,
                ep.employee_id,
                ep.emp_name,
                ep.emp_dept,
                ep.emp_pos
            FROM manpower_requisition_query mrq
            INNER JOIN employee_personal ep 
                ON ep.employee_id = mrq.query_created_by
            WHERE mrq.query_manpower_requisition_pid = ?
                AND mrq.query_is_delete = ?
            `,
            [mrfId, 'Active']
        );
        if (rows.length === 0) {
            return res.json([]);
        }
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.post('/add-chatbox-message', authMiddleware, async(req, res) => {
    const { message,query_manpower_requisition_pid } = req.body;
    const { user } = req;
    if (!message ) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const query_created_by = user?.emp_id;
        const isHrUpdate = user?.emp_id === '1722';
        const isDirectorUpdate = user?.emp_id === '1400';

        const query_created_date = new Date().toISOString().split('T')[0];
        const query_created_time = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        const fieldToInsert = isDirectorUpdate ? 'query_name_director' : 'query_name_hr';
        const query_name  = isDirectorUpdate ? 'Director 001' : 'HR 001';
        const fieldAnsInsert = isDirectorUpdate ? 'Director_Query_Answer' : 'Hr_Query_Answer';

        const insertQuery = `INSERT INTO manpower_requisition_query (query_manpower_requisition_pid, ${fieldToInsert},${fieldAnsInsert}, query_created_by, query_created_date, query_created_time, query_is_delete) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const insertParams = [query_manpower_requisition_pid, query_name, message, query_created_by, query_created_date, query_created_time, 'Active'];

        const [result] = await pool.execute(insertQuery, insertParams);
        
        emitManpowerRequisitionQueryRefresh();

        const [rows] = await pool.execute(
        ` SELECT 
                mrq.*,
                ep.employee_id,
                ep.emp_name,
                ep.emp_dept,
                ep.emp_pos
            FROM manpower_requisition_query mrq
            INNER JOIN employee_personal ep 
                ON ep.employee_id = mrq.query_created_by
            WHERE mrq.query_pid = ?
                AND mrq.query_is_delete = ?
            `,
            [result.insertId, 'Active']
        );
        
        res.status(201).json({
            message: 'New Query created successfully.',
            manpowerId: rows[0]   // ✅ SINGLE OBJECT
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});

//HR FH Chat Message
router.get('/get-hrfh-chat-box-list/:mrfId', authMiddleware, async (req, res) => {
    try {
        const { mrfId } = req.params;
       const [rows] = await pool.execute(
        ` SELECT 
                mrq.*,
                ep.employee_id,
                ep.emp_name,
                ep.emp_dept,
                ep.emp_pos
            FROM manpower_requisition_query mrq
            INNER JOIN employee_personal ep 
                ON ep.employee_id = mrq.query_created_by
            WHERE mrq.query_manpower_requisition_pid = ?
                AND mrq.query_is_delete = ?
            `,
            [mrfId, 'Active']
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        //const user = rows[0];
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.post('/add-hrfh-chatbox-message', authMiddleware, async(req, res) => {
    const { message,query_manpower_requisition_pid } = req.body;
    const { user } = req;
    if (!message ) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const query_created_by = user?.emp_id;
        const isHrUpdate = user?.emp_id === '1722';
        const isDirectorUpdate = user?.emp_id === '1400';

        const query_created_date = new Date().toISOString().split('T')[0];
        const query_created_time = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        const fieldToInsert = isDirectorUpdate ? 'query_name_director' : 'query_name_hr';
        const query_name  = isDirectorUpdate ? 'Director 001' : 'HR 001';
        const fieldAnsInsert = isDirectorUpdate ? 'Director_Query_Answer' : 'Hr_Query_Answer';

        const insertQuery = `INSERT INTO manpower_requisition_query (query_manpower_requisition_pid, ${fieldToInsert},${fieldAnsInsert}, query_created_by, query_created_date, query_created_time, query_is_delete) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const insertParams = [query_manpower_requisition_pid, query_name, message, query_created_by, query_created_date, query_created_time, 'Active'];

        const [result] = await pool.execute(insertQuery, insertParams);
        
        emitManpowerRequisitionQueryRefresh();

        const [rows] = await pool.execute(
        ` SELECT 
                mrq.*,
                ep.employee_id,
                ep.emp_name,
                ep.emp_dept,
                ep.emp_pos
            FROM manpower_requisition_query mrq
            INNER JOIN employee_personal ep 
                ON ep.employee_id = mrq.query_created_by
            WHERE mrq.query_pid = ?
                AND mrq.query_is_delete = ?
            `,
            [result.insertId, 'Active']
        );
        
        res.status(201).json({
            message: 'New Query created successfully.',
            manpowerId: rows[0]   // ✅ SINGLE OBJECT
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});



module.exports = router;
