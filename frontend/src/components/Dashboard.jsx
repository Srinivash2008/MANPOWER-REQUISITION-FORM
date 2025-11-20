import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardSummary } from '../redux/dashboard/dashboardSlice';
import { fetchSystemUpdates, fetchKnowledgeBaseUpdates, fetchTrainingDiscussionUpdates, fetchUserUpdates, markUpdateAsRead } from '../redux/systemUpdates/systemUpdateSlice';
import { fetchEmailTemplate } from '../redux/cases/emailTemplateSlice';  
import { fetchAssessmentViewForm } from '../redux/cases/assessmentDataSlice.js';
import { styled, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Button,
  IconButton,
  Modal
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import io from 'socket.io-client';
import swal from 'sweetalert2';
import { keyframes } from '@emotion/react';
import SystemUpdateIcon from '@mui/icons-material/Update';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { NewReleases as NewReleasesIcon } from "@mui/icons-material"; // shiny "new" icon

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area, 
} from "recharts";
import { motion } from "framer-motion"; // ✨ Animation library




const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Pulse animation for buttons
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(255,0,0,0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 10px rgba(255,0,0,0.6); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(255,0,0,0.4); }
`;


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxWidth: '90%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// --- Styled TableCell ---
const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== "cellType", // 🚀 This prevents passing `cellType` to the DOM
})(({ theme, cellType }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeightBold,
    whiteSpace: "nowrap",
    padding: theme.spacing(1),
    border: `2px solid ${theme.palette.divider}`,
    textAlign: "center",
    width: "120px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: theme.typography.body2.fontSize,
    minWidth: 100,
    whiteSpace: "nowrap",
    padding: theme.spacing(1),
    border: `2px solid ${theme.palette.divider}`,
    textAlign: "center",
    verticalAlign: "top",
    width: "150px",
    "& a": {
      textDecoration: "underline",
      fontWeight: theme.typography.fontWeightMedium,
      "&:hover": {
        textDecoration: "none",
      },
    },
    ...(cellType === "awaitingInfo" && {
      backgroundColor: "inherit",
      color: "inherit",
    }),
    ...(cellType === "escalated" && {
      backgroundColor: "inherit",
      color: "inherit",
    }),
    ...(cellType === "today" && {
      backgroundColor: "inherit",
      color: "inherit",
    }),
    ...(cellType === "resolved" && {
      backgroundColor: "inherit",
      color: "inherit",
    }),
  },
}));

// --- Styled TableRow ---
const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== "hasData", // 👈 Do the same here to avoid warnings for hasData
})(({ theme, hasData }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
    cursor: "pointer",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  ...(hasData === false && {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.disabled,
  }),
}));

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

const Dashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const { user } = useSelector((state) => state.auth);
  const dashboardSummary = useSelector((state) => state.dashboard.summary);
  const status = useSelector((state) => state.dashboard.status);
  const error = useSelector((state) => state.dashboard.error);

  const userUpdates = useSelector((state) => state.systemUpdates.userUpdates);
  const userSystemUpdates = useSelector((state) => state.systemUpdates.systemUpdates);
  const userKnowledgeBaseUpdates = useSelector((state) => state.systemUpdates.knowledgeBaseUpdates);
  const userTrainningDiscussionUpdates = useSelector((state) => state.systemUpdates.trainingDiscussionUpdates);

  const emailCount = useSelector((state) => state.emailTemplate.data.length);
  const assessmentUserCount = useSelector((state) => state.assessmentData.data.length);
 
  
  const isAdmin = user?.emp_pos === 'Senior Manager' || user?.emp_pos === 'Senior Client Support Executive';
  const currentUserId = user?.emp_id;


const assessmentsResponses = useSelector((state) => state.assessmentData.data);

// Count assessments where currentUserId is in assessment_response_user
const userAssessmentCount = assessmentsResponses.filter((assessment) => {
  const responseUsers = assessment.assessment_response_user
    ? assessment.assessment_response_user.split(",").map(id => id.trim())
    : [];
  return responseUsers.includes(String(currentUserId));
}).length;

//console.log("Assessment count for current user:", userAssessmentCount);


  ///////////////// system updates - unread count
  const unreadSystemUpdatesCount = userSystemUpdates.filter(update => {
    const readedSystemUsers = update.readed_users ? update.readed_users.split(',').map(Number) : [];
    return !readedSystemUsers.includes(Number(currentUserId));
  }).length;

    ///////////////// knowledge base updates - unread count
  const unreadKnowledgeBaseUpdatesCount = userKnowledgeBaseUpdates.filter(update => {
    const readedKnowledgeBaseUsers = update.readed_users ? update.readed_users.split(',').map(Number) : [];
    return !readedKnowledgeBaseUsers.includes(Number(currentUserId));
  }).length;


      ///////////////// knowledge base updates - unread count
  const unreadTrainningDiscussionUpdatesCount = userTrainningDiscussionUpdates.filter(update => {
    const readedTrainningDiscussionUsers = update.readed_users ? update.readed_users.split(',').map(Number) : [];
    return !readedTrainningDiscussionUsers.includes(Number(currentUserId));
  }).length;

  // View modal state
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewingUpdate, setViewingUpdate] = useState(null);

    const updateTypeLabels = {
  'system-updates': 'System Update',
  'knowledge-base': 'Knowledge Base',
  'training-discussion': 'Training/Discussion',
};
const updateTypeColors = {
  'system-updates': '#1976d2', // Blue
  'knowledge-base': '#2e7d32',   // Green
  'training-discussion': '#ed6c02', // Orange
};

  useEffect(() => {
    if (!user) {
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    // Initial fetch
    dispatch(fetchDashboardSummary());
    if (!isAdmin) {
      dispatch(fetchUserUpdates());
      dispatch(fetchSystemUpdates());
      dispatch(fetchKnowledgeBaseUpdates());
      dispatch(fetchTrainingDiscussionUpdates());
      dispatch(fetchEmailTemplate());
      dispatch(fetchAssessmentViewForm());
    }

    socket.on("dashboard-case-entry-refresh", () => {
      dispatch(fetchDashboardSummary());
     
    });
    
    socket.on('dashboard-refresh', () => {
      dispatch(fetchDashboardSummary());
      if (!isAdmin) {
        dispatch(fetchUserUpdates());
        dispatch(fetchSystemUpdates());
        dispatch(fetchKnowledgeBaseUpdates());
        dispatch(fetchTrainingDiscussionUpdates());
        dispatch(fetchEmailTemplate());
        dispatch(fetchAssessmentViewForm());
      }
    });

    socket.on("system-update", (data) => {
      if (!isAdmin) {
        dispatch(fetchUserUpdates());
        dispatch(fetchSystemUpdates());
        dispatch(fetchKnowledgeBaseUpdates());
        dispatch(fetchTrainingDiscussionUpdates());
        dispatch(fetchEmailTemplate());
        dispatch(fetchAssessmentViewForm());
      }
    });

    return () => {
      socket.disconnect();
    };

  }, [user, dispatch, isAdmin]);

  // Handlers for view modal
  const handleViewOpen = (update) => {
    setViewingUpdate(update);
    setOpenViewModal(true);
  };
  const handleViewClose = () => {
    setOpenViewModal(false);
    setViewingUpdate(null);
  };

  // Mark as read handler
  const handleMarkAsRead = (updateId) => {
    const update = userUpdates.find(u => u.id === updateId);
    if (!update) return;

    const readedSystemUsers = update.readed_users ? update.readed_users.split(',').map(Number) : [];
    const isAlreadyRead = readedSystemUsers.includes(Number(currentUserId));

    if (isAlreadyRead) {
      swal.fire({
        title: 'Already Marked as Read',
        text: 'You have already confirmed this update.',
        icon: '',
        iconHtml: `<img src="/validation/warning.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
        confirmButtonColor: theme.palette.error.main
      });
      return;
    }

    swal.fire({
      title: 'Confirm Read?',
      text: "Are you sure you want to mark this update as read?",
      icon: '',
      iconHtml: `<img src="/validation/question.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
      confirmButtonColor: theme.palette.error.main,
      showCancelButton: true,
      confirmButtonText: 'Yes, I have read it!',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(markUpdateAsRead(updateId)).unwrap()
          .then(() => {
            swal.fire({
              title: 'Marked as Read!',
              text: 'You have successfully read this update.',
              icon: '',
              iconHtml: `<img src="/validation/success.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
              confirmButtonColor: theme.palette.error.main
            });
            dispatch(fetchUserUpdates());
            dispatch(fetchSystemUpdates());
            dispatch(fetchKnowledgeBaseUpdates());
            dispatch(fetchTrainingDiscussionUpdates());
            dispatch(fetchEmailTemplate());
            dispatch(fetchAssessmentViewForm());
          })
          .catch(() => {
            swal.fire({
                title: 'Error',
                text: 'Could not mark update as read.',
                icon: '',
                iconHtml: `<img src="/validation/error.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
                confirmButtonColor: theme.palette.error.main
              });
          });
      }
    });
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

// define this above your component render
const renderLegend = () => {
  return (
    
      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "center", // center all items
        alignItems: "center",
        flexWrap: "wrap", // wrap when small screen
        gap: "20px", // even spacing between items
        paddingTop: 15,
        fontSize: 15,
        fontWeight: 'bold',
      }}>
        <span
          style={{
            width: 12,
            height: 12,
            display: "inline-block",
            background: "#fbc02d",
          }}
        />
        Awaiting Info <span
          style={{
            width: 12,
            height: 12,
            display: "inline-block",
            background: "#d32f2f",
          }}
        />
        Escalate Case <span
          style={{
            width: 12,
            height: 12,
            display: "inline-block",
            background: "#2e7d32",
          }}
        />
        Resolved for Month <span
          style={{
            width: 12,
            height: 12,
            display: "inline-block",
            background: "#0288d1",
          }}
        />
        Today's Count
      </div>

   
  );
};

const renderAdminDashboard = () => (
  <Grid item xs={12}>
    {status === "loading" ? (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    ) : status === "failed" ? (
      <Alert severity="error">{error}</Alert>
    ) : dashboardSummary.length > 0 ? (
      <>
        {/* 📋 Table Section */}
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: theme.shadows[5],
            borderRadius: theme.shape.borderRadius,
            p: 3,
            overflowX: "auto",
          }}
        >
          <Table stickyHeader aria-label="employee case summary table">
            <TableHead>
              <TableRow>
                <StyledTableCell>S.No</StyledTableCell>
                <StyledTableCell>Emp ID</StyledTableCell>
                <StyledTableCell>Emp Name</StyledTableCell>
                <StyledTableCell>Awaiting Info</StyledTableCell>
                <StyledTableCell
                  sx={{
                    backgroundColor: "#d32f2f !important",
                    color: "#fff !important",
                  }}
                >
                  Escalate Case
                </StyledTableCell>
                <StyledTableCell>Today's Count</StyledTableCell>
                <StyledTableCell>Resolved for Month</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {dashboardSummary
              .filter((data) => data.emp_id !== '1606') // Exclude emp_id 1606
              .map((data, index) => {
                const hasData =
                  Number(data.awaiting_information) > 0 ||
                  Number(data.escalate_case) > 0 ||
                  Number(data.today_count) > 0 ||
                  Number(data.resolved_month_count) > 0;

                return (
                  <StyledTableRow key={index} hasData={hasData}>
                    <StyledTableCell>{index + 1}</StyledTableCell>
                    <StyledTableCell>{data.emp_id}</StyledTableCell>
                    <StyledTableCell>{data.emp_name}</StyledTableCell>

                    <StyledTableCell cellType="awaitingInfo">
                      {Number(data.awaiting_information) > 0 ? (
                        <Link
                          component={RouterLink}
                          to={`/pending-cases/${data.emp_id}`}
                          color="inherit"
                        >
                          {data.awaiting_information}
                        </Link>
                      ) : (
                        <span>{data.awaiting_information}</span>
                      )}
                    </StyledTableCell>

                    <StyledTableCell cellType="escalated">
                      {Number(data.escalate_case) > 0 ? (
                        <Link
                          component={RouterLink}
                          to={`/escalated-cases/${data.emp_id}`}
                          color="inherit"
                        >
                          {data.escalate_case}
                        </Link>
                      ) : (
                        <span>{data.escalate_case}</span>
                      )}
                    </StyledTableCell>

                    <StyledTableCell cellType="today">
                      {Number(data.today_count) > 0 ? (
                        <Link
                          component={RouterLink}
                          to={`/today-cases/${data.emp_id}`}
                          color="inherit"
                        >
                          {data.today_count}
                        </Link>
                      ) : (
                        <span>{data.today_count}</span>
                      )}
                    </StyledTableCell>

                    <StyledTableCell cellType="resolved">
                      {Number(data.resolved_month_count) > 0 ? (
                        <Link
                          component={RouterLink}
                          to={`/monthly-resolved-cases/${data.emp_id}`}
                          color="inherit"
                        >
                          {data.resolved_month_count}
                        </Link>
                      ) : (
                        <span>{data.resolved_month_count}</span>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    ) : (
      <Alert severity="info">No dashboard summary data available.</Alert>
    )}
  </Grid>
);


 const renderUserDashboard = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {/* --- First Table: Employee Case Summary --- */}
    <Box>
      {status === "loading" ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : status === "failed" ? (
        <Alert severity="error">{error}</Alert>
      ) : dashboardSummary.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: theme.shadows[5], borderRadius: theme.shape.borderRadius }}
        >
          <Table stickyHeader aria-label="employee case summary table">
            <TableHead>
              <TableRow>
  <StyledTableCell>
    S.No
  </StyledTableCell>

  <StyledTableCell>
    Emp ID
  </StyledTableCell>

  <StyledTableCell>
    Emp Name
  </StyledTableCell>

  <StyledTableCell>
    Awaiting Info
  </StyledTableCell>

  <StyledTableCell
    sx={{ backgroundColor: '#d32f2f !important', color: '#fff !important' }} // Red
  >
    Escalate Case
  </StyledTableCell>

  <StyledTableCell>
    Today's Count
  </StyledTableCell>

  <StyledTableCell>
    Resolved for Month
  </StyledTableCell>
</TableRow>
            </TableHead>
            <TableBody>
              {dashboardSummary.map((data, index) => {
                const hasData =
                  Number(data.awaiting_information) > 0 ||
                  Number(data.escalate_case) > 0 ||
                  Number(data.today_count) > 0 ||
                  Number(data.resolved_month_count) > 0;
                return (
                  <StyledTableRow key={index} hasData={hasData}>
                    <StyledTableCell>{index + 1}</StyledTableCell>
                    <StyledTableCell>{data?.emp_id}</StyledTableCell>
                    <StyledTableCell>{data?.emp_name}</StyledTableCell>
                    <StyledTableCell cellType="awaitingInfo">
                      {Number(data?.awaiting_information) > 0 ? (
                        <Link
                          component={RouterLink}
                          to={`/pending-cases/${data?.emp_id}`}
                          color="inherit"
                        >
                          {data?.awaiting_information}
                        </Link>
                      ) : (
                        <span>{data?.awaiting_information}</span>
                      )}
                    </StyledTableCell>
                    <StyledTableCell cellType="escalated">
                        {Number(data?.escalate_case) > 0 ? (
                          <Link
                            component={RouterLink}
                            to={`/escalated-cases/${data?.emp_id}`}
                            color="inherit"
                          >
                            {data?.escalate_case}
                          </Link>
                        ) : (
                          <span>{data?.escalate_case}</span>
                        )}
                      </StyledTableCell>
                    <StyledTableCell cellType="today">
                      {Number(data?.today_count) > 0 ? (
                        <Link
                          component={RouterLink}
                          to={`/today-cases/${data?.emp_id}`}
                          color="inherit"
                        >
                          {data?.today_count}
                        </Link>
                      ) : (
                        <span>{data?.today_count}</span>
                      )}
                    </StyledTableCell>
                    <StyledTableCell cellType="resolved">
                      {Number(data?.resolved_month_count) > 0 ? (
                        <Link
                          component={RouterLink}
                          to={`/monthly-resolved-cases/${data?.emp_id}`}
                          color="inherit"
                        >
                          {data?.resolved_month_count}
                        </Link>
                      ) : (
                        <span>{data?.resolved_month_count}</span>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">No dashboard summary data available.</Alert>
      )}
    </Box>

    {/* --- Left & Right Section: Escalated Cases + System Updates --- */}
    <Box
      sx={{
        display: "flex",
        gap: 4,
        flexDirection: { xs: "column", md: "row" },
        mt: 5,
        alignItems: "flex-start",
      }}
    >
     

     <Box
  sx={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    py: 0,
  }}
>
  {status === "loading" ? (
    <CircularProgress />
  ) : status === "failed" ? (
    <Alert severity="error">{error}</Alert>
  ) : dashboardSummary.length > 0 ? (
    <>
      {/* Email Templates Table */}
      <TableContainer
        component={Paper}
        elevation={6}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease-in-out",
          maxWidth: 800,
          width: "100%",
          mt: 2,
        }}
      >
        <Table sx={{ width: "100%" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell
                colSpan={4}
                sx={{
                  color: "#fff !important",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  textAlign: "center",
                  py: 1,
                }}
              >
                Email Templates
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {dashboardSummary.map((data, index) => {
              const displayCount = emailCount;

              return (
                <TableRow
                  key={index}
                  sx={{
                    borderBottom: "none",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      transform: "translateY(-2px)",
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {/* Left Cell */}
                  <TableCell
                    colSpan={2}
                    sx={{
                      borderBottom: "none",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 3,
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: "grey.400",
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: "1rem" }}>
                      Count - {displayCount}
                    </Typography>
                  </TableCell>

                  {/* Right Cell */}
                  <TableCell
                    colSpan={2}
                    align="right"
                    sx={{
                      borderBottom: "none",
                      px: 3,
                      py: 1.5,
                      whiteSpace: "nowrap",
                      width: "40%",
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      component={RouterLink}
                      to="/email-template"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        backgroundColor: "grey.500",
                        color: "#fff",
                        fontWeight: 600,
                        borderRadius: "15px",
                        px: 2,
                        py: 0.7,
                        fontSize: "0.75rem",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.08)",
                          boxShadow: "0px 6px 16px rgba(0,0,0,0.3)",
                        },
                      }}
                    >
                      <NewReleasesIcon sx={{ fontSize: "1.2rem", mr: 1 }} />
                      {`View All Templates (${displayCount})`}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Assessments / Feedbacks Table */}
      <TableContainer
        component={Paper}
        elevation={6}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease-in-out",
          maxWidth: 800,
          width: "100%",
          mt: 2,
        }}
      >
        <Table sx={{ width: "100%" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell
                colSpan={4}
                sx={{
                  color: "#fff !important",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  textAlign: "center",
                  py: 1,
                }}
              >
                Assessments / Feedbacks
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {dashboardSummary.map((data, index) => {
              const displayCount = assessmentUserCount - userAssessmentCount;
              const shouldBlink = displayCount > 0;

              return (
                <TableRow
                  key={index}
                  sx={{
                    borderBottom: "none",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      transform: "translateY(-2px)",
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {/* Left Cell */}
                  <TableCell
                    colSpan={2}
                    sx={{
                      borderBottom: "none",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 3,
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: shouldBlink ? "error.main" : "grey.400",
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: "1rem" }}>
                      Count - {displayCount}
                    </Typography>
                  </TableCell>

                  {/* Right Cell */}
                  <TableCell
                    colSpan={2}
                    align="right"
                    sx={{
                      borderBottom: "none",
                      px: 3,
                      py: 1.5,
                      whiteSpace: "nowrap",
                      width: "40%",
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      component={RouterLink}
                      to="/assessment-view"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        backgroundColor: shouldBlink ? "error.main" : "grey.500",
                        color: "#fff",
                        fontWeight: 600,
                        borderRadius: "15px",
                        px: 2,
                        py: 0.7,
                        fontSize: "0.75rem",
                        transition: "all 0.3s ease-in-out",
                        animation: shouldBlink ? `${pulse} 1.5s infinite` : "none",
                        "&:hover": {
                          transform: "scale(1.08)",
                          boxShadow: "0px 6px 16px rgba(0,0,0,0.3)",
                        },
                      }}
                    >
                       <NewReleasesIcon sx={{ fontSize: "1.2rem", mr: 1 }} />
                  {displayCount > 0
                    ? `New ${displayCount} ${displayCount > 1 ? "Assessments" : "Assessment"}`
                    : `View All Assessments (${assessmentUserCount})`}
                      
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  ) : (
    <Alert severity="info">No escalated case data available.</Alert>
  )}
</Box>




      {/* Right: Updates */}
      {/* Right: Updates (replace your current block with this) */}
      <Box
  sx={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    py: 2,
  }} 
>
  <TableContainer
    component={Paper}
    elevation={6}
    sx={{
      borderRadius: 3,
      overflow: "hidden",
      boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
      transition: "all 0.3s ease-in-out",
      maxWidth: 800,
      width: "100%",
    }}
  >
    <Table sx={{width: "100%" }}>
      <TableHead>
        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
          <TableCell
            colSpan={2}
            sx={{
              color: "#fff !important",
              fontWeight: "bold",
              fontSize: "1rem",
              textAlign: "center",
              py: 1,
            }}
          >
            Updates
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
  {[
    { label: "System Updates", count: unreadSystemUpdatesCount, totalcount: userSystemUpdates.length, link: "system-updates", color: "error" },
    { label: "Knowledge Base / Workflow", count: unreadKnowledgeBaseUpdatesCount,  totalcount: userKnowledgeBaseUpdates.length, link: "knowledge-base", color: "info" },
    { label: "Training / Discussion", count: unreadTrainningDiscussionUpdatesCount,  totalcount: userTrainningDiscussionUpdates.length, link: "training-discussion", color: "warning" },
  ].map((item, index) => (
    <TableRow
      key={index}
      sx={{
        borderBottom: "none", // ✅ remove row border
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          backgroundColor: "action.hover",
          transform: "translateY(-2px)",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Left Cell */}
      <TableCell
        sx={{
          borderBottom: "none", // ✅ remove cell border
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2,
        }}
      >
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            bgcolor:
              item.color === "error"
                ? "error.main"
                : item.color === "info"
                ? "info.main"
                : "warning.main",
            flexShrink: 0,
          }}
        />
        <Typography sx={{ fontSize: "1rem" }}>{item.label}</Typography>
      </TableCell>

      {/* Right Cell */}
      <TableCell
        align="right"
        sx={{
          borderBottom: "none", // ✅ remove cell border
          px: 3,
          py: 1.5,
          whiteSpace: "nowrap",
          width: "40%",
          textAlign: "right",
        }}
      >
        <Typography
          component={RouterLink}
          to={`/system-updates?filter=${item.link}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            backgroundColor:
              item.color === "error"
                ? "error.main"
                : item.color === "info"
                ? "info.main"
                : "warning.main",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "15px",
            px: 2,
            py: 0.7,
            fontSize: "0.75rem",
            transition: "all 0.3s ease-in-out",
            animation: item.count > 0 ? `${pulse} 1.5s infinite` : "none",
            "&:hover": {
              transform: "scale(1.08)",
              boxShadow: "0px 6px 16px rgba(0,0,0,0.3)",
            },
          }}
        >
          <NewReleasesIcon sx={{ fontSize: "1.2rem", mr: 1 }} />
          {item.count > 0
            ? `New ${item.count} ${item.count > 1 ? "Updates" : "Update"}`
            : `View All Updates (${item.totalcount})`}
        </Typography>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

    </Table>
  </TableContainer>
      </Box>

</Box>







</Box>
);


  return (
    <Box sx={{ p: 4, pt:12, backgroundColor: theme.palette.background.default, minHeight: '100vh', fontSize: 'small' }}>
      <Paper sx={{ p: 4, mb: 4, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[3] }} style={{ textAlign: 'center' }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.text.primary }}>
          Dashboard <span role="img" aria-label="dashboard" style={{ fontSize: "1.5rem" }}>📊</span>
        </Typography>
        <Typography variant='subtitle1' sx={{ mb: 3 }}>
          Welcome back, <b style={{color:'orange', fontSize:'18px'}}>{user?.emp_name}</b> Here's a summary of the current data.
        </Typography>
        {isAdmin ? renderAdminDashboard() : renderUserDashboard()}
      </Paper>
    </Box>
  );
};

export default Dashboard;
