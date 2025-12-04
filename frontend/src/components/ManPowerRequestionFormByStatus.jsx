import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Box, Typography, Button, tableCellClasses, TextField, Grid, TablePagination, IconButton, Tooltip, Chip
} from "@mui/material";
import { fetchManpowerRequisitionByStatus } from '../redux/cases/manpowerrequisitionSlice';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import "react-quill-new/dist/quill.snow.css";
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

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
      default: {
        backgroundColor: theme.palette.grey[500],
        color: 'white',
      }
    };
  
    const style = statusStyles[status] || statusStyles.default;
  
    const sx = { ...style, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
  
    return <Chip label={status} size="small" sx={sx} />;
  };

const ManpowerRequisitionByStatus = () => {
    const dispatch = useDispatch();
    const { param_status } = useParams(); // Returns { status: 'value-from-url' }
    const { user } = useSelector((state) => state.auth);
    // Map URL param values to display names
    const statusDisplayNames = {
        pending: 'Pending',
        approved: 'Approved',
        on_hold: 'On Hold',
        raise_query: 'Raise Query',
        rejected: 'Rejected',
    };

    // Get display name or fallback to the param if not found
    const displayStatus = statusDisplayNames[param_status] || param_status;
    const manpowerRequisitionList = useSelector((state) => state.manpowerRequisition.data);
    console.log(manpowerRequisitionList, "manpowerRequisitionList")
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();

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
                        borderRadius: '16px', // Softer corners
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
                            <TextField
                                label="Search"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => { //NOSONAR
                                    setSearchTerm(e.target.value);
                                    setPage(0); // Reset to first page when searching
                                }}
                                sx={{ mr: 2, maxWidth: '250px' }}
                            />
                        </Box>
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
                                        <StyledTableCell>Status</StyledTableCell>
                                        <StyledTableCell>
                                            Action
                                        </StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedManpower.map((manpower, index) => (
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
                                            <StyledTableCell><StatusBadge status={manpower.status} /></StyledTableCell>
                                            <StyledTableCell>
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
                                                {/* The delete functionality was commented out in the original file, preserving that. */}
                                                {/* <Tooltip title="Delete Manpower" arrow placement="top">
                                                    <IconButton
                                                        aria-label="delete"
                                                        sx={{ mr: 0.5 }}
                                                        color="error"
                                                    // onClick={() => handleDeleteClick(manpower.id)}
                                                    >
                                                        <DeleteForeverIcon />
                                                    </IconButton>
                                                </Tooltip> */}
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
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
        </Box>
    );

}

export default ManpowerRequisitionByStatus;
