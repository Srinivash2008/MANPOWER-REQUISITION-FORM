const pool = require('../config/database');
const { emitSystemUpdate, emitToDepartment, emitDiscussionRead  } = require('../socketManager');

exports.createUpdate = async (req, res) => {
 const { start_date, end_date, name, message, updates } = req.body; // 👈 Add updates
 const filePath = req.file ? req.file.path : null;
 const createdBy = req.user.emp_id;
 const adminRoles = ['Senior Manager', 'Senior Client Support Executive'];

 try {
  // 1. Get all ACS_HD user IDs
  const [acsUsers] = await pool.execute(
    "SELECT employee_id, emp_name FROM employee_personal WHERE emp_dept = 'ACS_HD' AND emp_pos NOT IN ('Senior Manager', 'Senior Client Support Executive')"
  );
  const sendedUsers = acsUsers.map(user => user.employee_id).join(',');

  // 2. Insert the new update with the sended_users and updates column populated
  const [result] = await pool.execute(
   // 👈 Add 'updates' to the columns list and '?' to the values list
   "INSERT INTO system_updates (start_date, end_date, name, message, updates, file_path, created_by, sended_users, readed_users) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
   // 👈 Add formData.updates to the parameters array
   [start_date, end_date, name, message, updates, filePath, createdBy, sendedUsers, '']
  );

  // 3. Notify all relevant users and refresh dashboards
  emitToDepartment('Client Support Executive', 'new-update-available', { message: 'A new system update is available!' });
  emitSystemUpdate({ type: 'created', updateId: result.insertId });

  res.status(201).json({ message: 'System update created successfully!', updateId: result.insertId });
 } catch (error) {
  //console.error('Error creating system update:', error);
  res.status(500).json({ message: 'Server error creating update.' });
 }
};

exports.updateUpdate = async (req, res) => {
 const { id } = req.params;
 const { start_date, end_date, name, message, updates } = req.body; // 👈 Add updates
 const filePath = req.file ? req.file.path : null;

 try {
  // 👈 Add 'updates = ?' to the query string
  let query = "UPDATE system_updates SET start_date = ?, end_date = ?, name = ?, message = ?, updates = ?, readed_users = ''";
  // 👈 Add updates to the parameters array
  const params = [start_date, end_date, name, message, updates];

  // If a new file is uploaded, update the file_path
  if (filePath) {
   query += ", file_path = ?";
   params.push(filePath);
  }

  query += " WHERE id = ?";
  params.push(id);

  const [result] = await pool.execute(query, params);

  if (result.affectedRows === 0) {
   return res.status(404).json({ message: 'Update not found.' });
  }

  // Emit a general refresh event to all connected clients
  emitSystemUpdate({ type: 'updated', updateId: id });

  res.json({ message: 'System update updated successfully.' });
 } catch (error) {
  //console.error('Error updating system update:', error);
  res.status(500).json({ message: 'Server error updating update.' });
 }
};


// backend/controllers/systemUpdateController.js

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const adminRoles = ['Senior Manager', 'Senior Client Support Executive'];

  try {
    if (!req.user || !req.user.emp_id) {
      return res.status(401).json({ message: 'Unauthorized: user not found in token.' });
    }

    const userId = Number(req.user.emp_id);

    // 1. Get current sended and readed users
    const [updates] = await pool.execute(
      "SELECT sended_users, readed_users FROM system_updates WHERE id = ?",
      [id]
    );

    const update = updates[0];
    if (!update) {
      return res.status(404).json({ message: 'Update not found.' });
    }

    const sendedUsers = (update.sended_users || '')
      .split(',')
      .filter(Boolean)
      .map(Number);

    let readedUsers = (update.readed_users || '')
      .split(',')
      .filter(Boolean)
      .map(Number);

    // Check if user has already read the update
    if (readedUsers.includes(userId)) {
      return res.status(200).json({ message: 'Update already marked as read.' });
    }

    // Add user to read list
    readedUsers.push(userId);
    const newReadedUsersString = readedUsers.join(',');

    // Update DB
    await pool.execute(
      "UPDATE system_updates SET readed_users = ? WHERE id = ?",
      [newReadedUsersString, id]
    );

    // Notify admins if all users read
    if (sendedUsers.length > 0 && sendedUsers.length === readedUsers.length) {
      adminRoles.forEach((role) => {
        emitToDepartment(role, 'all-users-read-update', {
          updateId: id,
          message: `All users have read update ${id}.`,
        });
      });
    }

    // Emit general refresh
    emitSystemUpdate({ type: 'read', updateId: id });

    res.json({ message: 'Update marked as read.' });
  } catch (error) {
    //console.error('Error marking update as read:', error);
    res.status(500).json({ message: 'Server error marking update as read.' });
  }
};


// ------------------ ADMIN API ------------------
exports.getUpdatesForAdmin = async (req, res) => {
  try {
    const userId = req.user.emp_id;
    const [updates] = await pool.execute(`
      SELECT su.*, d.discussion_send_users, d.discussion_read_users,
        (
          SELECT COUNT(*)
          FROM system_discussions SD
          WHERE SD.discuss_system_pid = su.id
            AND (
              SD.discussion_read_users IS NULL
              OR SD.discussion_read_users = ''
              OR FIND_IN_SET(CONCAT('', ?), SD.discussion_read_users) = 0
            )
        ) AS user_discussion_count
      FROM system_updates su
      LEFT JOIN system_discussions d ON d.discuss_pid = su.id
      WHERE su.is_deleted = 'Active'
      ORDER BY su.created_at DESC
    `, [userId]);

    const formattedUpdates = updates.map(u => {
      const sendUsers = u.discussion_send_users ? u.discussion_send_users.split(',') : [];
      const readUsers = u.discussion_read_users ? u.discussion_read_users.split(',') : [];

      const totalCount = sendUsers.length;
      const readCount = sendUsers.filter(uid => readUsers.includes(uid)).length;
      const unreadCount = totalCount - readCount;


      return {
        ...u,
        totalCount,
        readCount,
        unreadCount
      };
    });

    res.json(formattedUpdates);
  } catch (error) {
    //console.error("❌ Error fetching admin updates:", error);
    res.status(500).json({ message: "Server error fetching updates." });
  }
};

// ------------------ USER API ------------------
exports.getUpdatesForUser = async (req, res) => {
  const userId = req.user.emp_id;

  try {
    const [updates] = await pool.execute(`
      SELECT 
        su.*, 
        d.discussion_send_users, 
        d.discussion_read_users,
        (
          SELECT COUNT(*)
          FROM system_discussions SD
          WHERE SD.discuss_system_pid = su.id
            AND (
              SD.discussion_read_users IS NULL
              OR SD.discussion_read_users = ''
              OR FIND_IN_SET(CONCAT('', ?), SD.discussion_read_users) = 0
            )
        ) AS user_discussion_count
      FROM system_updates su
      LEFT JOIN system_discussions d ON d.discuss_pid = su.id
      WHERE su.is_deleted = 'Active'
        AND FIND_IN_SET(?, su.sended_users)
      ORDER BY su.created_at DESC
    `, [userId, userId]);

    const formattedUpdates = updates.map(u => {
      const sendUsers = u.discussion_send_users ? u.discussion_send_users.split(',') : [];
      const readUsers = u.discussion_read_users ? u.discussion_read_users.split(',') : [];

      const totalCount = sendUsers.length;
      const readCount = sendUsers.filter(uid => readUsers.includes(uid)).length;
      const unreadCount = totalCount - readCount;
      const isUnread = !readUsers.includes(String(userId)); // current user hasn't read

      // 🛠️ Debug console log
      //console.log(`📊 User - Discussion ID: ${u.id}`);
      //console.log(`- Total Users: ${totalCount}`);
      //console.log(`- Read Users: ${readCount}`);
      //console.log(`- Unread Users: ${unreadCount}`);
      //console.log(`- Current User (${userId}) Unread: ${isUnread}`);
      //console.log(`- Send Users: ${sendUsers}`);
      //console.log(`- Read Users List: ${readUsers}`);
      //console.log('-------------------------------------');

      return {
        ...u,
        totalCount,
        readCount,
        unreadCount,
        isUnread
      };
    });

    res.json(formattedUpdates);
  } catch (error) {
    //console.error("❌ Error fetching user updates:", error);
    res.status(500).json({ message: "Server error fetching updates." });
  }
};


exports.getUpdateById = async (req, res) => {
  const { id } = req.params;
  try {
    const [updates] = await pool.execute(
      `SELECT * FROM system_updates WHERE id = ? AND is_deleted = 'Active'`,
      [id]
    );
    if (updates.length > 0) {
      res.json(updates[0]);
    } else {
      res.status(404).json({ message: 'Update not found.' });
    }
  } catch (error) {
    //console.error('Error fetching update by ID:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.softDeleteUpdate = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      `UPDATE system_updates SET is_deleted = 'Inactive' WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Update not found.' });
    }
    // Emit a general refresh event to all connected clients
    emitSystemUpdate({ type: 'deleted', updateId: id });
    
    res.json({ message: 'Update soft-deleted successfully.' });
  } catch (error) {
    //console.error('Error soft-deleting update:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

///////////////////// only get system-updates in updates table list

exports.getSystemUpdatesForUser = async (req, res) => {

  const userId = req.user.emp_id;
  try {
    const [updates] = await pool.execute(
      `
      SELECT * FROM system_updates su
      WHERE su.is_deleted = 'Active' AND FIND_IN_SET(?, su.sended_users)
      AND su.updates = 'system-updates'
      ORDER BY su.created_at DESC`,
      [userId]
    );
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching updates.' });
  }
};

///////////////////// only get knowledge-base in updates table list

exports.getKnowledgeBaseForUser = async (req, res) => {

  const userId = req.user.emp_id;
  try {
    const [updates] = await pool.execute(
      `
      SELECT * FROM system_updates su
      WHERE su.is_deleted = 'Active' AND FIND_IN_SET(?, su.sended_users)
      AND su.updates = 'knowledge-base'
      ORDER BY su.created_at DESC`,
      [userId]
    );
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching updates.' });
  }
};

///////////////////// only get training-discussion in updates table list

exports.getTrainingDiscussionForUser = async (req, res) => {

  const userId = req.user.emp_id;
  try {
    const [updates] = await pool.execute(
      `
      SELECT * FROM system_updates su
      WHERE su.is_deleted = 'Active' AND FIND_IN_SET(?, su.sended_users)
      AND su.updates = 'training-discussion'
      ORDER BY su.created_at DESC`,
      [userId]
    );
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching updates.' });
  }
};
 
// --- New Discussion Functions ---

/**
 * Fetches a comma-separated string of all employee IDs excluding the current user.
 * Assumes 'employee_personal' table has an 'employee_id' column.
 */
const getAllEmployeeIdsExcludingUser = async (pool, currentUserId) => {
    try {
        // Use //console.log to confirm the query is running and data is returned
        //console.log(`Attempting to fetch all employee IDs excluding: ${currentUserId}`);
        
        const [employees] = await pool.execute(
            `SELECT GROUP_CONCAT(employee_id) AS all_other_ids 
             FROM employee_personal 
             WHERE employee_id != ? AND emp_is_delete = 'Active'`,
            [currentUserId]
        );
        
        const ids = employees.length > 0 && employees[0].all_other_ids ? employees[0].all_other_ids : '';
        
        // 🚨 CRITICAL DEBUG: Check the output in your console/logs
        //console.log(`Generated discussion_send_users string: ${ids}`); 
        
        return ids;
    } catch (error) {
        // 🚨 CRITICAL DEBUG: If this error logs, your SQL query is failing
        //console.error("SQL ERROR in getAllEmployeeIdsExcludingUser:", error); 
        return ''; 
    }
};


exports.createDiscussionMessage = async (req, res) => {
    const { discuss_system_pid, discuss_text } = req.body;
    const userId = req.user.emp_id;

    try {
        // Calculate the list of users who need to be notified/sent this discussion.
        // This includes all employees EXCEPT the one sending the message (userId).
        const discussionSendUsers = await getAllEmployeeIdsExcludingUser(pool, userId);

        // 2. Insert the new discussion message, including discussion_send_users
        const [result] = await pool.execute(
            `INSERT INTO system_discussions 
                (discuss_system_pid, discuss_text, discusess_created_user_id, 
                 discuss_flag, discuss_soft_delete, discussion_send_users, discussion_read_users) 
             VALUES 
                (?, ?, ?, 'Send', 'Active', ?, ?)`,
            [discuss_system_pid, discuss_text, userId, discussionSendUsers, userId] // Pass the calculated list here
        );


        // 3. Notify admins about the new message
        const adminRoles = ['Senior Manager', 'Senior Client Support Executive'];
        adminRoles.forEach(role => {
            // emitToDepartment is assumed to be defined globally or imported
            emitToDepartment(role, 'new-discussion-message', {
                updateId: discuss_system_pid,
                message: `New discussion message on update ${discuss_system_pid}.`
            });
        });

        emitSystemUpdate(); 

        res.status(201).json({ message: 'Discussion message sent successfully!', discuss_pid: result.insertId });
    } catch (error) {
        //console.error('Error creating discussion message:', error);
        res.status(500).json({ message: 'Server error creating discussion message.' });
    }
};

exports.getDiscussionThread = async (req, res) => {
    const { id } = req.params;
    try {
        const [messages] = await pool.execute(
            `SELECT
                sd.*,
                ep.emp_name AS sender_name,
                ep.emp_pos AS sender_pos
            FROM
                system_discussions sd
            JOIN
                employee_personal ep ON sd.discusess_created_user_id = ep.employee_id
            WHERE
                sd.discuss_system_pid = ? AND sd.discuss_soft_delete = 'Active'
            ORDER BY
                sd.discusss_createdate_ ASC`,
            [id]
        );
        res.json(messages);
    } catch (error) {
        //console.error('Error fetching discussion thread:', error);
        res.status(500).json({ message: 'Server error fetching discussion thread.' });
    }
};

exports.createReplyMessage = async (req, res) => {
    const { discuss_system_pid, discuss_text, discuss_reply_id } = req.body;
    const userId = req.user.emp_id;

    // Check if the user is an admin
    const isAdmin = ['Senior Manager', 'Senior Client Support Executive'].includes(req.user.emp_pos);
    if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Only admins can reply.' });
    }

    try {
        // 1. Calculate the list of users who should see this reply
        // This includes all employees EXCEPT the admin sending the reply (userId).
        const discussionSendUsers = await getAllEmployeeIdsExcludingUser(pool, userId);

        // 2. Insert the new discussion reply, including discussion_send_users
        const [result] = await pool.execute(
            `INSERT INTO system_discussions 
                (discuss_system_pid, discuss_text, discusess_created_user_id, 
                 discuss_flag, discuss_reply_id, discussion_send_users) 
             VALUES 
                (?, ?, ?, 'Reply', ?, ?)`,
            // Pass the calculated list as the last parameter
            [discuss_system_pid, discuss_text, userId, discuss_reply_id, discussionSendUsers]
        );

        // 3. Find the user who created the original message (for direct notification)
        const [originalSender] = await pool.execute(
            `SELECT discusess_created_user_id FROM system_discussions WHERE discuss_pid = ?`,
            [discuss_reply_id]
        );

        // 4. Send direct notification to the original message sender
        if (originalSender.length > 0) {
            emitToUser(originalSender[0].discusess_created_user_id, 'new-discussion-reply', {
                updateId: discuss_system_pid,
                message: `An admin has replied to your message on update ${discuss_system_pid}.`
            });
        }

        res.status(201).json({ message: 'Reply sent successfully!', discuss_pid: result.insertId });
    } catch (error) {
        //console.error('Error sending reply:', error);
        res.status(500).json({ message: 'Server error sending reply.' });
    }
};

exports.markDiscussionAsRead = async (req, res) => {
  const { messageId } = req.params;
  const userId = Number(req.user.emp_id);

  if (!messageId || isNaN(messageId)) {
    return res.status(400).json({ message: 'Invalid or missing messageId.' });
  }

  try {
    // 1. Fetch discussion
    const [rows] = await pool.execute(
      "SELECT discussion_send_users, discussion_read_users FROM system_discussions WHERE discuss_pid = ?",
      [messageId]
    );

    const discussion = rows[0];
    if (!discussion) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    // 2. Parse current users
    const sendUsers = (discussion.discussion_send_users || '')
      .split(',')
      .filter(Boolean)
      .map(Number);

    let readUsers = (discussion.discussion_read_users || '')
      .split(',')
      .filter(Boolean)
      .map(Number);

    // 3. If already read, exit
    if (readUsers.includes(userId)) {
      return res.status(200).json({ message: 'Already marked as read.' });
    }

    // 4. Add current user to read list
    readUsers.push(userId);
    const updatedReadUsers = readUsers.join(',');

    await pool.execute(
      "UPDATE system_discussions SET discussion_read_users = ? WHERE discuss_pid = ?",
      [updatedReadUsers, messageId]
    );

    // ✅ 5. Emit socket event ONLY for discussion read
    emitDiscussionRead({
      messageId,
      userId,
      readCount: readUsers.length,
      totalRecipients: sendUsers.length,
    });

    return res.json({ message: 'Message marked as read successfully.' });
  } catch (error) {
    //console.error('ERROR in markDiscussionAsRead:', error);
    return res.status(500).json({ message: 'Server error marking message as read.' });
  }
};

// Get unread count for a user for a specific discussion (or update)
exports.getUnreadCountForUser = async (req, res) => {
  try {
    const discussionId = req.params.discussionId; // e.g., discuss_system_pid
    const userId = req.user.emp_id; // current logged-in user

    //console.log("🔎 Checking unread messages for:", { discussionId, userId });

    const [rows] = await pool.execute(
      `SELECT discuss_pid, discussion_read_users, discussion_send_users
       FROM system_discussions
       WHERE discuss_system_pid = ?
         AND FIND_IN_SET(?, discussion_send_users) > 0`,
      [discussionId, userId]
    );

    //console.log("📬 Total messages found:", rows.length);

    let unreadCount = 0;
    rows.forEach(row => {
      const readList = row.discussion_read_users
        ? row.discussion_read_users.split(',').map(x => x.trim())
        : [];

      if (!readList.includes(String(userId))) {
        unreadCount++;
      }
    });

    //console.log(`🔔 Final unread count for user ${userId}:`, unreadCount);

    res.json({ unreadCount });
  } catch (error) {
    //console.error("❌ Error fetching unread count:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Mark all messages in a discussion as read for current user
exports.markDiscussionReadForUser = async (req, res) => {
  try {
    const discussionId = req.params.discussionId;
    const userId = req.user.emp_id;

    const [rows] = await pool.execute(
      `SELECT discuss_pid, discussion_read_users
       FROM system_discussions
       WHERE discuss_system_pid = ?
         AND FIND_IN_SET(?, discussion_send_users) > 0`,
      [discussionId, userId]
    );

    for (const row of rows) {
      const readList = row.discussion_read_users
        ? row.discussion_read_users.split(',').map(x => x.trim())
        : [];

      if (!readList.includes(String(userId))) {
        readList.push(String(userId));
        const newReadUsers = readList.join(',');
        await pool.execute(
          `UPDATE system_discussions SET discussion_read_users = ? WHERE discuss_pid = ?`,
          [newReadUsers, row.discuss_pid]
        );
        //console.log(`✅ Updated discuss_pid ${row.discuss_pid} → ${newReadUsers}`);
      } else {
        //console.log(`ℹ️ Already read discuss_pid ${row.discuss_pid}`);
      }
    }
    emitSystemUpdate();
    res.json({ message: "All messages marked as read" });

  } catch (error) {
    //console.error("❌ Error marking messages as read:", error);
    res.status(500).json({ error: "Server error" });
  }
};

