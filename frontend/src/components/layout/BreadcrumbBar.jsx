import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import {
  fetchUserUpdates,
  fetchSystemUpdates,
  fetchKnowledgeBaseUpdates,
  fetchTrainingDiscussionUpdates,
} from "../../redux/systemUpdates/systemUpdateSlice";
import { fetchAssessmentNotificationViewForm } from "../../redux/cases/assessmentDataSlice.js";
// import { fetchShiftNotification } from "../../redux/dashboard/dashboardSlice.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BreadcrumbBar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const ADMIN_ROLES = ['Senior Manager', 'Senior Client Support Executive'];
  const USER_ROLES = ['Client Support Executive'];

  const currentUserRole = user?.emp_pos || "";       // logged in user role
  const currentUserId = user?.emp_id || "";   // logged in user id

  const isAdminq = ADMIN_ROLES.includes(currentUserRole);
  const isUserRole = USER_ROLES.includes(currentUserRole);


  const userUpdates = useSelector((state) => state.systemUpdates.userUpdates);
  const userSystemUpdates = useSelector((state) => state.systemUpdates.systemUpdates);
  const userKnowledgeBaseUpdates = useSelector((state) => state.systemUpdates.knowledgeBaseUpdates);
  const userTrainningDiscussionUpdates = useSelector(
    (state) => state.systemUpdates.trainingDiscussionUpdates
  );

  const assessmentsResponses = useSelector((state) => state.assessmentData.data);
  const assessmentUserRecievedCount = assessmentsResponses.length;

  // const shiftNotificationCount = useSelector((state) => state.dashboard.shiftnotifycount);
  
  

  const [notifications, setNotifications] = useState([]);

  // ===================== Socket.IO and fetch updates =====================
  useEffect(() => {
    if (!currentUserId) return;

    dispatch(fetchUserUpdates());
    dispatch(fetchSystemUpdates());
    dispatch(fetchKnowledgeBaseUpdates());
    dispatch(fetchTrainingDiscussionUpdates());
    dispatch(fetchAssessmentNotificationViewForm());
    // dispatch(fetchShiftNotification());

    const socket = io(API_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("system-update", () => {
      dispatch(fetchUserUpdates());
      dispatch(fetchSystemUpdates());
      dispatch(fetchKnowledgeBaseUpdates());
      dispatch(fetchTrainingDiscussionUpdates());
      dispatch(fetchAssessmentNotificationViewForm());
      //dispatch(fetchShiftNotification());
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, currentUserId]);

  // ===================== Build notifications =====================
  useEffect(() => {
    if (!currentUserId) {
      setNotifications(["Loading user data..."]);
      return;
    }

    const newNotifications = [];
    const userIdNumber = Number(currentUserId);

    const getUnreadCount = (updates) =>
      updates.filter((update) => {
        const readed = update.readed_users ? update.readed_users.split(",").map(Number) : [];
        return !readed.includes(userIdNumber);
      }).length;

    const unreadSystem = getUnreadCount(userSystemUpdates);
    const unreadKB = getUnreadCount(userKnowledgeBaseUpdates);
    const unreadTD = getUnreadCount(userTrainningDiscussionUpdates);

    // Count assessments where currentUserId is in assessment_response_user
     const userAssessmentCount = assessmentsResponses.filter((assessment) => {
      const responseUsers = assessment.assessment_response_user
        ? assessment.assessment_response_user.split(",").map((id) => id.trim())
        : [];
      return responseUsers.includes(String(currentUserId));
    }).length;

    let userAssessmentName = ""; // Start as empty string
    assessmentsResponses.forEach((assessment) => {
      // Convert comma-separated strings to arrays safely
      const sentUsers = assessment.assessment_sent_user
        ? assessment.assessment_sent_user.split(',').map(u => u.trim())
        : [];

      const responseUsers = assessment.assessment_response_user
        ? assessment.assessment_response_user.split(',').map(u => u.trim())
        : [];

      const correctionUsers = assessment.assessment_correction_user
        ? assessment.assessment_correction_user.split(',').map(u => u.trim())
        : [];

      const sentCount = sentUsers.length;
      const responseCount = responseUsers.length;
      const correctionCount = correctionUsers.length;

      // ✅ Logic using if...else if
      if (responseCount === correctionCount) {
        // Remove assessment name if already corrected
        const nameList = userAssessmentName.split(",").map(s => s.trim()).filter(Boolean);
        const updatedList = nameList.filter(name => name !== assessment.assessment_weak);
        userAssessmentName = updatedList.join(", ");
      } else if ((sentCount === responseCount)) {
         // Add assessment name if fully responded
         if (!userAssessmentName.includes(assessment.assessment_weak)) {
          userAssessmentName += (userAssessmentName ? ", " : "") + assessment.assessment_weak;
        }
      }
    }); 

    // const shift_count = shiftNotificationCount[0]?.count;
    
    
    //console.log("Final assessment names:", userAssessmentName);

    //console.log(userAssessmentName,"userAssessmentName");
    
    const totalResponseCount = assessmentUserRecievedCount - userAssessmentCount; 

    if (unreadSystem > 0) newNotifications.push(`🚀 System Updates: ${unreadSystem} new`);
    if (unreadKB > 0) newNotifications.push(`📢 Knowledge Base / Workflow: ${unreadKB} new`);
    if (unreadTD > 0) newNotifications.push(`🛠️ Training / Discussion: ${unreadTD} new`);
    if(isAdminq && userAssessmentName !=""){
        newNotifications.push(`📝 Assessment: ${userAssessmentName} Response All User's`); 
    } else if(isUserRole){
      if (totalResponseCount > 0) newNotifications.push(`📝 Assessment: ${totalResponseCount} new received`);  
    }   
   //if (totalResponseCount > 0) newNotifications.push(`📝 Assessment: ${totalResponseCount} new received`);  
    // if (shift_count > 0) newNotifications.push(`🚀 Shift Updated: ${shift_count} new`);

    setNotifications(newNotifications.length > 0 ? newNotifications : ["No new notifications"]);
  }, [
    userSystemUpdates,
    userKnowledgeBaseUpdates,
    userTrainningDiscussionUpdates,
    currentUserId,
    assessmentsResponses,
  ]);

  // ===================== Render Component =====================
  const hasNotifications = notifications[0] !== "No new notifications";
  const notificationText = notifications.join("  •  ");

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: hasNotifications ? "#f5f5f5" : "#eeeeee", // Light gray backgrounds
        borderBottom: `2px solid ${hasNotifications ? "#90caf9" : "#bdbdbd"}`, // Light blue border for notifications
        overflow: "hidden",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 24px",
        fontSize: "1rem",
        fontWeight: 600,
        marginTop: "4.2%",
        marginBottom: "0%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        textAlign: "right",
      }}
    >
      <AnimatePresence>
        {hasNotifications ? (
          <motion.div
            key={notificationText}
            style={{ display: "inline-block" }}
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{
              repeat: Infinity,
              duration: notificationText.length * 0.4, // Slower speed
              ease: "linear",
            }}
          >
            <Typography
              component="span"
              sx={{
                whiteSpace: "nowrap",
                fontWeight: "inherit",
                color: "inherit",
                letterSpacing: "0.5px",
              }}
            >
              <span role="img" aria-label="alert icon">
                🚨
              </span>{" "}
              {notificationText}{" "}
              <span role="img" aria-label="alert icon">
                🚨
              </span>
            </Typography>
          </motion.div>
        ) : (
          <Typography
            component="span"
            sx={{
              fontWeight: "inherit",
              color: "inherit",
              animation: "none",
            }}
          >
            {notifications[0]}
          </Typography>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default BreadcrumbBar;
