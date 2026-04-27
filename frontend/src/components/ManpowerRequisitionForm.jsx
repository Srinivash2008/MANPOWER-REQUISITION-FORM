import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography, CircularProgress, Alert, Select, MenuItem, FormControl, Button, tableCellClasses, TextField, Grid, TablePagination, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, Menu, ToggleButtonGroup, ToggleButton, Card, CardContent, CardActions,
  Avatar, InputLabel, Input,
  Divider,
  Backdrop,
  FormHelperText
} from "@mui/material";
import Modal from "@mui/material/Modal";
import MessageIcon from '@mui/icons-material/Message';
import { fetchManpowerRequisition, fetchManpowerRequisitionById, addQueryForm, updateManpowerStatus, deleteManpowerRequisition, optimisticUpdateManpowerStatus, revertManpowerStatus, fetchManpowerRequisitionByuserId, fetchManagerList, my_requisitions, fetchManpowerRequisitionFH, fetchAllRecruitersWithCounts } from '../redux/cases/manpowerrequisitionSlice';
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
import FilterListIcon from '@mui/icons-material/FilterList';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import "react-quill-new/dist/quill.snow.css";
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { motion, AnimatePresence, color } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCheck } from 'react-icons/fa';

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
    whiteSpace: "nowrap", //NOSONAR
    padding: theme.spacing(1.5, 2),
    border: `1px solid #C0D1C8`, // lightBorder
    textAlign: "center",
    width: "auto",
    minWidth: 80,
    '&:first-of-type': {
      width: "40px",
      minWidth: "40px",
      padding: theme.spacing(1.5, 1),
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.7rem',
    minWidth: 80,
    whiteSpace: "nowrap", //NOSONAR
    padding: theme.spacing(1.5, 2),
    border: `1px solid #E0E0E0`,
    textAlign: "center",
    '&:first-of-type': {
      width: "40px",
      minWidth: "40px",
      padding: theme.spacing(1.5, 1),
    },
  },
}));

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== 'status',
})(({ theme, status }) => ({
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
  else if (status === 'Reject') {
    displayStatus = 'Rejected';
  }
  else if (status === 'Withdraw') {
    displayStatus = 'Withdrawn';
  }
  else if (status === 'Raise Query') {
    displayStatus = 'Query Raised';
  }
  else if (status === 'On Hold') {
    displayStatus = 'On Hold';
  }
  else if (status === 'Draft') {
    displayStatus = 'Draft';
  }
  else if (status === 'Pending') {
    displayStatus = 'Submitted';
  }

  const statusStyles = {
    'Approve': {
      backgroundColor: '#28a745',
      color: '#fff',
    },
    'HR Approve': {
      backgroundColor: '#20c997',
      color: '#fff',
    },
    'Pending': {
      backgroundColor: '#b29b58ff',
      color: '#fff',
    },
    'Submitted': {
      backgroundColor: '#b29b58ff',
      color: '#fff',
    },
    'Reject': {
      backgroundColor: '#dc3545',
      color: '#fff',
    },
    'Raise Query': {
      backgroundColor: '#0dcaf0',
      color: '#fff',
    },
    'On Hold': {
      backgroundColor: '#6c757d',
      color: '#fff',
    },
    'Draft': {
      backgroundColor: '#060606ff',
      color: '#6c757d',
      border: `1px solid #dee2e6`
    },
    'Withdrawn': {
      backgroundColor: '#ff8800',
      color: '#fff',
      border: `1px solid #ff8800`
    },
    'FH Replied': {
      backgroundColor: '#ff006a',
      color: '#fff',
      border: `1px solid #ff006a`
    },
    default: {
      backgroundColor: "#9bebebff",
      color: 'white',
    }
  };

  const style = statusStyles[displayStatus] || statusStyles[status] || statusStyles.default;

  const sx = { ...style, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };

  return <Chip label={displayStatus} size="small" sx={{
    ...sx, '& .MuiChip-label': {
      fontSize: '0.7 rem !important',
      color: 'white'
    }
  }} />;
};

const ManpowerCard = ({ manpower, index, onEdit, onView, onWithdraw, onDelete, onMenuClick }) => {
  const theme = useTheme();
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
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);
  const manpowerRequisitionList = useSelector((state) => state.manpowerRequisition.data);
  const status = useSelector((state) => state.manpowerRequisition.status);
  const { recruitersWithCounts } = useSelector((state) => state.manpowerRequisition);
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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusFormData, setStatusFormData] = useState({ status: '', comments: '', currentStatus: '' });
  const [isRaiseQueryOpen, setIsRaiseQueryOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [recruiters, setRecruiters] = useState([]);
  const [statusModalErrors, setStatusModalErrors] = useState({});

  const [functionalHeadFilter, setFunctionalHeadFilter] = useState("");
  const [isStatusFilter, setIsStatusFilter] = useState("");
  // Filter States
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [requirementTypeFilter, setRequirementTypeFilter] = useState("");
  const [tatRequestFilter, setTatRequestFilter] = useState("");
  const [directorStatusFilter, setDirectorStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hrStatusFilter, setHrStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [recruiterFilter, setRecruiterFilter] = useState(""); // New recruiter filter state
  const today = new Date().toISOString().split("T")[0];

  const navigate = useNavigate();

  // Fetch recruiters data for filter dropdown
  useEffect(() => {
    if (user?.emp_id === '1722' || user?.emp_id === '12345') {
      dispatch(fetchAllRecruitersWithCounts());
    }
  }, [dispatch, user?.emp_id]);

  useEffect(() => {
    if (token) {
      dispatch(fetchManagerList());
      dispatch(fetchManpowerRequisitionFH());
    }
  }, [token, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const directorStatus = params.get('director_status');
    const currentStatus = params.get('status');
    const hrStatus = params.get('hr_status');
    const functional_head = params.get('functional_head');
    const isStatus = params.get('isStatus');
    const recruiter_id = params.get('recruiter_id'); // New recruiter_id param

    if (directorStatus) {
      setDirectorStatusFilter(directorStatus);
    }
    if (currentStatus) {
      setStatusFilter(currentStatus);
    }
    if (hrStatus) {
      setHrStatusFilter(hrStatus);
    }
    if (functional_head) {
      setFunctionalHeadFilter(functional_head);
    }
    if (isStatus) {
      setIsStatusFilter(isStatus);
    }
    if (recruiter_id) {
      setRecruiterFilter(recruiter_id);
    }
  }, [location.search]);

  const { managerList, selectedRequisitionFH: manpowerRequisitionFHList } = useSelector((state) => state.manpowerRequisition);

  const isHr = user?.emp_id === "12345" || user?.emp_id === "1722";
  const isDirector = user?.emp_id === "1400";
  const isSeniorManager = managerList.some(manager => manager.employee_id === user?.emp_id);

  useEffect(() => {
    dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
  }, [dispatch, user?.emp_id]);

  useEffect(() => {
    if (user?.emp_id === '1722' || user?.emp_id === '12345') {
      fetch(`${import.meta.env.VITE_API_URL}/api/mrf/recruiters`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setRecruiters(Array.isArray(data) ? data : []))
        .catch(() => setRecruiters([]));
    }
  }, [user?.emp_id, token]);

  useEffect(() => {
    if (location.pathname === '/my-requisitions') {
      dispatch(my_requisitions(user?.emp_id));
    }
  }, [dispatch, location.pathname, user?.emp_id]);

  const currentUserId = user?.emp_id || null;
  const created_at = new Date().toLocaleTimeString('en-US', { hour12: false });
  const formattedDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (open) {
      setForm((prev) => ({ ...prev, query_manpower_requisition_pid: manpowerId }));
    }
  }, [open, manpowerId]);

  const clearFilters = () => {
    setFunctionalHeadFilter("");
    setSearchTerm("");
    setDepartmentFilter("");
    setEmploymentStatusFilter("");
    setDesignationFilter("");
    setRequirementTypeFilter("");
    setTatRequestFilter("");
    setDirectorStatusFilter("");
    setStatusFilter("");
    setHrStatusFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setRecruiterFilter(""); // Clear recruiter filter
    setPage(0);
    // Clear URL params
    navigate('/mrf-list', { replace: true });
  };

  const filteredManpower = manpowerRequisitionList?.filter(manpower => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearchTerm = (manpower?.emp_name && manpower.emp_name.toLowerCase().includes(lowerSearchTerm)) ||
      (manpower?.department_name && manpower.department_name.toLowerCase().includes(lowerSearchTerm)) ||
      (manpower?.employment_status && manpower.employment_status.toLowerCase().includes(lowerSearchTerm)) ||
      (manpower?.designation && manpower.designation.toLowerCase().includes(lowerSearchTerm)) ||
      (manpower?.requirement_type && manpower.requirement_type.toLowerCase().includes(lowerSearchTerm)) ||
      (manpower?.hiring_tat && manpower.hiring_tat.toLowerCase().includes(lowerSearchTerm)) ||
      (manpower?.director_status && manpower.director_status.toLowerCase().includes(lowerSearchTerm)) ||
      (manpower?.hr_status && manpower.hr_status.toLowerCase().includes(lowerSearchTerm)) ||
      (manpower?.created_at && new Date(manpower.created_at).toLocaleDateString().toLowerCase().includes(lowerSearchTerm));

    const matchesFunctionalHead = !functionalHeadFilter || String(manpower.created_by) === String(functionalHeadFilter);
    const matchesDepartment = !departmentFilter || manpower.department_name === departmentFilter;
    const matchesEmploymentStatus = !employmentStatusFilter || manpower.employment_status === employmentStatusFilter;
    const matchesDesignation = !designationFilter || manpower.designation === designationFilter;
    const matchesRequirementType = !requirementTypeFilter || manpower.requirement_type === requirementTypeFilter;
    const matchesTatRequest = !tatRequestFilter || manpower.hiring_tat === tatRequestFilter;
    const matchesDirectorStatus = !directorStatusFilter ||
      (directorStatusFilter === 'Pending'
        ? ['Pending', 'Raise Query', 'On Hold', 'FH Replied'].includes(manpower.director_status)
        : (directorStatusFilter === 'Raise Query'
          ? ['Raise Query', 'FH Replied'].includes(manpower.director_status)
          : manpower.director_status === directorStatusFilter));
    
    const matchesStatus = !statusFilter ||
      (statusFilter === 'Pending'
        ? ['Pending', 'Raise Query', 'On Hold', 'FH Replied'].includes(manpower.status)
        : (statusFilter === 'Raise Query'
          ? ['Raise Query', 'FH Replied'].includes(manpower.status)
          : (statusFilter === 'HR Approve'
            ? (manpower.status === statusFilter && 
               manpower.mrf_track_status !== 'Joined' && 
               manpower.mrf_track_status !== 'Offered' && 
               manpower.mrf_track_status !== 'IJP')
            : manpower.status === statusFilter)));
    
    const matchesHrStatus = !hrStatusFilter ||
      (hrStatusFilter === 'Pending'
        ? (manpower.director_status === 'Approve' && ['Pending', 'Raise Query', 'On Hold', 'FH Replied'].includes(manpower.hr_status))
        : (hrStatusFilter === 'Raise Query'
          ? ['Raise Query', 'FH Replied'].includes(manpower.hr_status)
          : manpower.hr_status === hrStatusFilter));
    
    const matchesStartDate = !startDateFilter || (manpower?.created_at && manpower.created_at.split('T')[0] >= startDateFilter);
    const matchesEndDate = !endDateFilter || (manpower?.created_at && manpower.created_at.split('T')[0] <= endDateFilter);
    const matchesIsStatus = !isStatusFilter ||
      (isStatusFilter === 'Completed'
        ? manpower.hr_status === 'HR Approve' && manpower.mrf_closed_date !== null && manpower.mrf_closed_date !== ''
        : true);
    
    // New recruiter filter
    const matchesRecruiter = !recruiterFilter || String(manpower.recruiter_id) === String(recruiterFilter);

    return matchesSearchTerm && matchesFunctionalHead && matchesDepartment && matchesEmploymentStatus && 
           matchesDesignation && matchesRequirementType && matchesTatRequest && matchesDirectorStatus && 
           matchesStatus && matchesHrStatus && matchesStartDate && matchesEndDate && matchesIsStatus && matchesRecruiter;
  });

  const paginatedManpower =
    rowsPerPage === -1
      ? filteredManpower
      : filteredManpower.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPage(0);
    switch (name) {
      case "functionalHeadFilter": setFunctionalHeadFilter(value); break;
      case "departmentFilter": setDepartmentFilter(value); break;
      case "employmentStatusFilter": setEmploymentStatusFilter(value); break;
      case "designationFilter": setDesignationFilter(value); break;
      case "requirementTypeFilter": setRequirementTypeFilter(value); break;
      case "tatRequestFilter": setTatRequestFilter(value); break;
      case "directorStatusFilter": setDirectorStatusFilter(value); break;
      case "statusFilter": setStatusFilter(value); break;
      case "hrStatusFilter": setHrStatusFilter(value); break;
      case "recruiterFilter": setRecruiterFilter(value); break;
      case "startDateFilter":
        if (endDateFilter && value > endDateFilter) setEndDateFilter("");
        setStartDateFilter(value);
        break;
      case "endDateFilter":
        if (!startDateFilter || value >= startDateFilter) setEndDateFilter(value);
        break;
      default: break;
    }
  };

  const getUniqueValues = (key) => [...new Set(manpowerRequisitionList?.filter(Boolean).map(item => item[key])?.filter(Boolean))];
  const directorStatuses = [{ value: "Pending", label: "Pending" }, { value: "Approve", label: "Approved" }, { value: "Reject", label: "Rejected" }, { value: "Raise Query", label: "Raise Query" }, { value: "On Hold", label: "On Hold" }];
  const hrStatuses = [{ value: "Pending", label: "Pending" }, { value: "HR Approve", label: "HR Approved" }, { value: "Reject", label: "Rejected" }, { value: "Raise Query", label: "Raise Query" }, { value: "On Hold", label: "On Hold" }];

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

  const handleChatboxClick = (id, type) => {
    navigate(`/${type}/${id}`);
  }

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

  const handleOpenStatusModal = (manpower) => {
    setCurrentManpowerId(manpower.id);
    const currentStatus = manpower.status;
    setStatusFormData({
      status: '',
      comments: '',
      current_status: currentStatus
    });
    setQueryText('');
    setIsRaiseQueryOpen(false);
    setStatusModalErrors({});
    setIsStatusModalOpen(true);
    handleMenuClose();
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setCurrentManpowerId(null);
    setStatusModalErrors({});
  };

  const handleStatusFormChange = (e) => {
    const { name, value } = e.target;
    setStatusFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'status' && value === 'Raise Query') {
      setIsRaiseQueryOpen(true);
    } else if (name === 'status') {
      setIsRaiseQueryOpen(false);
    }
  };

  const handleStatusUpdate = async () => {
    const errors = {};
    if (!statusFormData.status) {
      errors.status = 'Please select a status.';
    }
    if (isHr && statusFormData.status === 'HR Approve' && !statusFormData.recruiter_name) {
      errors.recruiter = 'Please select a recruiter.';
    }

    if (Object.keys(errors).length > 0) {
      setStatusModalErrors(errors);
      return;
    }

    setStatusModalErrors({});
    let isSendMail = false;

    switch (statusFormData?.current_status) {
      case 'Draft':
        if (user.emp_id != "1722" && user.emp_id != "1400") {
          isSendMail = true;
        } else {
          isSendMail = false;
        }
        break;
      case 'Pending':
        if (user.emp_id == "1400") {
          isSendMail = true;
        } else {
          isSendMail = false;
        }
        break;
      case 'Approve':
        if (user.emp_id == "1722") {
          isSendMail = true;
        } else {
          isSendMail = false;
        }
        break;
      case 'FH Replied':
        if (user.emp_id == "1400" || user.emp_id == "1722") {
          isSendMail = true;
        } else {
          isSendMail = false;
        }
        break;
      default:
        isSendMail = false;
        break;
    }

    const payload = {
      manpowerId: currentManpowerId,
      newStatus: statusFormData.status == "Draft" ? "Pending" : statusFormData.status,
      hr_comments: (isHr ? statusFormData.comments : null) || null,
      director_comments: (isDirector ? statusFormData.comments : null) || null,
      data: paginatedManpower.find(m => m.id === currentManpowerId),
      isSendMail: isSendMail,
      recruiter_name: statusFormData.status === 'HR Approve' ? statusFormData.recruiter_name || null : null,
      recruiter_id: statusFormData.status === 'HR Approve' ? statusFormData.recruiter_id || null : null,
    };

    try {
      setIsStatusUpdating(true);
      await dispatch(updateManpowerStatus(payload)).unwrap();

      if (statusFormData.status === 'Raise Query' && queryText) {
        const queryAddData = {
          query_manpower_requisition_pid: currentManpowerId,
          query_name: queryText,
          query_created_by: user?.emp_id,
          query_created_date: new Date().toISOString().split('T')[0],
          query_created_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          query_is_delete: 'Active'
        };
        await dispatch(addQueryForm(queryAddData)).unwrap();
      }
      swal.fire('Success', 'Status updated successfully!', 'success');
      handleCloseStatusModal();
      dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
    } catch (error) {
      setIsStatusUpdating(false);
      swal.fire('Error', error.message || 'Failed to update status.', 'error');
    }
    setIsStatusUpdating(false);
  };

  const handleApproveClick = (manpower) => {
    const isHrUser = user?.emp_id === '1722' || user?.emp_id === '12345';

    if (isHrUser && isHr) {
      const options = recruiters
        .map(r => `<option value="${r.emp_name}">${r.emp_name}</option>`)
        .join('');

      swal.fire({
        title: 'Are you sure?',
        html: `
          <p style="margin-bottom:14px;color:#555;font-size:0.95rem;">
            Do you want to HR Approve this requisition?
          </p>
          <div style="position:relative;width:90%;margin:0 auto;">
            <label style="
              position:absolute;
              top:-9px;
              left:10px;
              background:#fff;
              padding:0 4px;
              font-size:0.72rem;
              color:#2A7F66;
              font-family:'Roboto','Helvetica','Arial',sans-serif;
              font-weight:500;
              letter-spacing:0.03em;
              z-index:1;
            ">Assigned Recruiter</label>
            <select id="swal-recruiter" style="
              width:100%;
              padding:14px 36px 14px 14px;
              font-size:0.95rem;
              font-family:'Roboto','Helvetica','Arial',sans-serif;
              color:#333;
              background-color:#fff;
              border:1.5px solid #2A7F66;
              border-radius:6px;
              appearance:none;
              -webkit-appearance:none;
              outline:none;
              cursor:pointer;
              transition:border-color 0.2s,box-shadow 0.2s;
            "
            onfocus="this.style.borderColor='#2A7F66';this.style.boxShadow='0 0 0 2px rgba(42,127,102,0.2)'"
            onblur="this.style.boxShadow='none'"
            >
              <option value="" disabled selected style="color:#aaa;">-- Select Recruiter --</option>
              ${options}
            </select>
            <span style="
              position:absolute;
              right:12px;
              top:50%;
              transform:translateY(-50%);
              pointer-events:none;
              color:#2A7F66;
              font-size:1rem;
            ">▼</span>
          </div>`,
        iconHtml: `<img src="/validation/question.gif" alt="Custom Icon" style="width:100px;height:100px">`,
        icon: '',
        showCancelButton: true,
        confirmButtonColor: theme.palette.success.main,
        cancelButtonColor: theme.palette.error.main,
        confirmButtonText: 'Yes, approve it!',
        preConfirm: () => {
          const recruiter = document.getElementById('swal-recruiter').value;
          if (!recruiter) {
            swal.showValidationMessage('Please select a recruiter before approving.');
            return false;
          }
          const selectedRecruiter = recruiters.find(r => r.emp_name === recruiter);
          return {
            recruiter_name: recruiter,
            recruiter_id: selectedRecruiter?.employee_id || null
          };
        }
      }).then(async (result) => {
        if (result.isConfirmed && result.value) {
          setIsStatusUpdating(true);
          const payload = {
            manpowerId: manpower.id,
            newStatus: 'HR Approve',
            hr_comments: 'Approved',
            director_comments: null,
            data: manpower,
            isSendMail: true,
            recruiter_name: result.value.recruiter_name,
            recruiter_id: result.value.recruiter_id
          };
          try {
            await dispatch(updateManpowerStatus(payload)).unwrap();
            swal.fire('Approved!', 'The requisition has been approved.', 'success');
            dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
          } catch (error) {
            swal.fire('Error', error.message || 'Failed to approve status.', 'error');
          } finally {
            setIsStatusUpdating(false);
          }
        }
      });
    } else {
      swal.fire({
        title: 'Are you sure',
        text: 'Do you want to approve this requisition',
        iconHtml: `<img src="/validation/question.gif" alt="Custom Icon" style="width:100px;height:100px">`,
        icon: '',
        showCancelButton: true,
        confirmButtonColor: theme.palette.success.main,
        cancelButtonColor: theme.palette.error.main,
        confirmButtonText: 'Yes, approve it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          setIsStatusUpdating(true);
          const payload = {
            manpowerId: manpower.id,
            newStatus: 'Approve',
            hr_comments: null,
            director_comments: 'Approved',
            data: manpower,
            isSendMail: true
          };
          try {
            await dispatch(updateManpowerStatus(payload)).unwrap();
            swal.fire('Approved!', 'The requisition has been approved.', 'success');
            dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
          } catch (error) {
            swal.fire('Error', error.message || 'Failed to approve status.', 'error');
          } finally {
            setIsStatusUpdating(false);
          }
        }
      });
    }
  };

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
    setIsSuccessModalOpen(true);
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
    setIsSuccessModalOpen(false);
    setIsRaiseQueryModalOpen(false);
    setIsSuccessQueryModalOpen(false);
    setIsManpowerRequisitionViewModelOpen(false);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    const query_manpower_requisition_pid = form.query_manpower_requisition_pid;
    const query_name = form.query_name;
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
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(200px, 1fr))' },
              gap: 2.5,
              p: 2.5,
              borderRadius: '12px',
              bgcolor: 'rgba(42, 127, 102, 0.05)',
              border: '1px solid rgba(42, 127, 102, 0.1)',
              mb: 3
            }}>
              {(user?.emp_id == "1722" || user?.emp_id == "1400") && (
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Functional Head</InputLabel>
                  <Select
                    name="functionalHeadFilter"
                    value={functionalHeadFilter}
                    onChange={handleFilterChange}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 240,
                        },
                      },
                    }}
                  >
                    <MenuItem value=""><em>All Functional Heads</em></MenuItem>
                    {manpowerRequisitionFHList?.filter(fh => fh.employee_id != 1400).map((fh) => (
                      <MenuItem key={fh.employee_id} value={fh.employee_id}>
                        {fh.ReportingManager}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl variant="standard" fullWidth>
                <InputLabel>Department</InputLabel>
                <Select name="departmentFilter" value={departmentFilter} onChange={handleFilterChange}>
                  <MenuItem value=""><em>All Departments</em></MenuItem>
                  {getUniqueValues('department_name').map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel>Employment Status</InputLabel>
                <Select name="employmentStatusFilter" value={employmentStatusFilter} onChange={handleFilterChange}>
                  <MenuItem value=""><em>All Employment Statuses</em></MenuItem>
                  {getUniqueValues('employment_status').map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel>Requirement Type</InputLabel>
                <Select name="requirementTypeFilter" value={requirementTypeFilter} onChange={handleFilterChange}>
                  <MenuItem value=""><em>All Requirement Types</em></MenuItem>
                  {getUniqueValues('requirement_type').map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel>TAT Request</InputLabel>
                <Select name="tatRequestFilter" value={tatRequestFilter} onChange={handleFilterChange}>
                  <MenuItem value=""><em>All TAT Requests</em></MenuItem>
                  {getUniqueValues('hiring_tat').map(tat => <MenuItem key={tat} value={tat}>{tat}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel>Director Status</InputLabel>
                <Select name="directorStatusFilter" value={directorStatusFilter} onChange={handleFilterChange}>
                  <MenuItem value=""><em>All Director Statuses</em></MenuItem>
                  {directorStatuses.map(status => <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel>Current Status</InputLabel>
                <Select name="statusFilter" value={statusFilter} onChange={handleFilterChange}>
                  <MenuItem value=""><em>All Statuses</em></MenuItem>
                  {getUniqueValues('status').map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel>HR Status</InputLabel>
                <Select name="hrStatusFilter" value={hrStatusFilter} onChange={handleFilterChange}>
                  <MenuItem value=""><em>All HR Statuses</em></MenuItem>
                  {hrStatuses.map(status => <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>)}
                </Select>
              </FormControl>

              {/* New Recruiter Filter */}
              {(user?.emp_id == "1722" || user?.emp_id == "12345") && (
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Recruiter Name</InputLabel>
                  <Select name="recruiterFilter" value={recruiterFilter} onChange={handleFilterChange}>
                    <MenuItem value=""><em>All Recruiters</em></MenuItem>
                    {recruitersWithCounts?.map(recruiter => (
                      <MenuItem key={recruiter.employee_id} value={recruiter.employee_id}>
                        {recruiter.emp_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl variant="standard" fullWidth>
                <InputLabel shrink={true} sx={{ transform: 'translate(0, -1.5px) scale(0.9)', fontSize: '1.1rem' }}>Start Date</InputLabel>
                <Input
                  type="date"
                  name="startDateFilter"
                  value={startDateFilter}
                  onChange={handleFilterChange}
                  max={endDateFilter || today}
                  sx={{
                    '&:before': { borderBottom: '1px solid rgba(0, 0, 0, 0.42)' },
                    '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                  }}
                />
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel shrink={true} sx={{ transform: 'translate(0, -1.5px) scale(0.9)', fontSize: '1.1rem' }}>End Date</InputLabel>
                <Input
                  type="date"
                  name="endDateFilter"
                  value={endDateFilter}
                  onChange={handleFilterChange}
                  min={startDateFilter}
                  max={today}
                  sx={{
                    '&:before': { borderBottom: '1px solid rgba(0, 0, 0, 0.42)' },
                    '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                  }}
                />
              </FormControl>

              <Button
                variant="contained"
                onClick={clearFilters}
                startIcon={<FilterListIcon sx={{ color: "#fff" }} />}
                sx={{
                  height: '36px',
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  alignSelf: 'end'
                }}
              >
                Clear
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6' sx={{
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
                Manpower Requisition List
              </Typography>
              {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ToggleButtonGroup
                  value={view}
                  exclusive
                  onChange={handleViewChange}
                  aria-label="view toggle"
                  size="small"
                >
                  <ToggleButton value="table" aria-label="table view">
                    <ViewListIcon />
                  </ToggleButton>
                  <ToggleButton value="card" aria-label="card view">
                    <ViewModuleIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box> */}
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
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>S.No</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>Name / <br />Department</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>Status of <br />Employment</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>Designation</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>Requirement <br />Type</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>TAT Request</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>Created<br /> Date</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>Recruiter Name</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>Overall Status</StyledTableCell>
                      <StyledTableCell style={{ fontSize: '0.7rem' }}>Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedManpower.length > 0 ? (
                      paginatedManpower.map((manpower, index) => (
                        <StyledTableRow key={manpower.id} status={manpower.status}>
                          <StyledTableCell component="th" scope="row">{page * rowsPerPage + index + 1}</StyledTableCell>
                          <StyledTableCell>{manpower.created_by === 0 ? "-" : `${manpower.emp_name}`}<br />{manpower.department_name}</StyledTableCell>
                          <StyledTableCell>{manpower.employment_status}</StyledTableCell>
                          <StyledTableCell>
                            <Tooltip title={manpower.designation} arrow>
                              <Typography noWrap sx={{ maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', margin: '0 auto', fontSize: '0.7rem' }}>{manpower.designation}</Typography>
                            </Tooltip>
                          </StyledTableCell>
                          <StyledTableCell>{manpower.requirement_type}</StyledTableCell>
                          <StyledTableCell style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{manpower.hiring_tat}</StyledTableCell>
                          <StyledTableCell>{manpower.created_at ? new Date(manpower.created_at).toLocaleDateString() : '-'}</StyledTableCell>
                          <StyledTableCell>{manpower?.recruiter_name ? manpower?.recruiter_name : '-'}</StyledTableCell>
                          <StyledTableCell>
                            <Box sx={{ display: "grid", gridTemplateColumns: "max-content 6px auto", rowGap: 0.6, columnGap: 0.5, alignItems: "center", }}>
                              <Box fontWeight={600} textAlign="left">Current Status</Box>
                              <Box fontWeight={600} textAlign="left">:</Box>
                              <Box textAlign="left">
                                <StatusBadge status={manpower.status} />
                              </Box>

                              <Box fontWeight={600} textAlign="left">Director Status</Box>
                              <Box fontWeight={600} textAlign="left">:</Box>
                              <Box textAlign="left">
                                <StatusBadge
                                  status={manpower.director_status !== "Pending" ? manpower.director_status : "-"}
                                />
                                {user.emp_id != "1722" && <Tooltip title="Director Query's"><IconButton onClick={() => handleChatboxClick(manpower.id, "Director_chatbox")} sx={{ color: '#3e5624', padding: "1%" }}><MessageIcon fontSize="small" /></IconButton></Tooltip>}
                              </Box>

                              <Box fontWeight={600} textAlign="left">HR Status</Box>
                              <Box fontWeight={600} textAlign="left">:</Box>
                              <Box textAlign="left">
                                <StatusBadge
                                  status={manpower.hr_status !== "Pending" ? manpower.hr_status : "-"}
                                />
                                {user.emp_id != "1400" && <Tooltip title="HR Query's"><IconButton onClick={() => handleChatboxClick(manpower.id, "HR_chatbox")} sx={{ color: '#3e5624', padding: "1%" }}><MessageIcon fontSize="small" /></IconButton></Tooltip>}
                              </Box>

                              {manpower.hr_status === "HR Approve" &&
                                manpower.mrf_hr_approve_date &&
                                manpower.mrf_hr_approve_date !== "NULL" &&
                                !isNaN(new Date(manpower.mrf_hr_approve_date).getTime()) && (
                                  <>
                                    <Box></Box>
                                    <Box></Box>
                                    <Box textAlign="left">
                                      {new Date(manpower.mrf_hr_approve_date).toLocaleDateString()}
                                    </Box>
                                  </>
                                )}
                            </Box>
                          </StyledTableCell>

                          <StyledTableCell>
                            <Tooltip title="View">
                              <IconButton onClick={() => handleViewClick(manpower.id)} sx={{ color: 'info.main', padding: "4px" }}>
                                <PreviewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {user.emp_id !== '12345' && ((isDirector && manpower.director_status !== "Approve") || (isHr && manpower.director_status === "Approve" && manpower.hr_status !== "HR Approve")) && (
                              <Tooltip title="Update Status">
                                <IconButton onClick={() => handleOpenStatusModal(manpower)} sx={{ color: 'secondary.main', padding: "4px" }}>
                                  <PublishedWithChangesIcon fontSize="small" style={{ color: '#316a31' }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {(isDirector && manpower.director_status !== "Approve") && (
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleEditClick(manpower.id)} sx={{ color: 'primary.main', padding: "4px" }}>
                                  <EditDocumentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(user.emp_id == "1722" && manpower.hr_status !== "HR Approve") && (
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleEditClick(manpower.id)} sx={{ color: 'primary.main', padding: "4px" }}>
                                  <EditDocumentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {isSeniorManager && user.emp_id !== "1722" && manpower.director_status !== "Approve" && manpower.hr_status !== "HR Approve" && manpower.status !== "Withdraw" && (
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleEditClick(manpower.id)} sx={{ color: 'primary.main', padding: "4px" }}>
                                  <EditDocumentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(user.emp_id == "12345") && (
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleEditClick(manpower.id)} sx={{ color: 'primary.main', padding: "4px" }}>
                                  <EditDocumentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {user.emp_id !== '12345' && ((isDirector && manpower.director_status !== "Approve" && manpower.director_status != "Reject") || (isHr && manpower.director_status === "Approve" && manpower.hr_status !== "HR Approve")) && (
                              <Tooltip title="Approve">
                                <IconButton onClick={() => handleApproveClick(manpower)} sx={{ color: 'success.main', padding: "4px" }}>
                                  <DoneAllIcon fontSize="small" style={{ color: '#07741b' }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {manpower.isWithdrawOpen === 1 && (user.emp_id !== "1722" && user.emp_id !== "1400") && manpower.status === 'Pending' && (
                              <Tooltip title="Withdraw">
                                <IconButton onClick={() => handleWithdrawClick(manpower.id)} sx={{ color: 'warning.main', padding: "4px" }}>
                                  <UndoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
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
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)'
                    },
                    gap: 3
                  }}>
                    {paginatedManpower.map((manpower, index) => (
                      <ManpowerCard
                        key={manpower.id}
                        manpower={manpower}
                        index={index}
                        onView={handleViewClick}
                        onEdit={handleEditClick}
                        onWithdraw={handleWithdrawClick}
                        onDelete={handleDeleteClick}
                        onMenuClick={handleMenuClick}
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
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `All ${filteredManpower.length}`} cases`}
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

      {/* Modals remain unchanged */}
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
          <Dialog open={isSuccessModalOpen} onClose={handleClose} maxWidth="xs" fullWidth>
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
        <Modal open={isRaiseQueryModalOpen} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" closeAfterTransition={false}  >
          <Box sx={modalStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <AssessmentIcon
                sx={{
                  color: '#1f7150ff',
                  fontSize: 24,
                  transition: 'color 0.3s ease, transform 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#1f7150ff',
                    transform: 'scale(1.2)',
                    filter: 'drop-shadow(0 0 5px #1f7150ff)',
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
          <Dialog open={isSuccessQueryModalOpen} onClose={handleClose} maxWidth="xs" fullWidth>
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

      {isStatusModalOpen && (
        <AnimatePresence>
          <Dialog
            open={isStatusModalOpen}
            onClose={handleCloseStatusModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              component: motion.div,
              variants: modalVariants,
              initial: "hidden",
              animate: "visible",
              exit: "exit",
            }}
          >
            <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PublishedWithChangesIcon color="primary" />
                <Typography variant="h6" component="div">Update Requisition Status</Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: '20px !important', pb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth variant="outlined" error={!!statusModalErrors.status}>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    label="Status"
                    name="status"
                    value={statusFormData.status}
                    onChange={handleStatusFormChange}
                  >
                    <MenuItem value="" disabled>Select the Status</MenuItem>
                    {isDirector && (
                      <>
                        <MenuItem key="Approve" value="Approve">Approve</MenuItem>
                        <MenuItem key="Reject" value="Reject">Reject</MenuItem>
                        <MenuItem key="Raise Query" value="Raise Query">Raise Query</MenuItem>
                        <MenuItem key="On Hold" value="On Hold">On Hold</MenuItem>
                      </>
                    )}
                    {isHr && (
                      <>
                        <MenuItem key="HR Approve" value="HR Approve">HR Approve</MenuItem>
                        <MenuItem key="Reject" value="Reject">Reject</MenuItem>
                        <MenuItem key="Raise Query" value="Raise Query">Raise Query</MenuItem>
                        <MenuItem key="On Hold" value="On Hold">On Hold</MenuItem>
                      </>
                    )}
                  </Select>
                  {statusModalErrors.status && (
                    <FormHelperText>{statusModalErrors.status}</FormHelperText>
                  )}
                </FormControl>
                {statusFormData.status === 'Raise Query' ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Query"
                    value={queryText}
                    onChange={(e) => {
                      setQueryText(e.target.value);
                      if (statusModalErrors.query) {
                        setStatusModalErrors(prev => ({ ...prev, query: '' }));
                      }
                    }}
                    variant="outlined"
                    error={!!statusModalErrors.query}
                    helperText={statusModalErrors.query}
                  />
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Comments"
                    name="comments"
                    value={statusFormData.comments}
                    onChange={handleStatusFormChange}
                    variant="outlined"
                    error={!!statusModalErrors.comments}
                    helperText={statusModalErrors.comments}
                  />
                )}
                {isHr && statusFormData.status === 'HR Approve' && (
                  <FormControl fullWidth variant="outlined" error={!!statusModalErrors.recruiter}>
                    <InputLabel id="recruiter-select-label">Assigned Recruiter</InputLabel>
                    <Select
                      labelId="recruiter-select-label"
                      label="Assigned Recruiter"
                      value={statusFormData.recruiter_name || ''}
                      onChange={(e) => {
                        const selected = recruiters.find(r => r.emp_name === e.target.value);
                        setStatusFormData(prev => ({
                          ...prev,
                          recruiter_name: selected?.emp_name || '',
                          recruiter_id: selected?.employee_id || ''
                        }));
                        if (statusModalErrors.recruiter) {
                          setStatusModalErrors(prev => ({ ...prev, recruiter: '' }));
                        }
                      }}
                    >
                      <MenuItem value="" disabled>-- Select Recruiter --</MenuItem>
                      {recruiters.map(r => (
                        <MenuItem key={r.employee_id} value={r.emp_name}>{r.emp_name}</MenuItem>
                      ))}
                    </Select>
                    {statusModalErrors.recruiter && (
                      <FormHelperText>{statusModalErrors.recruiter}</FormHelperText>
                    )}
                  </FormControl>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button onClick={handleCloseStatusModal} color="secondary">Cancel</Button>
              <Button onClick={handleStatusUpdate} variant="contained" color="primary">Update</Button>
            </DialogActions>
          </Dialog>
        </AnimatePresence>
      )}

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 9999 }}
        open={isStatusUpdating}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}

export default ManpowerRequisition;