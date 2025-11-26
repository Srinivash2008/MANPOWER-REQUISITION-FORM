// backend/routes/manpowerrequisition.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const mrfUpload = require('../middleware/mrfUpload');
const { emitManpowerRequisitionRefresh } = require('../socketManager');
require('dotenv').config();

const COMPREHENSIVE_VIEW_ROLES = ['Senior Manager', 'Senior Client Support Executive'];
const ALL_DASHBOARD_ACCESS_ROLES = ['Senior Manager', 'Senior Client Support Executive', 'Client Support Executive'];


router.get('/getmanpowerrequisition', authMiddleware , async (req, res) => {
    
    try {
        const [rows] = await pool.execute('SELECT * FROM manpower_requisition AS mr JOIN employee_personal AS ep ON ep.employee_id = mr.created_by WHERE mr.isdelete = "Active" ORDER BY mr.id DESC' );

        const fetchManpowerRequisition = rows.map((row, index) => ({
            id: row.id,
            s_no: index + 1,
            department: row.department,
            employment_status: row.employment_status,
            designation: row.designation,
            num_resources: row.num_resources,
            requirement_type: row.requirement_type,
            replacement_detail: row.replacement_detail,
            ramp_up_reason: row.ramp_up_reason,
            job_description: row.job_description,
            education: row.education,
            experience: row.experience,
            ctc_range: row.ctc_range,
            specific_info: row.specific_info,
            mrf_number: row.mrf_number,
            status:row.status,
            created_by:row.created_by,
            isdelete: row.isdelete,
            emp_name: row.emp_name,
        }));
        res.json(fetchManpowerRequisition);

    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }

});
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
                hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2 ,created_by,status,
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
                    mrf_number, received_by, tat_agreed, hr_review, delivery_phase , created_by,status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
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
                created_by || null,
                status || 'Pending',
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


router.get('/getmanpowerrequisitionbyid/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute(`SELECT * FROM manpower_requisition AS mr WHERE mr.id = ? AND mr.isdelete = "Active" LIMIT 1`, [id] );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Manpower requisition not found.' });
        }

        const row = rows[0];

        const fetchManpowerRequisitionById = {
            id: row.id,
            department: row.department,
            employment_status: row.employment_status,
            designation: row.designation,
            num_resources: row.num_resources,
            requirement_type: row.requirement_type,
             project_name: row.project_name,
            ramp_up_file: row.ramp_up_file,
            replacement_detail: row.replacement_detail,
            ramp_up_reason: row.ramp_up_reason,
            job_description: row.job_description,
            education: row.education,
            experience: row.experience,
            ctc_range: row.ctc_range,
            specific_info: row.specific_info,
            hiring_tat_fastag: row.hiring_tat_fastag,
            hiring_tat_normal_cat1: row.hiring_tat_normal_cat1,
            hiring_tat_normal_cat2: row.hiring_tat_normal_cat2,
            requestor_sign: row.requestor_sign,
            director_sign: row.director_sign,
            mrf_number: row.mrf_number,
            status: row.status,
            created_by: row.created_by,
            isdelete: row.isdelete,
            emp_name: row.emp_name,
        };

        res.json(fetchManpowerRequisitionById);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.post('/add-query-form', authMiddleware, async (req, res) => {
  const { query_manpower_requisition_pid, query_name, query_created_by, query_created_date, query_created_time, query_is_delete} = req.body;

  if (!query_name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {

    const insertQuery = `INSERT INTO manpower_requisition_query (query_manpower_requisition_pid, query_name, query_created_by, query_created_date, query_created_time, query_is_delete) VALUES (?, ?, ?, ?, ?, ?)`;

    const insertParams = [query_manpower_requisition_pid, query_name, query_created_by, query_created_date, query_created_time, query_is_delete];

    const [result] = await pool.execute(insertQuery, insertParams);

    emitManpowerRequisitionRefresh();

    res.status(201).json({
      message: 'New Query List created successfully.',
      manpowerId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.put('/update-status/:id', authMiddleware, async (req, res) => {
    const manpowerId = req.params.id;
    const { status } = req.body; 

    if (!manpowerId || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {

        const query = `UPDATE manpower_requisition SET status = ? WHERE id = ?`;

        const params = [status, manpowerId ];

        const [result] = await pool.execute(query, params);

        emitManpowerRequisitionRefresh();
        
        res.status(200).json({
        message: 'Manpower status updated successfully Updated.',
        id: manpowerId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating manpower.' });
    }
});

router.put('/delete-manpower/:id', authMiddleware, async (req, res) => {
    try {
        const manpowerId = req.params.id;
        const deletestatus = "Inactive"; // Correct assignment

        if (!manpowerId) {
            return res.status(400).json({ message: 'Missing manpower ID' });
        }

        // SQL query to mark as deleted
        const query = `UPDATE manpower_requisition SET isdelete = ? WHERE id = ?`;
        const params = [deletestatus, manpowerId];

        const [result] = await pool.execute(query, params);

        emitManpowerRequisitionRefresh();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Manpower not found' });
        }

        res.status(200).json({
            message: 'Manpower Requisition successfully deleted.',
            id: manpowerId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting manpower.' });
    }
});



// router.get('/getmanpowerrequisitionbyid/:id', authMiddleware, async (req, res) => {
//     try {
//         const { id } = req.params;

//         const [rows] = await pool.execute(`SELECT * FROM manpower_requisition AS mr WHERE mr.id = ? AND mr.isdelete = "Active" LIMIT 1`, [id] );

//         if (rows.length === 0) {
//             return res.status(404).json({ message: 'Manpower requisition not found.' });
//         }

//         const row = rows[0];

//         const fetchManpowerRequisitionById = {
//             id: row.id,
//             department: row.department,
//             employment_status: row.employment_status,
//             designation: row.designation,
//             num_resources: row.num_resources,
//             requirement_type: row.requirement_type,
//             project_name: row.project_name,
//             ramp_up_file: row.ramp_up_file,
//             replacement_detail: row.replacement_detail,
//             ramp_up_reason: row.ramp_up_reason,
//             job_description: row.job_description,
//             education: row.education,
//             experience: row.experience,
//             ctc_range: row.ctc_range,
//             specific_info: row.specific_info,
//             hiring_tat_fastag: row.hiring_tat_fastag,
//             hiring_tat_normal_cat1: row.hiring_tat_normal_cat1,
//             hiring_tat_normal_cat2: row.hiring_tat_normal_cat2,
//             requestor_sign: row.requestor_sign,
//             director_sign: row.director_sign,
//             mrf_number: row.mrf_number,
//             status: row.status,
//             created_by: row.created_by,
//             isdelete: row.isdelete,
//             emp_name: row.emp_name,
//         };

//         res.json(fetchManpowerRequisitionById);

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error.' });
//     }
// });

router.put(
    '/update-manpower-requisition/:id',
    authMiddleware,
    mrfUpload.fields([
        { name: 'requestorSign', maxCount: 1 },
        { name: 'directorSign', maxCount: 1 },
        { name: 'rampUpFile', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const {
                department, employmentStatus, designation, numResources, requirementType, projectName, replacementDetail,
                rampUpReason, jobDescription, education, experience, ctcRange, specificInfo, mrfNumber,
                tatAgreed, hrReview, deliveryPhase,
                hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2
            } = req.body;

            // File paths from multer
            const requestorSignPath = req.files?.requestorSign?.[0]?.path;
            const directorSignPath = req.files?.directorSign?.[0]?.path;
            const rampUpFilePath = req.files?.rampUpFile?.[0]?.path;

            const fieldsToUpdate = {
                department, employment_status: employmentStatus, designation, num_resources: numResources, requirement_type: requirementType,
                project_name: projectName, replacement_detail: replacementDetail, ramp_up_reason: rampUpReason, job_description: jobDescription,
                education, experience, ctc_range: ctcRange, specific_info: specificInfo, mrf_number: mrfNumber,
                tat_agreed: tatAgreed, hr_review: hrReview, delivery_phase: deliveryPhase,
                hiring_tat_fastag: hiring_tat_fastag === 'true',
                hiring_tat_normal_cat1: hiring_tat_normal_cat1 === 'true',
                hiring_tat_normal_cat2: hiring_tat_normal_cat2 === 'true',
            };

            if (requestorSignPath) fieldsToUpdate.requestor_sign = requestorSignPath;
            if (directorSignPath) fieldsToUpdate.director_sign = directorSignPath;
            if (rampUpFilePath) fieldsToUpdate.ramp_up_file = rampUpFilePath;

            const updateEntries = Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined && value !== null);
            const setClause = updateEntries.map(([key]) => `${key} = ?`).join(', ');
            const params = [...updateEntries.map(([_, value]) => value), id];

            if (setClause) {
                const sql = `UPDATE manpower_requisition SET ${setClause} WHERE id = ?`;
                await pool.execute(sql, params);
            }

            res.status(200).json({ message: 'Manpower requisition form updated successfully!' });
        } catch (error) {
            console.error('Error updating MRF:', error);
            res.status(500).json({ message: 'Server error while updating the form.' });
        }
    }
);

module.exports = router;
