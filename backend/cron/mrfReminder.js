const cron = require("node-cron");
const pool = require("../config/database");
const { transporter } = require("../utils/transporter");
require("dotenv").config();

// ─── Hardcoded Recipients ─────────────────────────────────────────────
const DIRECTOR_EMAIL = 'srinivasan@pdmrindia.com';
const DIRECTOR_NAME  = "Rajesh";
const HR_EMAIL       = "srinivasan@pdmrindia.com";
const HR_NAME        = 'selvi';

// ─── Send Director Reminder Email ─────────────────────────────────────────────
const sendDirectorReminderEmail = async (toEmail, recipientName, mrf, day) => {
    const mrfLink = `${process.env.FRONTEND_URL}`;

    const [rows] = await pool.execute(
        "SELECT emp_name FROM employee_personal WHERE employee_id = ?",
        [mrf.created_by]
    );
    const createdByName = rows.length > 0 ? rows[0].emp_name : "N/A";

    const mailOptions = {
        from: `"PTS MRF System" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Reminder - A New Manpower Requisition Form submitted for your approval`,
        html: `
<div style="font-family: Arial, sans-serif; font-size: 14px;">

  <p>Hello <strong>${recipientName}</strong>,</p>

  <p>A new Manpower Requisition Form (MRF) has been submitted by <strong>${createdByName}</strong> and is now awaiting your review.</p>

  <p>Please review it using the link below: <a href="${mrfLink}">View Manpower Requisition</a></p>

  <p>Thanks & regards,<br>Automated MRF System</p>

</div>
`,
    };
    await transporter.sendMail(mailOptions);
};

// ─── Send HR Reminder Email ─────────────────────────────────────────────
const sendHRReminderEmail = async (toEmail, recipientName, mrf, day) => {
    const mrfLink = `${process.env.FRONTEND_URL}`;

    const [rows] = await pool.execute(
        "SELECT emp_name FROM employee_personal WHERE employee_id = ?",
        [mrf.created_by]
    );
    const createdByName = rows.length > 0 ? rows[0].emp_name : "N/A";

    const mailOptions = {
        from: `"PTS MRF System" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Reminder - A New Manpower Requisition Form submitted for your action`,
        html: `
<div style="font-family: Arial, sans-serif; font-size: 14px;">

  <p>Hello <strong>${recipientName}</strong>,</p>

  <p>A Manpower Requisition Form (MRF) submitted by <strong>${createdByName}</strong> has been approved by the Director and is now awaiting your action.</p>

  <p>Please process it using the link below: <a href="${mrfLink}">View Manpower Requisition</a></p>

  <p>Thanks & regards,<br>Automated MRF System</p>

</div>
`,
    };
    await transporter.sendMail(mailOptions);
};

// ─── Main Reminder Logic ─────────────────────────────────────────────
const sendMrfReminders = async () => {
    try {
        console.log(`[MRF Cron] Running at ${new Date().toISOString()}`);

        // ── Director: Pending MRFs on Day 4 or Day 7 from created_at ──
        const [directorMRFs] = await pool.execute(
            `SELECT 
        mr.*,
        ep.emp_name,
        ep.mail_id,
        ed.depart AS department_name,
        CASE 
          WHEN mr.hiring_tat_fastag = 1 THEN 'Fastag Hiring (60 Days)'
          WHEN mr.hiring_tat_normal_cat1 = 1 THEN 'Normal Hiring - Cat 1 (90 Days)'
          WHEN mr.hiring_tat_normal_cat2 = 1 THEN 'Normal Hiring - Cat 2 (120 Days)'
          ELSE ''
        END AS hiring_tat,
        DATEDIFF(CURDATE(), DATE(mr.created_at)) AS days_elapsed
      FROM manpower_requisition AS mr
      JOIN employee_personal AS ep ON ep.employee_id = mr.created_by
      JOIN employee_depart AS ed ON ed.id = mr.department
      WHERE 
        mr.status = 'Pending'
        AND mr.isdelete = 'Active'
        AND DATEDIFF(CURDATE(), DATE(mr.created_at)) IN (4, 7)
      ORDER BY mr.id DESC`
        );

        // ── HR: Approved MRFs on Day 2 or Day 5 from mrf_dir_approve_date ──
        const [hrMRFs] = await pool.execute(
            `SELECT 
        mr.*,
        ep.emp_name,
        ep.mail_id,
        ed.depart AS department_name,
        CASE 
          WHEN mr.hiring_tat_fastag = 1 THEN 'Fastag Hiring (60 Days)'
          WHEN mr.hiring_tat_normal_cat1 = 1 THEN 'Normal Hiring - Cat 1 (90 Days)'
          WHEN mr.hiring_tat_normal_cat2 = 1 THEN 'Normal Hiring - Cat 2 (120 Days)'
          ELSE ''
        END AS hiring_tat,
        DATEDIFF(CURDATE(), DATE(mr.mrf_dir_approve_date)) AS days_elapsed
      FROM manpower_requisition AS mr
      JOIN employee_personal AS ep ON ep.employee_id = mr.created_by
      JOIN employee_depart AS ed ON ed.id = mr.department
      WHERE 
        mr.status = 'Approve'
        AND mr.isdelete = 'Active'
        AND DATEDIFF(CURDATE(), DATE(mr.mrf_dir_approve_date)) IN (2, 5)
      ORDER BY mr.id DESC`
        );

        if (directorMRFs.length === 0 && hrMRFs.length === 0) {
            console.log("[MRF Cron] No MRFs found to remind.");
            return;
        }

        console.log(`[MRF Cron] Found ${directorMRFs.length} Pending MRF(s) for Director, ${hrMRFs.length} Approved MRF(s) for HR.`);

        for (const mrf of directorMRFs) {
            const day = mrf.days_elapsed >= 7 ? 7 : 4;
            await sendDirectorReminderEmail(DIRECTOR_EMAIL, DIRECTOR_NAME, mrf, day);
            console.log(`[MRF Cron] ✅ Director reminded for Pending MRF #${mrf.mrf_number}`);
        }

        for (const mrf of hrMRFs) {
            const day = mrf.days_elapsed >= 5 ? 5 : 2;
            await sendHRReminderEmail(HR_EMAIL, HR_NAME, mrf, day);
            console.log(`[MRF Cron] ✅ HR reminded for Approved MRF #${mrf.mrf_number}`);
        }

        console.log("[MRF Cron] All reminders sent successfully.");
    } catch (error) {
        console.error("[MRF Cron] Error:", error);
    }
};

// ─── Schedule: Runs Every Day at 9:00 AM IST ────────────────────────
const startMrfReminderCron = () => {
    cron.schedule("0 9 * * *", sendMrfReminders, {
        timezone: "Asia/Kolkata",
    });
    sendMrfReminders();
    console.log("[MRF Cron] Scheduler registered — runs daily at 9:00 AM IST.");
};

module.exports = { startMrfReminderCron };