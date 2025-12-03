// backend/routes/manpowerrequisition.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const mrfUpload = require('../middleware/mrfUpload');
const { emitManpowerRequisitionRefresh } = require('../socketManager');
const { transporter } = require('../utils/transporter');
const { compareSync } = require('bcrypt');
require('dotenv').config();
// const path = require('path');
// const { fileURLToPath } = require('url');

const COMPREHENSIVE_VIEW_ROLES = ['Senior Manager', 'Senior Client Support Executive'];
const ALL_DASHBOARD_ACCESS_ROLES = ['Senior Manager', 'Senior Client Support Executive', 'Client Support Executive'];



router.get('/getmanpowerrequisitionbyuser/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        let query = "SELECT mr.*, ep.*, ed.depart AS department_name FROM manpower_requisition AS mr JOIN employee_personal AS ep ON ep.employee_id = mr.created_by JOIN employee_depart AS ed ON ed.id = mr.department WHERE mr.isdelete = 'Active'";
        let params = [];

        if (!['12345', '1400', '1722'].includes(userId)) {
            query += ' AND mr.created_by = ?';
            params.push(userId);
        }
        query += ' ORDER BY mr.id DESC';
        const [rows] = await pool.execute(query, params);

        const fetchManpowerRequisitionByUser = rows.map((row, index) => ({
            id: row.id,
            s_no: index + 1,
            department: row.department,
            department_name: row.department_name,
            hiring_tat: row.hiring_tat_fastag == 1 ? "Fastag Hiring (60 Days)" : (row.hiring_tat_normal_cat1 == 1 ? "Normal Hiring – Cat 1 (90 Days)" : (row.hiring_tat_normal_cat2 == 1 ? "Normal Hiring – Cat 2 (120 Days)" : "")),
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
            status: row.status,
            created_by: row.created_by,
            created_at: row.created_at,
            isdelete: row.isdelete,
            emp_name: row.emp_name,
        }));
        res.json(fetchManpowerRequisitionByUser);

    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/getmanpowerrequisition', authMiddleware, async (req, res) => {

    try {
        const [rows] = await pool.execute('SELECT * FROM manpower_requisition AS mr JOIN employee_personal AS ep ON ep.employee_id = mr.created_by WHERE mr.isdelete = "Active" ORDER BY mr.id DESC');

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
            status: row.status,
            created_by: row.created_by,
            created_at: row.created_at,
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
                department, employmentStatus, designation, numResources, requirementType, projectName, projectionPlan, replacementDetail,
                rampUpReason, jobDescription, education, experience, ctcRange, specificInfo, mrfNumber,
                receivedBy, tatAgreed, hrReview, deliveryPhase,
                hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2, created_by, status, buttonClicked, emp_name
            } = req.body;

            // Get file paths from multer
            const requestorSignPath = req.files?.requestorSign?.[0]?.path || null;
            const directorSignPath = req.files?.directorSign?.[0]?.path || "uploads\mrf\requestor_signs\directorSign.png";
            const rampUpFilePath = req.files?.rampUpFile?.[0]?.path || null;

            const sql = `
                INSERT INTO manpower_requisition (
                    department, employment_status, designation, num_resources, requirement_type, project_name, projection_plan,
                    replacement_detail, ramp_up_reason, job_description, education,
                    experience, ctc_range, specific_info, requestor_sign, director_sign, ramp_up_file,
                    hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2,
                    mrf_number, received_by, tat_agreed, hr_review, delivery_phase , created_by,status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
            `;

            const params = [
                department || null, employmentStatus || null, designation || null, numResources || 1, requirementType || null,
                projectName || null, projectionPlan || null,
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

            const [rows] = await pool.execute(
                'SELECT * FROM employee_personal WHERE emp_name = ?',
                [emp_name]
            );

            if (buttonClicked === 'submit') {
                // 1. Email to the Requestor/FH (Confirmation) 📧
                // 'to' should ideally be the email of the person who submitted the form (emp_email), not hardcoded.
                // Assuming 'emp_email' is available in the scope. If not, use 'srinivasan@pdmrindia.com' as per your original code.
                const requestorMailOptions = {
                    from: process.env.EMAIL_USER,
                    // The 'to' email should be the submitter's email address (emp_email)
                    // Using srinivasan@pdmrindia.com as a placeholder based on your original 'to' field.
                    to: "nikita@pdmrindia.com",
                    // to: "je.rajesh@pdmrindia.com",
                    // You might want to CC HR/Recruitment on the FH/Requestor email as well
                    cc: "gomathi@pdmrindia.com,",
                    // cc: `selvi@pdmrindia.com, ${rows?.mail_id}`
                    subject: `A New Manpower requisition Form submitted for your approval`,
                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: auto;
                            border: 1px solid #ddd;
                            padding: 20px;
                        ">
                            <p>Hello Rajesh,</p>

                            <p>
                                A new MRF (Manpower Requisition Form) has been submitted by ${emp_name} and is now awaiting your review.
                            </p>

                            <p>
                                Please review it using the link below:
                                <a href="http://localhost:5173/">View Manpower Requisition</a>
                            </p>

                            <p style="margin-top: 30px; color: #555;">
                                Thanks & regards,<br>
                                Automated MRF System
                            </p>
                        </div>`
                };

                // 2. Email to the HR Team (Action/Notification) 🔔
        //         const hrMailOptions = {
        //             from: process.env.EMAIL_USER,
        //             // The 'to' email is the HR team's primary recipient
        //             to: "srinivasan@pdmrindia.com",
        //             // You might want to CC HR/Recruitment on the FH/Requestor email as well
        //             cc: "gomathi@pdmrindia.com",
        //             subject: `ACTION REQUIRED: New MRF Submitted by ${emp_name}`,
        //             html: `
        //     <div style="
        //         font-family: Arial, sans-serif;
        //         max-width: 600px;
        //         margin: auto;
        //         border: 1px solid #ddd;
        //         padding: 20px;
        //     ">
        //         <h2 style="color: #d9534f;">New Manpower Requisition Form Awaiting Review</h2>

        //         <p>Dear HR Team,</p>

        //         <p>
        //             A new **Manpower Requisition Form (MRF)** has been submitted and is ready for your review and processing.
        //         </p>

        //         <h3 style="color: #007bff; margin-top: 25px;">Requisition Summary</h3>
        //         <p><strong>Submitted By:</strong> ${emp_name}</p>
        //         <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
        //         <p><strong>Action:</strong> Please log in to the portal to review the complete details and begin the hiring process.</p>

        //         <p style="margin-top: 30px; color: #555;">
        //             System Notification
        //         </p>
        //     </div>
        // `
        //         };

                // Send the two emails sequentially
                try {
                    await transporter.sendMail(requestorMailOptions);
                    // console.log('Confirmation email sent to requestor/FH.');

                    // await transporter.sendMail(hrMailOptions);
                    // console.log('Notification email sent to HR.');

                    // Update the response message to reflect the successful submission
                    res.status(200).json({ message: 'Manpower Requisition Form submitted successfully and notifications sent.' });

                } catch (error) {
                    console.error('Error sending email:', error);
                    // You might want to send a different status if the form was saved but email failed
                    res.status(500).json({ message: 'Form submitted but failed to send email notification.' });
                }
            }

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
        if (managerId === '1400' || managerId === '12345' || managerId === '1722') {
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

        const [rows] = await pool.execute(`SELECT mr.id AS mr_id,ed.id AS depart_id, depart, employment_status, designation, num_resources, requirement_type, project_name, projection_plan, ramp_up_file, replacement_detail, ramp_up_reason, job_description, education, experience, ctc_range, specific_info, hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2, mrf_number, tat_agreed, delivery_phase, hr_review, requestor_sign, director_sign, status, hr_status, director_status, hr_comments,  director_comments, mrq.query_name_hr, mrq.query_name_director, mrq.query_pid FROM manpower_requisition AS mr JOIN employee_depart AS ed ON ed.id = mr.department LEFT JOIN manpower_requisition_query as mrq ON mr.id = mrq.query_manpower_requisition_pid WHERE mr.id = ? AND mr.isdelete = "Active" ORDER BY mrq.query_pid DESC LIMIT 1`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Manpower requisition not found.' });
        }

        const row = rows[0];
        const fetchManpowerRequisitionById = {
            id: row.mr_id,
            department: row.depart,
            depart_id: row.depart_id,
            employment_status: row.employment_status,
            designation: row.designation,
            num_resources: row.num_resources,
            requirement_type: row.requirement_type,
            project_name: row.project_name,
            projection_plan: row.projection_plan,
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
            tat_agreed: row.tat_agreed,
            delivery_phase: row.delivery_phase,
            hr_review: row.hr_review,
            status: row.status,
            hr_status: row.hr_status,
            director_status: row.director_status,
            hr_comments:row.hr_comments,
            director_comments:row.director_comments,
            created_by: row.created_by,
            isdelete: row.isdelete,
            emp_name: row.emp_name,
            query_name_hr: row.query_name_hr,
            query_name_director: row.query_name_director,
        };

        res.json(fetchManpowerRequisitionById);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/getmanpowerrequisitionFH', authMiddleware, async (req, res) => {

    try {
        const [rows] = await pool.execute('SELECT ep.employee_id, ep.emp_name, ep.emp_resign, ep.ReportingManager, mgr.emp_name AS ReportingManager_Name FROM employee_personal AS ep LEFT JOIN employee_personal AS mgr ON ep.ReportingManager = mgr.employee_id WHERE ep.emp_resign = "12/31/2030" AND ep.ReportingManager != 0 Group By ep.ReportingManager ');

        const fetchManpowerRequisition = rows.map((row, index) => ({
            id: row.id,
            s_no: index + 1,
            emp_name: row.emp_name,
            employee_id: row.ReportingManager,
            ReportingManager: row.ReportingManager_Name,
        }));
        res.json(fetchManpowerRequisition);

    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }

});

router.post('/add-query-form', authMiddleware, async (req, res) => {
    // Use a single `query_name` from the request and get the user from authMiddleware
    const { query_manpower_requisition_pid, query_name, query_created_by, query_is_delete } = req.body;
    const { user } = req; // User details are available from authMiddleware

    if (!query_name || !query_manpower_requisition_pid) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Check if an entry already exists for this requisition PID
        const [existing] = await pool.execute(
            'SELECT query_pid FROM manpower_requisition_query WHERE query_manpower_requisition_pid = ?',
            [query_manpower_requisition_pid]
        );

        const isHrUpdate = user?.emp_id === '1722';

        if (existing.length > 0) {
            // Entry exists, so UPDATE it
            const query_pid = existing[0].query_pid;
            const fieldToUpdate = isHrUpdate ? 'query_name_hr' : 'query_name_director';
            
            const updateQuery = `UPDATE manpower_requisition_query SET ${fieldToUpdate} = ? WHERE query_pid = ?`;
            await pool.execute(updateQuery, [query_name, query_pid]);

            res.status(200).json({ message: 'Query updated successfully.' });
        } else {
            // No entry exists, so INSERT a new one
            const query_created_date = new Date().toISOString().split('T')[0];
            const query_created_time = new Date().toLocaleTimeString('en-US', { hour12: false });

            const fieldToInsert = isHrUpdate ? 'query_name_hr' : 'query_name_director';
            const insertQuery = `INSERT INTO manpower_requisition_query (query_manpower_requisition_pid, ${fieldToInsert}, query_created_by, query_created_date, query_created_time, query_is_delete) VALUES (?, ?, ?, ?, ?, ?)`;
            const insertParams = [query_manpower_requisition_pid, query_name, query_created_by, query_created_date, query_created_time, query_is_delete || 'Active'];
            
            const [result] = await pool.execute(insertQuery, insertParams);
            res.status(201).json({ message: 'New Query created successfully.', manpowerId: result.insertId });
        }

        emitManpowerRequisitionRefresh();
    } catch (error) {
        console.error('Error in /add-query-form:', error);
        res.status(500).json({ message: 'Server error processing query form.' });
    }
});


router.put('/update-status/:id', authMiddleware, async (req, res) => {
    const manpowerId = req.params.id;
    const { status, user, hr_comments, director_comments } = req.body; // Changed from newStatus to status
console.log( status, user, hr_comments, director_comments,"kdsjfhsjkgfgmsdbfsdjks")
    if (!manpowerId || !status || !user) {
        return res.status(400).json({ message: 'Missing required fields: id, status, and user are required.' });
    }
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            let mrfNumber = null;
            if (status === 'HR Approve') {
                // Check if MRF number already exists for this requisition
                const [existingMrf] = await connection.execute('SELECT mrf_number FROM manpower_requisition WHERE id = ?', [manpowerId]);

                if (!existingMrf[0] || !existingMrf[0].mrf_number) {
                    // Find the last MRF number
                    const [lastMrf] = await connection.execute(
                        "SELECT mrf_number FROM manpower_requisition WHERE mrf_number IS NOT NULL AND mrf_number != '' ORDER BY CAST(SUBSTRING_INDEX(mrf_number, '- ', -1) AS UNSIGNED) DESC, id DESC LIMIT 1"
                    );

                    let nextMrfNum = 1;
                    if (lastMrf.length > 0 && lastMrf[0].mrf_number) {
                        const lastNum = parseInt(lastMrf[0].mrf_number.split('- ')[1], 10);
                        if (!isNaN(lastNum)) {
                            nextMrfNum = lastNum + 1;
                        }
                    }
                    mrfNumber = `MRF- ${String(nextMrfNum).padStart(2, '0')}`;
                }
            }

            let query = 'UPDATE manpower_requisition SET status = ?';
            const params = [status];

            if (user?.emp_id === '1400') { // Director
                query += ', director_status = ?, director_comments = ?';
                params.push(status, director_comments);
            } else if (user?.emp_id === '1722') { // HR
                query += ', hr_status = ?, hr_comments = ?';
                params.push(status, hr_comments);
            }

            if (mrfNumber) {
                query += ', mrf_number = ?';
                params.push(mrfNumber);
            }

            query += ' WHERE id = ?';
            params.push(manpowerId);

            await connection.execute(query, params);
            await connection.commit();
            connection.release();
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err; // Rethrow to be caught by outer catch block
        }
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

router.get('/getmanpowerrequisitionFH', authMiddleware, async (req, res) => {

    try {
        const [rows] = await pool.execute('SELECT ep.employee_id, ep.emp_name, ep.emp_resign, ep.ReportingManager, mgr.emp_name AS ReportingManager_Name FROM employee_personal AS ep LEFT JOIN employee_personal AS mgr ON ep.ReportingManager = mgr.employee_id WHERE ep.emp_resign = "12/31/2030" AND ep.ReportingManager != 0 Group By ep.ReportingManager ');

        const fetchManpowerRequisition = rows.map((row, index) => ({
            id: row.id,
            s_no: index + 1,
            emp_name: row.emp_name,
            employee_id: row.ReportingManager,
            ReportingManager: row.ReportingManager_Name,
        }));
        res.json(fetchManpowerRequisition);

    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }

});

router.get('/getmanpowerrequisitionbystatus/:status/:emp_id', authMiddleware, async (req, res) => {
    try {
        const { status, emp_id } = req.params;
        console.log(status, emp_id, "status, emp_id")
        let query = 'SELECT mr.*, ep.emp_name, ed.depart AS department_name FROM manpower_requisition AS mr JOIN employee_personal AS ep ON ep.employee_id = mr.created_by JOIN employee_depart AS ed ON ed.id = mr.department WHERE ';
        const params = [];

        if (status === 'Approve') {
            query += 'mr.status IN (?, ?) AND mr.isdelete = "Active"';
            params.push('Approve', 'HR Approve');
        } else {
            query += 'mr.status = ? AND mr.isdelete = "Active"';
            params.push(status);
        }
        const specialAccessIds = ['12345', '1400', '1722'];

        if (!specialAccessIds.includes(emp_id)) {
            query += ' AND mr.created_by = ?';
            params.push(emp_id);
        }

        query += ' ORDER BY mr.id DESC';
        const [rows] = await pool.execute(query, params);
        const fetchManpowerRequisitionByStatus = rows.map((row, index) => ({
            id: row.id,
            s_no: index + 1,
            department: row.department,
            department_name: row.department_name,
            hiring_tat: row.hiring_tat_fastag == 1 ? "Fastag Hiring (60 Days)" : (row.hiring_tat_normal_cat1 == 1 ? "Normal Hiring – Cat 1 (90 Days)" : (row.hiring_tat_normal_cat2 == 1 ? "Normal Hiring – Cat 2 (120 Days)" : "")),
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
            status: row.status,
            created_by: row.created_by,
            isdelete: row.isdelete,
            emp_name: row.emp_name,
        }));
        res.json(fetchManpowerRequisitionByStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/manager-mrf-counts/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const specialManagers = [12345, 1400, 1722];

        let query = `
            SELECT
                COALESCE(SUM(status = 'Pending'), 0) AS pending_count,
                COALESCE(SUM(status = 'Approve'), 0) AS approve_count,
                COALESCE(SUM(status = 'Reject'), 0) AS reject_count,
                COALESCE(SUM(status = 'Raise Query'), 0) AS raise_query_count,
                COALESCE(SUM(status = 'On Hold'), 0) AS on_hold_count,
                COALESCE(SUM(status = 'Draft'), 0) AS draft_count,
                COALESCE(SUM(status = 'HR Approve'), 0) AS HR_Approve_count,
                COALESCE(COUNT(*), 0) AS total_count
            FROM manpower_requisition
            WHERE isdelete = 'Active'
        `;

        let params = [];

        // Apply created_by filter only if NOT special manager
        if (!specialManagers.includes(Number(id))) {
            query += ` AND created_by = ?`;
            params.push(id);
        }

        const [rows] = await pool.execute(query, params);

        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching MRF count.' });
    }
});

router.get('/manager-list', authMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT * FROM employee_personal 
            WHERE level >= '4' 
            AND emp_pos IN ('Senior Manager','HR Manager','Manager - Account Management','Senior Manager- Operational Excellence','Manager - Software Development','Manager','Manager - Accounts &Finance','Accounts') 
            AND emp_name != 'HR Portal' AND emp_resign = '12/31/2030'`;
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching manager list.' });
    }
});



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
            console.log(req.body, "req.body")
            const {
                department, depart_id, employmentStatus, designation, numResources, requirementType, projectName, projectionPlan, replacementDetail,
                rampUpReason, jobDescription, education, experience, ctcRange, specificInfo, mrfNumber,
                tatAgreed, hrReview, deliveryPhase,
                hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2
            } = req.body;

            // File paths from multer
            const requestorSignPath = req.files?.requestorSign?.[0]?.path;
            const directorSignPath = req.files?.directorSign?.[0]?.path;
            const rampUpFilePath = req.files?.rampUpFile?.[0]?.path;

            const fieldsToUpdate = {
                department: depart_id, employment_status: employmentStatus, designation, num_resources: numResources, requirement_type: requirementType,
                project_name: projectName, projection_plan: projectionPlan, replacement_detail: replacementDetail, ramp_up_reason: rampUpReason, job_description: jobDescription,
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


// router.get('/uploadFiles/submittedArticlesFile/:filename', (req, res) => {
//     const filename = req.params.filename;
//     // const __filename = fileURLToPath(import.meta.url);
//     // const __dirname = path.dirname(__filename);
//     // const imagePath = path.join(__dirname, '..', '..', 'uploadFiles', 'submittedArticlesFile', filename);
//     // res.sendFile(imagePath);
// })


module.exports = router;
