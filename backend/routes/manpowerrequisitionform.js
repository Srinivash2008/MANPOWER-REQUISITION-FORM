// backend/routes/manpowerrequisition.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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


router.get('/get-user-by-empid/:emp_id', authMiddleware, async (req, res) => {
    try {
        const { emp_id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM employee_personal WHERE employee_id = ?', [emp_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = rows[0];
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});


router.get('/getmanpowerrequisitionbyuser/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        let query = "SELECT mr.*,ep.*,ed.depart AS department_name,CASE WHEN DATEDIFF(CURDATE(),DATE(mr.created_at)) <= 7 THEN TRUE ELSE FALSE END AS isWithdrawOpen FROM manpower_requisition AS mr JOIN employee_personal AS ep ON ep.employee_id=mr.created_by JOIN employee_depart AS ed ON ed.id=mr.department WHERE mr.isdelete='Active'";
        let params = [];

        if (['12345', '1400', '1722'].includes(userId)) {
            query += " AND mr.status != 'Draft' AND mr.status != 'Withdraw'";
        }
        if (!['12345', '1400', '1722'].includes(userId)) {
            query += " AND mr.created_by = ?";
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
            hr_status: row.hr_status,
            director_status: row.director_status,
            isWithdrawOpen: row.isWithdrawOpen,

        }));
        res.json(fetchManpowerRequisitionByUser);

    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});


router.get('/my-requisitions/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        let query = "SELECT mr.*,ep.*,ed.depart AS department_name,CASE WHEN DATEDIFF(CURDATE(),DATE(mr.created_at)) <= 7 THEN TRUE ELSE FALSE END AS isWithdrawOpen FROM manpower_requisition AS mr JOIN employee_personal AS ep ON ep.employee_id=mr.created_by JOIN employee_depart AS ed ON ed.id=mr.department WHERE mr.isdelete='Active'";
        let params = [];

        if (['12345', '1400',].includes(userId)) {
            query += " AND mr.status != 'Draft' AND mr.status != 'Withdraw'";
        }
        if (!['12345', '1400',].includes(userId)) {
            query += " AND mr.created_by = ?";
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
            hr_status: row.hr_status,
            director_status: row.director_status,
            isWithdrawOpen: row.isWithdrawOpen,

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
                    to: "srinivasan@pdmrindia.com",
                    // You might want to CC HR/Recruitment on the FH/Requestor email as well
                    cc: ["srinivasan@pdmrindia.com"],
                    subject: `A New Manpower requisition Form submitted for your approval`,
                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                        ">
                            <p>Hello Rajesh,</p>

                            <p>
                                A new <b>Manpower Requisition Form (MRF)</b> has been submitted by <b>${emp_name}</b> and is now awaiting your review.
                            </p>

                            <p>
                                Please review it using the link below:
                                <a href="${process.env.FRONTEND_URL}">View Manpower Requisition</a>
                            </p>

                            <p style="margin-top: 30px; color: #555;">
                                Thanks & regards,<br>
                                Automated MRF System
                            </p>
                        </div>`
                };

                const directorMailOptions = {
                    from: process.env.EMAIL_USER,
                    to: "srinivasan@pdmrindia.com",
                    cc: ["srinivasan@pdmrindia.com"],
                    subject: 'New MRF Submitted – Notification for Your Review',
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                            <p>Dear Rajesh,</p>
                            <p>
                                This is an automated notification to inform you that a new <b>Manpower Requisition Form (MRF)</b> has been submitted in the system.
                            </p>
                            <p>
                                Please review the submitted MRF and take the necessary action at the earliest.
                            </p>
                            <br>
                            <p style="color: #555;">
                                Thanks & regards,<br>
                                Automated MRF System
                            </p>
                        </div>
                    `
                };



                // Send the two emails sequentially
                try {
                    await transporter.sendMail(requestorMailOptions);
                    await transporter.sendMail(directorMailOptions);

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

        const [rows] = await pool.execute(`SELECT mr.id AS mr_id,ed.id AS depart_id, depart, employment_status, designation, num_resources, requirement_type, project_name, projection_plan, ramp_up_file, replacement_detail, ramp_up_reason, job_description, education, experience, ctc_range, specific_info, hiring_tat_fastag, hiring_tat_normal_cat1, hiring_tat_normal_cat2, mrf_number, tat_agreed, delivery_phase, hr_review, requestor_sign, director_sign, status, hr_status, director_status, hr_comments,  director_comments, created_by, created_at, mrq.query_name_hr, mrq.query_name_director, mrq.query_pid FROM manpower_requisition AS mr JOIN employee_depart AS ed ON ed.id = mr.department LEFT JOIN manpower_requisition_query as mrq ON mr.id = mrq.query_manpower_requisition_pid WHERE mr.id = ? AND mr.isdelete = "Active" ORDER BY mrq.query_pid DESC LIMIT 1`, [id]);

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
            hr_comments: row.hr_comments,
            director_comments: row.director_comments,
            created_by: row.created_by,
            created_at: row.created_at,
            isdelete: row.isdelete,
            emp_name: row.emp_name,
            query_name_hr: row.query_name_hr,
            query_name_director: row.query_name_director,
            created_by: row.created_by
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
        const isDirectorUpdate = user?.emp_id === '1400';


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

        // Fetch creator of the MRF to send an email
        const [mrfCreator] = await pool.execute(
            'SELECT ep.mail_id, ep.emp_name,emp_pass, mr.created_by FROM manpower_requisition mr JOIN employee_personal ep ON mr.created_by = ep.employee_id WHERE mr.id = ?',
            [query_manpower_requisition_pid]
        );
        if (mrfCreator.length > 0) {
            const creator = mrfCreator[0];
            const queryRaiserName = user.emp_name; // From auth middleware

            // Fetch the Functional Head (FH) of the creator
            const [fh] = await pool.execute(
                'SELECT employee_id, mail_id, emp_name FROM employee_personal WHERE employee_id = (SELECT ReportingManager FROM employee_personal WHERE employee_id = ?)',
                [creator.created_by]
            );

            if (fh.length > 0) {
                const fhUser = fh[0];
                // const dataToEncode = JSON.stringify({ pid: query_manpower_requisition_pid, user: mrfCreator[0] });
                // const encodedData = bcrypt.hashSync(dataToEncode, 10);
                const encodedData = jwt.sign(
                    { pid: query_manpower_requisition_pid, user: mrfCreator[0] },
                    process.env.JWT_SECRET,
                    { expiresIn: 7200 }
                );

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    cc: ["srinivasan@pdmrindia.com"],
                    to: "srinivasan@pdmrindia.com",
                    subject: 'Query Raised on MRF',
                    html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <p>Dear ${fhUser.emp_name},</p>
                        <p>
                            <b>${queryRaiserName}</b> has raised a query on an MRF submitted by <b>${creator.emp_name}</b>. Please review the query and provide your reply.
                        </p>
                        <p>
                            You can view the MRF and reply to the query here:
                            <a href="${process.env.FRONTEND_URL}fh-reply/${encodedData}">View and Reply to MRF</a>
                        </p>
                        <br>
                        <p style="color: #555;">
                           Thanks & Regards,<br>
                           Automated MRF System
                        </p>
                    </div>
                `
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`Query notification email sent to FH at ${fhUser.mail_id}`);
                } catch (emailError) {
                    console.error('Failed to send query notification email to FH:', emailError);
                }
            }
        }


        emitManpowerRequisitionRefresh();
    } catch (error) {
        console.error('Error in /add-query-form:', error);
        res.status(500).json({ message: 'Server error processing query form.' });
    }
});


router.post('/reply-to-query/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;
    const { user } = req;

    if (!reply) {
        return res.status(400).json({ message: 'Reply is required.' });
    }

    // Determine which column to update based on who asked the query
    let replyColumn;
    try {
        const [queryRows] = await pool.execute(
            'SELECT query_name_hr, query_name_director FROM manpower_requisition_query WHERE query_manpower_requisition_pid = ?',
            [id]
        );

        if (queryRows.length > 0) {
            if (queryRows[0].query_name_director) {
                replyColumn = 'Director_Query_Answer';
            } else if (queryRows[0].query_name_hr) {
                replyColumn = 'HR_Query_Answer';
            }
        }


        if (replyColumn) {
            await pool.execute(
                `UPDATE manpower_requisition_query SET ${replyColumn} = ? WHERE query_manpower_requisition_pid = ?`,
                [reply, id]
            );
        }

        // Update the main MRF status based on who raised the query
        if (replyColumn === 'Director_Query_Answer') {
            await pool.execute(
                "UPDATE manpower_requisition SET status = 'FH Replied', director_status = 'FH Replied' WHERE id = ?",
                [id]
            );
        } else if (replyColumn === 'HR_Query_Answer') {
            await pool.execute(
                "UPDATE manpower_requisition SET status = 'FH Replied', hr_status = 'FH Replied' WHERE id = ?",
                [id]
            );
        }

        // Notify Rajesh and Selvi
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "srinivasan@pdmrindia.com",
            cc: [],
            subject: 'FH has Replied to a Query',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>Dear Team,</p>
                <p>
                    A Functional Head has replied to a query on MRF ID: ${id}.
                </p>
                <p>
                    You can view the MRF and the reply here:
                    <a href="${process.env.FRONTEND_URL}/manpower_requisition_view/${id}">View MRF</a>
                </p>
                <br>
                <p style="color: #555;">
                   Thanks & Regards,<br>
                   Automated MRF System
                </p>
            </div>
        `
        };

        await transporter.sendMail(mailOptions);

        emitManpowerRequisitionRefresh();
        res.status(200).json({ message: 'Reply submitted successfully.' });
    } catch (error) {
        console.error('Error in /reply-to-query:', error);
        res.status(500).json({ message: 'Server error processing reply.' });
    }
});
router.get('/get-query/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute('SELECT * FROM manpower_requisition_query WHERE query_manpower_requisition_pid = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Query not found.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
});



router.put('/update-status/:id', authMiddleware, async (req, res) => {
    const manpowerId = req.params.id;
    const { status, user, hr_comments, director_comments, data } = req.body; // Changed from newStatus to status
    console.log(data, "datadatadatadatadata")
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
                        const lastNum = parseInt(lastMrf[0].mrf_number.split('-')[1], 10);

                        if (!isNaN(lastNum)) {
                            nextMrfNum = lastNum + 1;
                        }
                    }
                    mrfNumber = `MRF-${String(nextMrfNum).padStart(6, '0')}`;
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
            console.log(status, "statusstatusstatusstatusstatus")
            const isDraftSubmission = data?.status === 'Draft';
            const canSendEmail = isDraftSubmission
                ? user?.emp_id !== '1400'
                : user?.emp_id !== '1400' && user?.emp_id !== '1722';

            if (status === 'Pending' && canSendEmail) {
                const [user_data] = await connection.execute('SELECT * FROM `employee_personal` WHERE employee_id=?', [data?.created_by]);
                console.log(user_data[0], "user_datauser_datauser_datauser_data")
                const user_info = user_data[0];
                // 1. Email to the Requestor/FH (Confirmation) 📧
                // 'to' should ideally be the email of the person who submitted the form (emp_email), not hardcoded.
                // Assuming 'emp_email' is available in the scope. If not, use 'srinivasan@pdmrindia.com' as per your original code.
                const requestorMailOptions = {
                    from: process.env.EMAIL_USER,
                    // The 'to' email should be the submitter's email address (emp_email)
                    // Using srinivasan@pdmrindia.com as a placeholder based on your original 'to' field.
                    to: "srinivasan@pdmrindia.com",
                    // You might want to CC HR/Recruitment on the FH/Requestor email as well
                    cc: ["srinivasan@pdmrindia.com"],
                    subject: `A New Manpower requisition Form submitted for your approval`,
                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                        ">
                            <p>Hello Rajesh,</p>

                            <p>
                                A new <b>Manpower Requisition Form (MRF)</b> has been submitted by <b>${user_info.emp_name}</b> and is now awaiting your review.
                            </p>

                            <p>
                                Please review it using the link below:
                                <a href="${process.env.FRONTEND_URL}">View Manpower Requisition</a>
                            </p>

                            <p style="margin-top: 30px; color: #555;">
                                Thanks & regards,<br>
                                Automated MRF System
                            </p>
                        </div>`
                };

                const directorMailOptions = {
                    from: process.env.EMAIL_USER,
                    to: "srinivasan@pdmrindia.com",
                    cc: ["srinivasan@pdmrindia.com"],
                    subject: 'New MRF Submitted – Notification for Your Review',
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                            <p>Dear Rajesh,</p>
                            <p>
                                This is an automated notification to inform you that a new <b>Manpower Requisition Form (MRF)</b> has been submitted in the system.
                            </p>
                            <p>
                                Please review the submitted MRF and take the necessary action at the earliest.
                            </p>
                            <br>
                            <p style="color: #555;">
                                Thanks & regards,<br>
                                Automated MRF System
                            </p>
                        </div>
                    `
                };


                // Send the two emails sequentially
                try {
                    await transporter.sendMail(requestorMailOptions);
                    await transporter.sendMail(directorMailOptions);

                    res.status(200).json({ message: 'Manpower Requisition Form submitted successfully and notifications sent.' });

                } catch (error) {
                    console.error('Error sending email:', error);
                    // You might want to send a different status if the form was saved but email failed
                    res.status(500).json({ message: 'Form submitted but failed to send email notification.' });
                }
            }

            if (status === "Approve") {
                // Check if a query exists for this manpower requisition
                const [existingQuery] = await connection.execute(
                    'SELECT query_pid FROM manpower_requisition_query WHERE query_manpower_requisition_pid = ?',
                    [manpowerId]
                );

                // If a query exists, delete it
                if (existingQuery.length > 0) {
                    await connection.execute(
                        'DELETE FROM manpower_requisition_query WHERE query_manpower_requisition_pid = ?',
                        [manpowerId]
                    );
                }
                const [user_data] = await connection.execute('SELECT * FROM `employee_personal` WHERE employee_id=?', [data?.created_by]);
                const hiringManager = user_data[0];

                const requestorMailOptions = {
                    from: process.env.EMAIL_USER,
                    // cc: hiringManager?.mail_id,
                    to: "srinivasan@pdmrindia.com",
                    cc: ["srinivasan@pdmrindia.com"],
                    subject: 'MRF Approval Confirmation – Ready for Next Steps',
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                            <p>Dear Selvi,</p>
                            <p>
                                This is an automated notification to inform you that the <b>Manpower Requisition Form (MRF)</b> submitted has been approved by <b>Rajesh</b>.
                            </p>
                            <p>
                                The <b>${hiringManager?.emp_name}</b> has also been notified for further coordination.
                            </p>
                            <br>
                            <p style="color: #555;">
                                Thanks & regards,<br>
                                Automated MRF System
                            </p>
                        </div>`
                };

                // Send the two emails sequentially
                try {
                    await transporter.sendMail(requestorMailOptions);

                    res.status(200).json({ message: 'Manpower Requisition Form submitted successfully and notifications sent.' });

                } catch (error) {
                    console.error('Error sending email:', error);
                    // You might want to send a different status if the form was saved but email failed
                    res.status(500).json({ message: 'Form submitted but failed to send email notification.' });
                }
            }

            if (status == "HR Approve") {

                // Check if a query exists for this manpower requisition
                const [existingQuery] = await connection.execute(
                    'SELECT query_pid FROM manpower_requisition_query WHERE query_manpower_requisition_pid = ?',
                    [manpowerId]
                );

                // If a query exists, delete it
                if (existingQuery.length > 0) {
                    await connection.execute(
                        'DELETE FROM manpower_requisition_query WHERE query_manpower_requisition_pid = ?',
                        [manpowerId]
                    );
                }


                const [user_data] = await connection.execute('SELECT * FROM `employee_personal` WHERE employee_id=?', [data?.created_by]);
                console.log(user_data[0], "user_datauser_datauser_datauser_data")
                const user_info = user_data[0];
                // 1. Email to the Requestor/FH (Confirmation) 📧
                // 'to' should ideally be the email of the person who submitted the form (emp_email), not hardcoded.
                // Assuming 'emp_email' is available in the scope. If not, use 'srinivasan@pdmrindia.com' as per your original code.
                const requestorMailOptions = {
                    from: process.env.EMAIL_USER,
                    // The 'to' email should be the submitter's email address (emp_email)
                    // Using srinivasan@pdmrindia.com as a placeholder based on your original 'to' field.
                    to: "srinivasan@pdmrindia.com",
                    // You might want to CC HR/Recruitment on the FH/Requestor email as well
                    cc: ["srinivasan@pdmrindia.com"],
                    subject: `MRF Approval Confirmation`,
                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                        ">
                            <p>Hello ${user_info?.emp_name},</p>

                            <p>
                                Your <b>Manpower Requisition Form (MRF)</b> has been successfully approved by the <b>HR</b>. Kindly note the MRF number <b>${mrfNumber}</b> generated for your request.  </p>

                            <p style="margin-top: 30px; color: #555;">
                                Thanks & regards,<br>
                                Automated MRF System
                            </p>
                        </div>`
                };
                // Send the two emails sequentially
                try {
                    await transporter.sendMail(requestorMailOptions);

                    res.status(200).json({ message: 'Manpower Requisition Form submitted successfully and notifications sent.' });

                } catch (error) {
                    console.error('Error sending email:', error);
                    // You might want to send a different status if the form was saved but email failed
                    return res.status(500).json({ message: 'Form submitted but failed to send email notification.' });
                }

            }



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

router.put('/withdraw-manpower/:id', authMiddleware, async (req, res) => {
    try {
        const manpowerId = req.params.id;
        const { status } = req.body;

        if (!manpowerId) {
            return res.status(400).json({ message: 'Missing manpower ID' });
        }

        // SQL query to update status
        const query = `UPDATE manpower_requisition SET status = ? WHERE id = ?`;
        const params = [status, manpowerId];

        const [result] = await pool.execute(query, params);

        emitManpowerRequisitionRefresh();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Manpower not found' });
        }

        res.status(200).json({
            message: 'Manpower Requisition successfully withdrawn.',
            id: manpowerId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error withdrawing manpower.' });
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
        let query = 'SELECT mr.*, ep.emp_name, ed.depart AS department_name, CASE WHEN DATEDIFF(CURDATE(),DATE(mr.created_at)) <= 7 THEN TRUE ELSE FALSE END AS isWithdrawOpen FROM manpower_requisition AS mr JOIN employee_personal AS ep ON ep.employee_id = mr.created_by JOIN employee_depart AS ed ON ed.id = mr.department WHERE ';
        const params = [];

        if (status === 'Approve') {
            query += 'mr.status IN (?, ?) AND mr.isdelete = "Active"';
            params.push('Approve', 'HR Approve');
        } else {
            query += 'mr.status = ? AND mr.isdelete = "Active"';
            params.push(status);
        }
        let specialAccessIds = '';
        if (status == 'Draft') {
            specialAccessIds = ['12345', '1400'];
        } else if (status == 'Withdraw') {
            specialAccessIds = ['12345', '1400'];
        } else {
            specialAccessIds = ['12345', '1400', '1722'];
        }

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
            hr_status: row.hr_status,
            created_at: row.created_at,
            director_status: row.director_status,
            isWithdrawOpen: row.isWithdrawOpen,
        }));
        res.json(fetchManpowerRequisitionByStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/manager-mrf-counts/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        const specialManagers = [12345, 1400, 1722];

        let query;
        let params = [];

        const isHr = numericId === 1722;
        const isSpecialManager = specialManagers.includes(numericId);

        const overallSelect = isHr ? `
            COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending_count,
            COALESCE(SUM(CASE WHEN status IN ('Approve', 'HR Approve') THEN 1 ELSE 0 END), 0) AS approve_count,
            COALESCE(SUM(CASE WHEN status = 'Reject' AND (director_status = 'Reject' OR hr_status = 'Reject') THEN 1 ELSE 0 END), 0) AS reject_count,
            COALESCE(SUM(CASE WHEN status = 'Raise Query' AND director_status = 'Raise Query' THEN 1 ELSE 0 END), 0) AS director_raise_query_count,
            COALESCE(SUM(CASE WHEN status = 'Raise Query' AND hr_status = 'Raise Query' THEN 1 ELSE 0 END), 0) AS hr_raise_query_count,
            COALESCE(SUM(CASE WHEN status = 'On Hold' AND (director_status = 'On Hold' OR hr_status = 'On Hold') THEN 1 ELSE 0 END), 0) AS on_hold_count,
            COALESCE(SUM(CASE WHEN status = 'Draft' AND created_by = ? THEN 1 ELSE 0 END), 0) AS draft_count,
            COALESCE(SUM(CASE WHEN status = 'Withdraw' AND created_by = ? THEN 1 ELSE 0 END), 0) AS withdraw_count,
            COALESCE(SUM(CASE WHEN status = 'HR Approve' THEN 1 ELSE 0 END), 0) AS HR_Approve_count,
            COALESCE(SUM(CASE WHEN status NOT IN ('Draft', 'Withdraw') THEN 1 WHEN status IN ('Draft', 'Withdraw') AND created_by = ? THEN 1 ELSE 0 END), 0) AS total_count
        ` : `
            COALESCE(SUM(status = 'Pending'), 0) AS pending_count,
            COALESCE(SUM(status IN ('Approve', 'HR Approve')), 0) AS approve_count,
            COALESCE(SUM(status = 'Reject'), 0) AS reject_count,
            COALESCE(SUM(status = 'On Hold'), 0) AS on_hold_count,
            COALESCE(SUM(CASE WHEN status = 'Raise Query' AND director_status = 'Raise Query' THEN 1 ELSE 0 END), 0) AS director_raise_query_count,
            COALESCE(SUM(CASE WHEN status = 'Raise Query' AND hr_status = 'Raise Query' THEN 1 ELSE 0 END), 0) AS hr_raise_query_count,
            COALESCE(SUM(status = 'Draft'), 0) AS draft_count,
            COALESCE(SUM(status = 'Withdraw'), 0) AS withdraw_count,
            COALESCE(SUM(status = 'HR Approve'), 0) AS HR_Approve_count,
            COALESCE(COUNT(*), 0) AS total_count
        `;

        const directorStatusSelect = `
            COALESCE(SUM(CASE WHEN director_status = 'Pending' THEN 1 ELSE 0 END), 0) AS director_pending_count,
            COALESCE(SUM(CASE WHEN director_status = 'Approve' THEN 1 ELSE 0 END), 0) AS director_approve_count,
            COALESCE(SUM(CASE WHEN director_status = 'Reject' THEN 1 ELSE 0 END), 0) AS director_reject_count,
            COALESCE(SUM(CASE WHEN director_status = 'Raise Query' THEN 1 ELSE 0 END), 0) AS director_raise_query_count,
            COALESCE(SUM(CASE WHEN director_status = 'On Hold' THEN 1 ELSE 0 END), 0) AS director_on_hold_count
        `;

        const hrStatusSelect = `
            COALESCE(SUM(CASE WHEN hr_status = 'Pending' THEN 1 ELSE 0 END), 0) AS hr_pending_count,
            COALESCE(SUM(CASE WHEN hr_status = 'Approve' THEN 1 ELSE 0 END), 0) AS hr_approve_count,
            COALESCE(SUM(CASE WHEN hr_status = 'Reject' THEN 1 ELSE 0 END), 0) AS hr_reject_count,
            COALESCE(SUM(CASE WHEN hr_status = 'Raise Query' THEN 1 ELSE 0 END), 0) AS hr_raise_query_count,
            COALESCE(SUM(CASE WHEN hr_status = 'On Hold' THEN 1 ELSE 0 END), 0) AS hr_on_hold_count
        `;

        query = `
            SELECT
                ${overallSelect},
                ${directorStatusSelect},
                ${hrStatusSelect}
            FROM manpower_requisition
            WHERE isdelete = 'Active'
        `;

        if (isHr) {
            params = [numericId, numericId, numericId];
        }

        if (!isSpecialManager) {
            query += ` AND created_by = ?`; // This applies the filter for the overall counts
            params.push(id);
        }

        const [rows] = await pool.execute(query, params);
        const counts = rows[0];

        const response = {
            overall: {
                pending_count: counts.pending_count,
                approve_count: counts.approve_count,
                reject_count: counts.reject_count,
                director_raise_query_count: counts.director_raise_query_count,
                hr_raise_query_count: counts.hr_raise_query_count,
                on_hold_count: counts.on_hold_count,
                draft_count: counts.draft_count,
                withdraw_count: counts.withdraw_count,
                HR_Approve_count: counts.HR_Approve_count,
                total_count: counts.total_count,
            },
            director_status: {
                pending_count: counts.director_pending_count,
                approve_count: counts.director_approve_count,
                reject_count: counts.director_reject_count,
                raise_query_count: counts.director_raise_query_count,
                on_hold_count: counts.director_on_hold_count,
            },
            hr_status: {
                pending_count: counts.hr_pending_count,
                approve_count: counts.hr_approve_count,
                reject_count: counts.hr_reject_count,
                raise_query_count: counts.hr_raise_query_count,
                on_hold_count: counts.hr_on_hold_count,
            }
        };

        res.json(response);

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
