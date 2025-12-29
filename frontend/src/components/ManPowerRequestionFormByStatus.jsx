import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Box, Typography, Button, tableCellClasses, TextField, Grid, TablePagination, IconButton, Tooltip, Chip, ToggleButtonGroup, ToggleButton, Card, CardContent, Avatar, CardActions, Dialog, DialogTitle, DialogContent, DialogActions,
    MenuItem,
    Menu,
    Divider
} from "@mui/material";
import { fetchManpowerRequisitionByStatus, withdrawManpowerRequisition } from '../redux/cases/manpowerrequisitionSlice';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import "react-quill-new/dist/quill.snow.css";
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence, color } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UndoIcon from '@mui/icons-material/Undo';


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
            // color: '#fff',
        },
        'HR Approve': {
            backgroundColor: '#20c997', // A slightly different, teal-like green
            // color: '#fff',
        },
        'Pending': {
            backgroundColor: '#ffc107', // A warm amber/yellow
            // color: '#212529', // Dark text for better contrast on yellow
        },
        'Reject': {
            backgroundColor: '#dc3545', // A strong red
            // color: '#fff',
        },
        'Raise Query': {
            backgroundColor: '#0dcaf0', // A bright cyan/info blue
            // color: '#fff',
        },
        'On Hold': {
            backgroundColor: '#6c757d', // A neutral, secondary grey
            // color: '#fff',
        },
        'Draft': {
            backgroundColor: '#f8f9fa', // A very light grey
            // color: '#6c757d',
            border: `1px solid #dee2e6`
        },
        default: {
            backgroundColor: theme.palette.grey[500],
            color: 'white',
        }
    };

    const style = statusStyles[displayStatus] || statusStyles[status] || statusStyles.default;

    const sx = { ...style, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'};
    return <Chip  label={displayStatus} size="small" sx={{...sx, '& .MuiChip-label': {
      color: 'white'
    }}} />
};


const ManpowerCard = ({ manpower, index, onEdit, onView, onWithdraw, onDelete, onMenuClick }) => {
    const theme = useTheme();
    const { user } = useSelector((state) => state.auth);
    const { managerList } = useSelector((state) => state.manpowerRequisition);

    const isHr = user?.emp_id === "12345" || user?.emp_id === "1722";
    const isDirector = user?.emp_id === "1400";
    const isSeniorManager = managerList.some(manager => manager.employee_id === user?.emp_id);

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
        default: { light: theme.palette.grey[400], main: theme.palette.grey[500] },
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

const ManpowerRequisitionByStatus = () => {
    const dispatch = useDispatch();
    const { param_status } = useParams(); // Returns { status: 'value-from-url' }
    const { user } = useSelector((state) => state.auth);
    const { managerList } = useSelector((state) => state.manpowerRequisition);
    // Map URL param values to display names
    const statusDisplayNames = {
        pending: 'Pending',
        approved: 'Approved',
        on_hold: 'On Hold',
        raise_query: 'Raise Query',
        rejected: 'Rejected',
    };
    const isHr = user?.emp_id === "12345" || user?.emp_id === "1722";
    const isDirector = user?.emp_id === "1400";
    const isSeniorManager = managerList.some(manager => manager.employee_id === user?.emp_id);

    // Get display name or fallback to the param if not found
    const displayStatus = statusDisplayNames[param_status] || param_status;
    const manpowerRequisitionList = useSelector((state) => state.manpowerRequisition.data);
    console.log(manpowerRequisitionList, "manpowerRequisitionList")
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();
    const [view, setView] = useState('table');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawId, setWithdrawId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentManpowerId, setCurrentManpowerId] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleMenuClick = (event, manpowerId) => {
        setAnchorEl(event.currentTarget);
        setCurrentManpowerId(manpowerId);
    };
    const handleMenuClose = () => setAnchorEl(null);

    useEffect(() => {
        if (param_status) {
            if (param_status === "Approved") {
                dispatch(fetchManpowerRequisitionByStatus({ status: "Approve", emp_id: user?.emp_id }));
            } else if (param_status === "Rejected") {
                dispatch(fetchManpowerRequisitionByStatus({ status: "Reject", emp_id: user?.emp_id }));
            } else {
                dispatch(fetchManpowerRequisitionByStatus({ status: param_status, emp_id: user?.emp_id }));
            }
        }
    }, [param_status, dispatch]);

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

    const handleViewClick = (id) => {
        navigate(`/manpower_requisition_view/${id}`);
    }
    const handleEditClick = (id) => {
        navigate(`/manpower_requisition_edit/${id}`);
    }

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

    const handleClose = () => setIsWithdrawModalOpen(false);
    const handleDeleteClick = () => { };

    return (
        <Box sx={{
            p: { xs: 2, sm: 3, md: 4 },
            minHeight: '100vh',
            background: `radial-gradient(circle at top left, #F3FAF8, #e9f5f2 100%)`,
        }}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 12 }}>
                    <Paper sx={{
                        p: { xs: 2, sm: 3 },
                        borderRadius: '16px',
                        marginTop: '12vh',
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography
                                variant="h6"

                            >
                                {displayStatus} Manpower Requisition List
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
                        {view === 'table' ? (<TableContainer
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
                                        {/* <StyledTableCell>No of Resources</StyledTableCell> */}
                                        <StyledTableCell>Requirement Type</StyledTableCell>
                                        {/* <StyledTableCell>Resigned Employee</StyledTableCell> */}
                                        {/* <StyledTableCell>Reason for Additional Resources</StyledTableCell> */}
                                        <StyledTableCell>TAT Request</StyledTableCell>
                                        {/* <StyledTableCell>Education</StyledTableCell>
                      <StyledTableCell>Experience</StyledTableCell> 
                      <StyledTableCell>CTC Range</StyledTableCell>
                      <StyledTableCell>Specific Info</StyledTableCell>
                      <StyledTableCell>MRF Number</StyledTableCell> */}
                                        {/* <StyledTableCell>Status</StyledTableCell> */}
                                        <StyledTableCell>Created Date</StyledTableCell>
                                        <StyledTableCell>Director Status</StyledTableCell>
                                        <StyledTableCell>HR Status</StyledTableCell>
                                        
                                        <StyledTableCell>
                                            Action
                                        </StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedManpower.length > 0 ? (
                                        paginatedManpower.map((manpower, index) => (
                                            <StyledTableRow key={manpower.id}>
                                                <StyledTableCell component="th" scope="row">
                                                    {page * rowsPerPage + index + 1}
                                                </StyledTableCell>
                                                <StyledTableCell>{manpower.created_by === 0 ? "-" : `${manpower.emp_name}`}</StyledTableCell>
                                                <StyledTableCell>{manpower.department_name}</StyledTableCell>
                                                <StyledTableCell>{manpower.employment_status}</StyledTableCell>
                                                <StyledTableCell>{manpower.designation}</StyledTableCell>
                                                {/* <StyledTableCell>{manpower.num_resources}</StyledTableCell> */}
                                                <StyledTableCell>{manpower.requirement_type}</StyledTableCell>
                                                {/* <StyledTableCell>{manpower.replacement_detail}</StyledTableCell>
                        <StyledTableCell>{manpower.ramp_up_reason}</StyledTableCell> */}
                                                <StyledTableCell style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{manpower.hiring_tat}</StyledTableCell>
                                                {/* <StyledTableCell>{manpower.education}</StyledTableCell>
                        <StyledTableCell>{manpower.experience}</StyledTableCell> 
                        <StyledTableCell>{manpower.ctc_range}</StyledTableCell>
                        <StyledTableCell>{manpower.specific_info}</StyledTableCell>
                        <StyledTableCell>{manpower.mrf_number}</StyledTableCell> */}
                                                {/* <StyledTableCell><StatusBadge status={manpower.status} /></StyledTableCell> */}
                                                <StyledTableCell>{new Date(manpower.created_at).toLocaleDateString()}</StyledTableCell>
                                                <StyledTableCell><StatusBadge status={manpower.director_status !== "Pending" ? manpower.director_status : "-"} /></StyledTableCell>
                                                <StyledTableCell><StatusBadge status={manpower.hr_status !== "Pending" ? manpower.hr_status : "-"} /></StyledTableCell>

                                                {/* <StyledTableCell>
                                                <Tooltip title="Edit Manpower" arrow placement="top">
                                                    <IconButton
                                                        aria-label="edit"
                                                        sx={{ mr: 0.5 }}
                                                        color="primary"
                                                        onClick={() => handleEditClick(manpower.id)}
                                                    >
                                                        <EditDocumentIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View Manpower" arrow placement="top">
                                                    <IconButton
                                                        sx={{ mr: 0.5 }}
                                                        aria-label="view"
                                                        color="info"
                                                        onClick={() => handleViewClick(manpower.id)}
                                                    >
                                                        <PreviewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </StyledTableCell> */}
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
                                                        {/* {!((isHr && manpower.director_status === "Approve") ||
                                                        (isDirector && manpower.hr_status === "HR Approve") ||
                                                        (isSeniorManager && (manpower.director_status === "Approve" || manpower.hr_status === "HR Approve"))) && (
                                                            <MenuItem onClick={() => { handleEditClick(manpower.id); handleMenuClose(); }}><EditDocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />Edit</MenuItem>
                                                        )} */}


                                                        {(isDirector && manpower.director_status !== "Approve")
                                                            && <MenuItem onClick={() => { handleEditClick(manpower.id); handleMenuClose(); }}><EditDocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />Edit</MenuItem>
                                                        }
                                                        {(user.emp_id == "1722" && manpower.hr_status !== "HR Approve")
                                                            && <MenuItem onClick={() => { handleEditClick(manpower.id); handleMenuClose(); }}><EditDocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />Edit</MenuItem>
                                                        }
                                                        {isSeniorManager && user.emp_id !== "1722" && manpower.director_status !== "Approve" && manpower.hr_status !== "HR Approve" && manpower.status !== "Withdraw"
                                                            && <MenuItem onClick={() => { handleEditClick(manpower.id); handleMenuClose(); }}><EditDocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />Edit</MenuItem>
                                                        }
                                                        {manpower.isWithdrawOpen === 1 && (user.emp_id !== "1722" && user.emp_id !== "1400") && manpower.status == 'Pending' && (
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
                        </TableContainer>) : (
                            <Box sx={{
                                pt: 2,
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)', // 2 cards on small screens
                                    md: 'repeat(3, 1fr)'  // 3 cards on medium and larger screens
                                },
                                gap: 3
                            }}> 
                                {paginatedManpower.length > 0 ? (
                                    paginatedManpower.map((manpower, index) => (
                                        <ManpowerCard
                                            key={manpower.id}
                                            manpower={manpower}
                                            index={index}
                                            onView={handleViewClick}
                                            onEdit={handleEditClick}
                                            onMenuClick={handleMenuClick}
                                            onWithdraw={handleWithdrawClick}
                                            onDelete={handleDeleteClick}
                                        />
                                    ))
                                ) : (
                                    <Typography sx={{ textAlign: 'center', p: 4, gridColumn: '1 / -1' }}>No data available.</Typography>
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
        </Box>
    );

};

export default ManpowerRequisitionByStatus;
