// backend/routes/manpowerrequisition.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const mrfUpload = require('../middleware/mrfUpload');
require('dotenv').config();

const COMPREHENSIVE_VIEW_ROLES = ['Senior Manager', 'Senior Client Support Executive'];
const ALL_DASHBOARD_ACCESS_ROLES = ['Senior Manager', 'Senior Client Support Executive', 'Client Support Executive'];


router.get('/getmanpowerrequisition', authMiddleware , async (req, res) => {
    
    try {
         const [rows] = await pool.execute('SELECT * FROM  manpower_requisition WHERE isdelete="Active" ORDER BY id DESC' );

        const fetchManpowerRequisition = rows.map((row, index) => ({
            id: row.id,
            s_no: index + 1,
            department: row.department,
            employment_status: row.employment_status,
            designation: row.designation,
            requirement_type: row.requirement_type,
            status:row.status,
            isdelete: row.isdelete,
        }));
        res.json(fetchManpowerRequisition);

    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }

});

/**
 * @desc Add a new Manpower Requisition Form entry
 * @route POST /api/mrf/add-manpower-requisition
 * @access Private
 */
router.post(
    '/add-manpower-requisition',
    authMiddleware,
    mrfUpload.fields([
        { name: 'requestorSign', maxCount: 1 },
        { name: 'directorSign', maxCount: 1 },
        { name: 'rampUpFile', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const {
                department, employmentStatus, designation, numResources, requirementType, projectName, replacementDetail,
                rampUpReason, jobDescription, education, experience, ctcRange, specificInfo, mrfNumber,
                receivedBy, tatAgreed, hrReview, deliveryPhase,
                hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2 ,created_by// Receive separate fields
            } = req.body;

            // Get file paths from multer
            const requestorSignPath = req.files?.requestorSign?.[0]?.path || null;
            const directorSignPath = req.files?.directorSign?.[0]?.path || null;
            const rampUpFilePath = req.files?.rampUpFile?.[0]?.path || null;

            const sql = `
                INSERT INTO manpower_requisition (
                    department, employment_status, designation, num_resources, requirement_type, project_name,
                    replacement_detail, ramp_up_reason, job_description, education,
                    experience, ctc_range, specific_info, requestor_sign, director_sign, ramp_up_file,
                    hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2,
                    mrf_number, received_by, tat_agreed, hr_review, delivery_phase , created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                department || null, employmentStatus || null, designation || null, numResources || 1, requirementType || null,
                projectName || null,
                replacementDetail || null, rampUpReason || null, jobDescription || null, education || null, 
                experience || null, ctcRange || null, specificInfo || null, requestorSignPath, directorSignPath, rampUpFilePath,
                hiring_tat_fastag === 'true', 
                hiring_tat_normal_cat1 === 'true',
                hiring_tat_normal_cat2 === 'true',
                mrfNumber || null, receivedBy || null, tatAgreed || null, hrReview || null, deliveryPhase || null,
                created_by || null
            ];

            const [result] = await pool.execute(sql, params);

            res.status(201).json({
                message: 'Manpower requisition form submitted successfully!',
                mrfId: result.insertId
            });
        } catch (error) {
            console.error('Error submitting MRF:', error);
            res.status(500).json({ message: 'Server error while submitting the form.' });
        }
    }
);
/**
 * @desc Get departments for employees reporting to the logged-in manager
 * @route GET /api/mrf/departments-by-manager
 * @access Private
 */
router.get('/departments-by-manager/:managerId', authMiddleware, async (req, res) => {
    try {
        // Get the logged-in user's ID from the authenticated token
        const { managerId } = req.params;

        let query;
        let params = [];

        // If managerId is 1400 or 12345, fetch all departments
        if (managerId === '1400' || managerId === '12345') {
            query = `SELECT * FROM employee_depart`;
        } else {
            // Otherwise, fetch only the departments for employees reporting to this manager
            query = `
                SELECT DISTINCT ed.*
                FROM employee_personal ep
                INNER JOIN employee_depart ed ON ed.id = ep.department
                WHERE ep.ReportingManager = ?
            `;
            params = [managerId];
        }

        const [departments] = await pool.execute(query, params);
        
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching departments.' });
    }
});

module.exports = router;
