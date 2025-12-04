import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography, CircularProgress, Alert, Select, MenuItem, FormControl, Button, tableCellClasses, TextField, Grid, TablePagination, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip   } from "@mui/material";
import Modal from "@mui/material/Modal";
import { fetchManpowerRequisition, fetchManpowerRequisitionById, addQueryForm, updateManpowerStatus, deleteManpowerRequisition, optimisticUpdateManpowerStatus, revertManpowerStatus, fetchManpowerRequisitionByuserId } from '../redux/cases/manpowerrequisitionSlice';  
import swal from "sweetalert2"; 
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PreviewIcon from '@mui/icons-material/Preview';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import BackspaceIcon from '@mui/icons-material/Backspace';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import "react-quill-new/dist/quill.snow.css";
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
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

const ManpowerRequisition = () => {
  const dispatch  = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const manpowerRequisitionList = useSelector((state)=> state.manpowerRequisition.data); 
  console.log(manpowerRequisitionList,"manpowerRequisitionList")
  const status = useSelector((state) => state.manpowerRequisition.status);
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const selectedRequisition = useSelector((state) => state.manpowerRequisition.selectedRequisition);
  const navigate = useNavigate();

  useEffect(() => {
      if(status === 'idle' && user){
        //  dispatch(fetchManpowerRequisition());
         dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const socket = io(API_URL);
      socket.on('manpowerrequisition-refresh', () => {
          // dispatch(fetchManpowerRequisition());
             dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
          
      });
  },[status, user, dispatch]);

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
        is_delete:'Inactive',
    };
    
    dispatch(deleteManpowerRequisition(deletemanpowerdata));
    setIsDeleteModalOpen(false);
    setIsSuccessModalOpen(true); // Show success modal after deletion.
    setDeleteId(null);
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
            <Paper sx={{ p: 2, borderRadius: '8px',marginTop: '12vh' }}>
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
                        <StyledTableCell>{manpower.created_by === 0 ? "-"  : `${manpower.emp_name}`}</StyledTableCell>
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
                         <StyledTableCell style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{manpower.status}</StyledTableCell>
                        
                        {/* <StyledTableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={manpower.status || "Pending"}
                              onChange={(e) => handleStatusChange(e, manpower.id)}
                              displayEmpty
                              size="small"
                              sx={{ fontSize: "0.85rem", height: 36, borderRadius: '6px' }}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 200,
                                    width: 200,
                                    zIndex: 20000,
                                  },
                                },
                              }}
                            >
                              <MenuItem value="Draft" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                Draft
                              </MenuItem>
                              <MenuItem value="Pending" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                Pending
                              </MenuItem>
                              <MenuItem value="Approve" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                Approve
                              </MenuItem>
                              <MenuItem value="Reject" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                Reject
                              </MenuItem>
                              <MenuItem value="Raise Query" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                Raise Query
                              </MenuItem>
                              <MenuItem value="On Hold" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                On Hold
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </StyledTableCell> */}
                        <StyledTableCell>
                          {(
                            <>
                            <Tooltip title="Edit Manpower" arrow placement="top">
                            <IconButton
                              aria-label="edit"
                              color="primary"
                              sx={{ mr: 1, width: "30px" }}
                               onClick={() => handleEditClick(manpower.id)}
                            >
                              <EditDocumentIcon />
                            </IconButton>
                          </Tooltip>
                         {user.emp_id != "1722" || user.emp_id != "1400" && 
                          <Tooltip title="Delete Manpower" arrow placement="top">
                            <IconButton 
                              aria-label="delete"
                              color="error"
                              onClick={() => handleDeleteClick(manpower.id)}
                              sx={{ mr: 1, width: "30px" }}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        
                         }
                          </>
                          )}
                          <Tooltip title="View Manpower" arrow placement="top">
                            <IconButton
                              aria-label="view"
                              color="info"
                              sx={{ mr: 1, width: "30px" }}
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
