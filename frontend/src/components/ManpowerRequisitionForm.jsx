import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography, CircularProgress, Alert, Select, MenuItem, FormControl, Button, tableCellClasses, TextField, Grid, TablePagination, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, Menu, ToggleButtonGroup, ToggleButton, Card, CardContent, CardActions,
  Avatar,
  Divider
} from "@mui/material";
import Modal from "@mui/material/Modal";
import { fetchManpowerRequisition, fetchManpowerRequisitionById, addQueryForm, updateManpowerStatus, deleteManpowerRequisition, optimisticUpdateManpowerStatus, revertManpowerStatus, fetchManpowerRequisitionByuserId, fetchManagerList } from '../redux/cases/manpowerrequisitionSlice';
import swal from "sweetalert2";
import { withdrawManpowerRequisition } from '../redux/cases/manpowerrequisitionSlice';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PreviewIcon from '@mui/icons-material/Preview';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import UndoIcon from '@mui/icons-material/Undo';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import "react-quill-new/dist/quill.snow.css";
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { motion, AnimatePresence, color } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '100%', md: '550px' },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#2A7F66', // darkAccent
    color: theme.palette.common.white,
    fontWeight: theme.typography.fontWeightBold,
    whiteSpace: "nowrap",
    padding: theme.spacing(1.5, 2),
    border: `1px solid #C0D1C8`, // lightBorder
    textAlign: "center",
    width: "auto",
    minWidth: 80,
    '&:first-of-type': {
      width: "80px",
      minWidth: "80px",
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: theme.typography.body2.fontSize,
    minWidth: 80,
    whiteSpace: "nowrap",
    padding: theme.spacing(1.5, 2),
    border: `1px solid #E0E0E0`,
    textAlign: "center",
    '&:first-of-type': {
      width: "80px",
      minWidth: "80px",
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: '#F3FAF8', // lightGreenBg
  },
  '&:hover': {
    backgroundColor: '#E9F5F2', // A slightly darker green for hover
  },
}));

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.05, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.05, ease: "easeIn" } },
};

const tickVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 10, delay: 0.05 } },
};

const StatusBadge = ({ status }) => {
  const theme = useTheme();
  let displayStatus = status;
  if (status === 'Approve') {
    displayStatus = 'Approved';
  } else if (status === 'HR Approve') {
    displayStatus = 'HR Approved';
  }
  const statusStyles = {
    'Approve': {
      backgroundColor: '#28a745', // A vibrant green
      color: '#fff',
    },
    'HR Approve': {
      backgroundColor: '#20c997', // A slightly different, teal-like green
      color: '#fff',
    },
    'Pending': {
      backgroundColor: '#ffc107', // A warm amber/yellow
      color: '#212529', // Dark text for better contrast on yellow
    },
    'Reject': {
      backgroundColor: '#dc3545', // A strong red
      color: '#fff',
    },
    'Raise Query': {
      backgroundColor: '#0dcaf0', // A bright cyan/info blue
      color: '#fff',
    },
    'On Hold': {
      backgroundColor: '#6c757d', // A neutral, secondary grey
      color: '#fff',
    },
    'Draft': {
      backgroundColor: '#f8f9fa', // A very light grey
      color: '#6c757d',
      border: `1px solid #dee2e6`
    },
    'withdraw': {
      backgroundColor: '#ff8800', // Orange color
      color: '#fff',
      border: `1px solid #ff8800`
    },
    default: {
      backgroundColor: "#9bebebff", // Default grey
      color: 'white',
    }
  };

  const style = statusStyles[displayStatus] || statusStyles[status] || statusStyles.default;

  const sx = { ...style, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };

  return <Chip label={displayStatus} size="small" sx={{...sx, '& .MuiChip-label': {
        color: 'white'
      }}} />;
};

const ManpowerCard = ({ manpower, index, onEdit, onView, onWithdraw, onDelete, onMenuClick }) => {
  const theme = useTheme(); //NOSONAR
  const { user } = useSelector((state) => state.auth);
  const { managerList } = useSelector((state) => state.manpowerRequisition);
  const raisedByInitial = manpower.emp_name ? manpower.emp_name.charAt(0).toUpperCase() : '?';

  const statusColors = {
    'Approve': { light: '#6EE7B7', main: '#34D399' },
    'HR Approve': { light: '#60A5FA', main: '#3B82F6' },
    'Pending': { light: '#FBBF24', main: '#F59E0B' },
    'Reject': { light: '#F87171', main: '#EF4444' },
    'Raise Query': { light: '#67E8F9', main: '#06B6D4' },
    'On Hold': { light: '#A1A1AA', main: '#71717A' },
    'Draft': { light: '#E5E7EB', main: '#D1D5DB' },
    'Withdraw': { light: '#FCA5A5', main: '#F97316' },
    default: theme.palette.grey[500],
  };

  const { light: lightColor, main: mainColor } = statusColors[manpower.status] || statusColors.default;
  const isHr = user?.emp_id === "12345" || user?.emp_id === "1722";
  const isDirector = user?.emp_id === "1400";
  const isSeniorManager = managerList.some(manager => manager.employee_id === user?.emp_id);

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ height: '100%' }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          backgroundColor: '#fff',
          boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 12px 28px rgba(0,0,0,0.1)`,
          }
        }}>
          {/* Gradient Header */}
          <Box sx={{
            background: `linear-gradient(135deg, ${lightColor} 0%, ${mainColor} 100%)`,
            p: 2,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            color: 'white',
            position: 'relative'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge status={manpower.status} />
              <IconButton size="small" onClick={(e) => onMenuClick(e, manpower.id)} sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, mt: 1.5, textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
              {manpower.designation}
            </Typography>
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {manpower.department_name}
              </Typography>
              <Tooltip title={`Raised by ${manpower.emp_name}`}>
                <Avatar sx={{ bgcolor: mainColor, width: 32, height: 32, fontSize: '0.875rem', fontWeight: 'bold' }}>
                  {raisedByInitial}
                </Avatar>
              </Tooltip>
            </Box>

            <Grid container spacing={2} sx={{ mt: 'auto' }}>
              <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessCenterIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Employment</Typography>
                  <Typography variant="body2" fontWeight="500">{manpower.employment_status}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Created</Typography>
                  <Typography variant="body2" fontWeight="500">{new Date(manpower.created_at).toLocaleDateString()}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeFilledIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Hiring TAT</Typography>
                  <Typography variant="body2" fontWeight="500">{manpower.hiring_tat}</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>          
        </Card>
      </motion.div>
    </Box>
  );
};

const ManpowerRequisition = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const manpowerRequisitionList = useSelector((state) => state.manpowerRequisition.data);
  console.log(manpowerRequisitionList, "manpowerRequisitionList")
  const status = useSelector((state) => state.manpowerRequisition.status);
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawId, setWithdrawId] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isRaiseQueryModalOpen, setIsRaiseQueryModalOpen] = useState(false);
  const [manpowerId, setManpowerId] = useState(null);
  const [manpowerStatus, setManpowerStatus] = useState(null);
  const [form, setForm] = useState({
    query_manpower_requisition_pid: '',
    query_name: '',
  });
  const [error, setError] = useState(false);
  const [isSuccessQueryModalOpen, setIsSuccessQueryModalOpen] = useState(false);
  const [isManpowerRequisitionViewModelOpen, setIsManpowerRequisitionViewModelOpen] = useState(false);

  const [view, setView] = useState('table');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentManpowerId, setCurrentManpowerId] = useState(null);
  const selectedRequisition = useSelector((state) => state.manpowerRequisition.selectedRequisition);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      dispatch(fetchManagerList());
    }
  }, [token, dispatch]);


  const { managerList } = useSelector((state) => state.manpowerRequisition);

  // --- Role-based visibility flags ---
  const isHr = user?.emp_id === "12345" || user?.emp_id === "1722";
  const isDirector = user?.emp_id === "1400";
  const isSeniorManager = managerList.some(manager => manager.employee_id === user?.emp_id);



  useEffect(() => {
    if (status === 'idle' && user) {
      //  dispatch(fetchManpowerRequisition());
      dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
    }
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_URL);
    socket.on('manpowerrequisition-refresh', () => {
      // dispatch(fetchManpowerRequisition());
      dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));

    });
  }, [status, user, dispatch]);

  useEffect(() => {
    //  dispatch(fetchManpowerRequisition());
    dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
  }, [dispatch]);

  const currentUserId = user?.emp_id || null;
  const created_at = new Date().toLocaleTimeString('en-US', { hour12: false });
  const formattedDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (open) {
      setForm((prev) => ({ ...prev, query_manpower_requisition_pid: manpowerId }));
    }
  }, [open, manpowerId]);

  const manpowerArray = Array.isArray(manpowerRequisitionList) ? manpowerRequisitionList : [];

  const filteredManpower = manpowerArray.filter(manpower =>
    manpower?.employment_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manpower?.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedManpower =
    rowsPerPage === -1
      ? filteredManpower
      : filteredManpower.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleMenuClick = (event, manpowerId) => {
    setAnchorEl(event.currentTarget);
    setCurrentManpowerId(manpowerId);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const TablePaginationActions = (props) => {
    const { count, page, onPageChange } = props;
    const isFirstPage = page === 0;
    const isLastPage = page >= Math.ceil(count / rowsPerPage) - 1;
    const isAllSelected = rowsPerPage === -1;

    const handleToggleShowAll = () => {
      const newRowsPerPage = isAllSelected ? 10 : -1;
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    };

    return (
      <Box sx={{ flexShrink: 0, ml: 2.5, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          onClick={(event) => onPageChange(event, page - 1)}
          disabled={isFirstPage || isAllSelected}
          variant="outlined"
          size="small"
        >
          Previous
        </Button>
        <Button
          onClick={(event) => onPageChange(event, page + 1)}
          disabled={isLastPage || isAllSelected}
          variant="outlined"
          size="small"
        >
          Next
        </Button>
        <Button
          onClick={handleToggleShowAll}
          variant="outlined"
          size="small"
        >
          {isAllSelected ? "Hide All" : "Show All"}
        </Button>
      </Box>
    );
  };


  //   const handleStatusChange = (event, manpowerId) => {
  //     const newStatus = event.target.value;
  //     const originalManpower = manpowerArray.find((M) => M.id === manpowerId);

  //     if (!originalManpower || newStatus === originalManpower.status) {
  //       return;
  //     }

  //     if (newStatus === "Raise Query") {
  //       setManpowerId(manpowerId);
  //       setManpowerStatus(newStatus);
  //       setIsRaiseQueryModalOpen(true);
  //       return;
  //     }

  //     swal.fire({
  //       title: "Are you sure?",
  //       text: `Change status from "${originalManpower.status}" to "${newStatus}"?`,
  //       icon: '',
  //       iconHtml: `<img src="/validation/warning.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
  //       showCancelButton: true,      
  //       confirmButtonColor: theme.palette.primary.main,
  //       cancelButtonColor: theme.palette.error.main,
  //       confirmButtonText: "Yes, update it!",
  //     }).then(async (result) => {
  //       if (!result.isConfirmed) {
  //         return;
  //       }

  //       dispatch(optimisticUpdateManpowerStatus({ manpowerId, newStatus }));
  // console.log('Dispatched optimistic update for manpowerId:', manpowerId, 'with newStatus:', newStatus);
  //        try {
  //         await dispatch(updateManpowerStatus({ manpowerId, newStatus })).unwrap();
  //         swal.fire({
  //           title: 'Updated!',
  //           text: 'Manpower status updated successfully.',
  //           icon: '',
  //           iconHtml: `<img src="/validation/success.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
  //           confirmButtonColor: theme.palette.error.main,
  //           confirmButtonText: 'OK'
  //         });
  //       } catch (err) {
  //         dispatch(revertManpowerStatus({ manpowerId, originalManpower }));
  //         swal.fire({
  //           title: 'Error!',
  //           text: err.message || 'Failed to update Manpower.',
  //           icon: '',
  //           iconHtml: `<img src="/validation/error.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
  //           confirmButtonColor: theme.palette.error.main,
  //           confirmButtonText: 'OK'
  //         });
  //       }
  //     });
  //   }

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    const deletemanpowerdata = {
      id: deleteId,
      is_delete: 'Inactive',
    };

    dispatch(deleteManpowerRequisition(deletemanpowerdata));
    setIsDeleteModalOpen(false);
    setIsSuccessModalOpen(true); // Show success modal after deletion.
    setDeleteId(null);
  };

  const handleWithdrawClick = (id) => {
    setWithdrawId(id);
    setIsWithdrawModalOpen(true);
  };

  const confirmWithdraw = () => {
    const withdrawData = {
      id: withdrawId,
    };

    dispatch(withdrawManpowerRequisition(withdrawData));
    setIsWithdrawModalOpen(false);
    setIsSuccessModalOpen(true);
    setWithdrawId(null);
  };


  const handleClose = () => {
    setIsDeleteModalOpen(false);
    setIsSuccessModalOpen(false)
    setIsRaiseQueryModalOpen(false);
    setIsSuccessQueryModalOpen(false);
    setIsManpowerRequisitionViewModelOpen(false);
  };


  const handleSaveSubmit = (e) => {
    e.preventDefault();

    const query_manpower_requisition_pid = form.query_manpower_requisition_pid;
    const query_name = form.query_name;
    // Validation: check if query_name is empty
    if (!query_name.trim()) {
      setError(true);
      return;
    }

    const queryAddData = {
      query_manpower_requisition_pid: query_manpower_requisition_pid,
      query_name: query_name,
      query_created_by: currentUserId,
      query_created_date: formattedDate,
      query_created_time: created_at,
      query_is_delete: 'Active',
    };

    dispatch(addQueryForm(queryAddData));
    dispatch(updateManpowerStatus({ manpowerId: manpowerId, newStatus: manpowerStatus })).unwrap();
    setIsRaiseQueryModalOpen(false);
    setIsSuccessQueryModalOpen(true);

  }

  const handleViewClick = (id) => {
    navigate(`/manpower_requisition_view/${id}`);
  }
  const handleEditClick = (id) => {
    navigate(`/manpower_requisition_edit/${id}`);
  }


  return (
    <Box sx={{ p: 4, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 12 }}>
          <Paper sx={{ p: 2, borderRadius: '8px', marginTop: '12vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6' sx={{
                flexGrow: 1,
                cursor: 'pointer',
                display: 'inline-block',
                '@keyframes moveWord': {
                  '0%': { transform: 'translate(0, 0)' },
                  '25%': { transform: 'translate(5px, -5px)' },   // Move right and up
                  '50%': { transform: 'translate(10px, 0)' },    // Move further right
                  '75%': { transform: 'translate(5px, 5px)' },   // Move right and down
                  '100%': { transform: 'translate(0, 0)' },      // Back to initial
                },
                '&:hover': {
                  animation: 'moveWord 1s ease-in-out forwards',
                },
              }}
              >
                Manpower Requisition List
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => { //NOSONAR
                    setSearchTerm(e.target.value);
                    setPage(0); // Reset to first page when searching
                  }}
                  sx={{ width: '280px' }}
                />
                
              </Box>
            </Box>
            {view === 'table' ? (
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: "auto",
                  maxWidth: "100%",
                }}
              >
                <Table sx={{ minWidth: 700 }}>
                  <TableHead className="custom-header">
                    <TableRow>
                      <StyledTableCell>S.No</StyledTableCell>
                      <StyledTableCell>Name</StyledTableCell>
                      <StyledTableCell>Department</StyledTableCell>
                      <StyledTableCell>Status of Employment</StyledTableCell>
                      <StyledTableCell>Designation</StyledTableCell>
                      <StyledTableCell>Requirement Type</StyledTableCell>
                      <StyledTableCell>TAT Request</StyledTableCell>
                      <StyledTableCell>Created Date</StyledTableCell>
                      <StyledTableCell>Director Status</StyledTableCell>
                      <StyledTableCell>HR Status</StyledTableCell>
                      <StyledTableCell>Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedManpower.length > 0 ? (
                      paginatedManpower.map((manpower, index) => (
                        <StyledTableRow key={manpower.id}>
                          <StyledTableCell component="th" scope="row">{page * rowsPerPage + index + 1}</StyledTableCell>
                          <StyledTableCell>{manpower.created_by === 0 ? "-" : `${manpower.emp_name}`}</StyledTableCell>
                          <StyledTableCell>{manpower.department_name}</StyledTableCell>
                          <StyledTableCell>{manpower.employment_status}</StyledTableCell>
                          <StyledTableCell>{manpower.designation}</StyledTableCell>
                          <StyledTableCell>{manpower.requirement_type}</StyledTableCell>
                          <StyledTableCell style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{manpower.hiring_tat}</StyledTableCell>
                          <StyledTableCell>{manpower.created_at ? new Date(manpower.created_at).toLocaleDateString() : '-'}</StyledTableCell>
                          <StyledTableCell><StatusBadge status={manpower.director_status !== "Pending" ? manpower.director_status : "-"} /></StyledTableCell>
                          <StyledTableCell><StatusBadge status={manpower.hr_status !== "Pending" ? manpower.hr_status : "-"} /></StyledTableCell>
                          {/* <StyledTableCell><StatusBadge status={manpower.status} /></StyledTableCell> */}
                          <StyledTableCell>
                            <IconButton aria-label="more" aria-controls={`actions-menu-${manpower.id}`} aria-haspopup="true" onClick={(event) => handleMenuClick(event, manpower.id)}>
                              <MoreVertIcon />
                            </IconButton>
                            <Menu
                              id={`actions-menu-${manpower.id}`}
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl) && currentManpowerId === manpower.id}
                              onClose={handleMenuClose}
                              PaperProps={{ style: { boxShadow: '0px 1px 5px rgba(0,0,0,0.2)' } }}
                            >
                              <MenuItem onClick={() => { handleViewClick(manpower.id); handleMenuClose(); }}><PreviewIcon sx={{ mr: 1.5, color: 'info.main' }} />View</MenuItem>
                              {/* {!((isHr && manpower.hr_status === "Approve") ||
                                (isDirector && manpower.director_status === "HR Approve") ||
                                (isSeniorManager && (manpower.director_status === "Approve" || manpower.hr_status === "HR Approve"))) && (
                                  <MenuItem onClick={() => { handleEditClick(manpower.id); handleMenuClose(); }}><EditDocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />Edit</MenuItem>
                                )} */}



                              {(isDirector && manpower.director_status !== "Approve")
                                && <MenuItem onClick={() => { handleEditClick(manpower.id); handleMenuClose(); }}><EditDocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />Edit</MenuItem>
                              }
                              {(user.emp_id == "1722" && manpower.hr_status !== "HR Approve")
                                && <MenuItem onClick={() => { handleEditClick(manpower.id); handleMenuClose(); }}><EditDocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />Edit</MenuItem>
                              }
                              {isSeniorManager && user.emp_id !== "1722" && manpower.director_status !== "Approve" && manpower.hr_status !== "HR Approve"
                                && <MenuItem onClick={() => { handleEditClick(manpower.id); handleMenuClose(); }}><EditDocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />Edit</MenuItem>
                              }



                              {manpower.isWithdrawOpen === 1 && (user.emp_id !== "1722" && user.emp_id !== "1400") && manpower.status === 'Pending' && (
                                <MenuItem onClick={() => { handleWithdrawClick(manpower.id); handleMenuClose(); }}><UndoIcon sx={{ mr: 1.5, color: 'warning.main' }} />Withdraw</MenuItem>
                              )}
                              {(user.emp_id !== "1722" && user.emp_id !== "1400") && manpower.status === 'Pending' && (
                                <MenuItem onClick={() => { handleDeleteClick(manpower.id); handleMenuClose(); }}><DeleteForeverIcon sx={{ mr: 1.5, color: 'error.main' }} />Delete</MenuItem>
                              )}
                            </Menu>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <StyledTableRow>
                        <StyledTableCell colSpan={10} align="center">
                          No data available.
                        </StyledTableCell>
                      </StyledTableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ pt: 2 }}>
                {paginatedManpower.length > 0 ? (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)', // 2 cards on small screens
                    md: 'repeat(3, 1fr)'  // 3 cards on medium and larger screens
                  },
                  gap: 3
                }}>
                    {paginatedManpower.map((manpower, index) => (
                      <ManpowerCard
                        key={manpower.id}
                        manpower={manpower}
                        isHr={isHr}
                        isDirector={isDirector}
                        isSeniorManager={isSeniorManager}
                        managerList={managerList}
                        index={index}
                        onView={handleViewClick}
                        onEdit={handleEditClick}
                        onWithdraw={handleWithdrawClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ textAlign: 'center', p: 4 }}>No data available.</Typography>
                )}
              </Box>
            )}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredManpower.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage === -1 ? paginatedManpower.length : rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rows per page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `All ${assessmentList.length}`} cases`}
              ActionsComponent={TablePaginationActions}
              sx={{
                mt: 2,
                '& .MuiTablePagination-toolbar': {
                  justifyContent: 'flex-end',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 },
                  minHeight: 'auto',
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  mb: { xs: 1, sm: 0 },
                },
                '& .MuiTablePagination-actions': {
                  ml: { xs: 0, sm: 2 }
                },
                '& .MuiInputBase-root': {
                  minWidth: { xs: 'auto', sm: 80 }
                },
                '& .MuiTablePagination-select': {
                  paddingRight: '24px !important',
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      {isDeleteModalOpen && (
        <AnimatePresence>
          <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)', padding: '20px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <motion.div variants={tickVariants} initial="hidden" animate="visible" style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#4CAF50', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'white' }} />
                </motion.div>
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 1 }}>Confirm Deletion</DialogTitle>
              </Box>
              <DialogContent sx={{ p: 0, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>Are you sure you want to delete? This action cannot be undone.</Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
                <Button onClick={handleClose} color="primary" variant="outlined" sx={{ borderRadius: 2, minWidth: '100px' }}>No</Button>
                <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: 2, minWidth: '100px', ml: 2 }}>Yes</Button>
              </DialogActions>
            </motion.div>
          </Dialog>
        </AnimatePresence>
      )}
      {isWithdrawModalOpen && (
        <AnimatePresence>
          <Dialog open={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} maxWidth="xs" fullWidth>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)', padding: '20px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <motion.div variants={tickVariants} initial="hidden" animate="visible" style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#ff9800', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'white' }} />
                </motion.div>
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 1 }}>Confirm Withdraw</DialogTitle>
              </Box>
              <DialogContent sx={{ p: 0, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>Are you sure you want to withdraw this requisition? This action cannot be undone.</Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
                <Button onClick={() => setIsWithdrawModalOpen(false)} color="primary" variant="outlined" sx={{ borderRadius: 2, minWidth: '100px' }}>No</Button>
                <Button onClick={confirmWithdraw} color="warning" variant="contained" sx={{ borderRadius: 2, minWidth: '100px', ml: 2 }}>Yes, Withdraw</Button>
              </DialogActions>
            </motion.div>
          </Dialog>
        </AnimatePresence>
      )}
      {isSuccessModalOpen && (
        <AnimatePresence>
          <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              style={{
                display: 'flex', flexDirection: 'column', backgroundColor: 'white',
                borderRadius: '12px', boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)', padding: '20px',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <motion.div variants={tickVariants} initial="hidden" animate="visible"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'white' }} />
                </motion.div>
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 1 }}>
                  Success!
                </DialogTitle>
              </Box>
              <DialogContent sx={{ p: 0, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  Your Manpower Requisition has been successfully Deleted.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
                <Button onClick={handleClose} color="primary" variant="contained" sx={{ borderRadius: 2, minWidth: '100px' }}>
                  OK
                </Button>
              </DialogActions>
            </motion.div>
          </Dialog>
        </AnimatePresence>
      )}

      {isRaiseQueryModalOpen && (
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" closeAfterTransition={false}  >
          <Box sx={modalStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <AssessmentIcon
                sx={{
                  color: '#1f7150ff',
                  fontSize: 24,               // Customize size as needed
                  transition: 'color 0.3s ease, transform 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#1f7150ff',         // Brighter red on hover
                    transform: 'scale(1.2)', // Slightly grow the icon on hover
                    filter: 'drop-shadow(0 0 5px #1f7150ff)', // Glow effect
                  },
                }}
              />
              <Typography id="modal-modal-title" variant='h6' component="h2" sx={{
                flexGrow: 1,
                cursor: 'pointer',
                display: 'inline-block',
                '@keyframes moveWord': {
                  '0%': { transform: 'translate(0, 0)' },
                  '25%': { transform: 'translate(5px, -5px)' },
                  '50%': { transform: 'translate(10px, 0)' },
                  '75%': { transform: 'translate(5px, 5px)' },
                  '100%': { transform: 'translate(0, 0)' },
                },
                '&:hover': {
                  animation: 'moveWord 1s ease-in-out forwards',
                },
              }}
              >
                Raise Query
              </Typography>
              <IconButton onClick={handleClose} sx={{ width: 50, color: 'red' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box component="form" noValidate autoComplete="off">
              <input type="hidden" name="query_manpower_requisition_pid" value={manpowerId} />
              <input type="hidden" name="status" value={manpowerStatus} />
              <TextField
                fullWidth
                label="Raise Query"
                variant="outlined"
                name="query_name"
                multiline
                minRows={4}
                // value={form.query_name}
                onChange={(e) => setForm({ ...form, query_name: e.target.value })}
                sx={{
                  mb: 2,
                  transition: 'box-shadow 0.3s, border-color 0.3s',
                  '&:hover': {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  },
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1f7150ff',
                    },
                  },
                }}
                error={error}
                helperText={error ? "This field is required" : ""}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleClose}
                  sx={{
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      backgroundColor: 'white',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveSubmit}
                  sx={{
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      backgroundColor: '#1f7150ff',
                    },
                  }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}

      {isSuccessQueryModalOpen && (
        <AnimatePresence>
          <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              style={{
                display: 'flex', flexDirection: 'column', backgroundColor: 'white',
                borderRadius: '12px', boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)', padding: '20px',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <motion.div variants={tickVariants} initial="hidden" animate="visible"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'white' }} />
                </motion.div>
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 1 }}>
                  Success!
                </DialogTitle>
              </Box>
              <DialogContent sx={{ p: 0, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  Your Manpower Requisition Query has been successfully Added.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
                <Button onClick={handleClose} color="primary" variant="contained" sx={{ borderRadius: 2, minWidth: '100px' }}>
                  OK
                </Button>
              </DialogActions>
            </motion.div>
          </Dialog>
        </AnimatePresence>
      )}
    </Box>
  );

}

export default ManpowerRequisition;
