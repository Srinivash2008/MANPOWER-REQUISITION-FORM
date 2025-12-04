import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography, Button, tableCellClasses, TextField, Grid, TablePagination, IconButton, Tooltip, Chip
} from "@mui/material";
import { fetchManpowerRequisition, fetchManpowerRequisitionByuserId, fetchManpowerRequisitionFH } from '../redux/cases/manpowerrequisitionSlice';
import VisibilityIcon from "@mui/icons-material/Visibility";
import "react-quill-new/dist/quill.snow.css";
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

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

const ManpowerRequisitionReport = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const manpowerRequisitionList = useSelector((state) => state.manpowerRequisition.data);
  const manpowerRequisitionFHList = useSelector((state) => state.manpowerRequisition.selectedRequisitionFH);
  const status = useSelector((state) => state.manpowerRequisition.status);
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const [statusfilter, setStatusFilter] = useState("");
  const [startdatefilter, setStartDateFilter] = useState("");
  const [enddatefilter, setEndDateFilter] = useState("");
  const [functionalheadfilter, setFunctionalHeadFilter] = useState("");

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
    // dispatch(fetchManpowerRequisition());
    dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
  }, [dispatch]);


  useEffect(() => {
    dispatch(fetchManpowerRequisitionFH());
  }, [dispatch]);



  const manpowerArray = Array.isArray(manpowerRequisitionList) ? manpowerRequisitionList : [];

  const filteredManpower = manpowerArray.filter(manpower => {
    // Use String() to ensure type consistency for comparison
    const matchesFunctionalHead = functionalheadfilter === "" ||
      (manpower?.created_by !== undefined && manpower?.created_by !== null &&
        String(manpower.created_by) === String(functionalheadfilter));

    const matchesStatus = statusfilter === "" || manpower?.status === statusfilter;

    const matchesStartDate = !startdatefilter ||
      (manpower?.created_at && manpower.created_at.split('T')[0] >= startdatefilter);

    const matchesEndDate = !enddatefilter ||
      (manpower?.created_at && manpower.created_at.split('T')[0] <= enddatefilter);
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearchTerm = manpower?.employment_status?.toLowerCase().includes(lowerSearchTerm) ||
      manpower?.designation?.toLowerCase().includes(lowerSearchTerm);

    return matchesFunctionalHead && matchesStatus && matchesStartDate && matchesEndDate && matchesSearchTerm;
  });

  const paginatedManpower =
    rowsPerPage === -1
      ? filteredManpower
      : filteredManpower.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  console.log(paginatedManpower, "paginatedManpower")

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          disabled={count === 0}
        >
          {isAllSelected ? "Hide All" : "Show All"}
        </Button>
      </Box>
    );
  };


  const handleViewClick = (id) => {
    navigate(`/manpower_requisition_view/${id}`);
  }

  const statuses = ["Pending", "Approve", "Reject", "Raise Query", "On Hold", "HR Approve"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "statusfilter") {
      setStatusFilter(value);
    } else if (name === "startdatefilter") {
      setStartDateFilter(value);
    } else if (name === "enddatefilter") {
      setEndDateFilter(value);
    } else if (name === "functionalheadfilter") {
      setFunctionalHeadFilter(value);
    }
  };

  // const handleExport = () => {
  //     if (!filteredManpower || filteredManpower.length === 0) {
  //         swal.fire({
  //         title: 'No Data',
  //         text: 'No manpower requisition data available to export.',
  //         icon: 'warning',
  //         confirmButtonColor: theme.palette.error.main,
  //         confirmButtonText: 'OK'
  //         });
  //         return;
  //     }

  //     const dataToExport = filteredManpower.map((manpower, index) => ({
  //         "S.No": index + 1,
  //         "Employee Name": manpower?.emp_name,
  //         "Employee Id": manpower?.created_by,
  //         "Department": manpower?.department_name,
  //         "Employment Status": manpower?.employment_status,
  //         "Proposed Designation": manpower?.designation,
  //         "No. of Resources": manpower?.num_resources,
  //         "Requirement Type": manpower?.requirement_type,
  //         "Project Name": manpower?.project_name,
  //         "Projection Plan": manpower?.projection_plan,
  //         "Replacement Detail": manpower?.replacement_detail,
  //         "Job Description": manpower?.job_description,
  //         "Education": manpower?.education,
  //         "Experience": manpower?.experience,
  //         "CTC Range": manpower?.ctc_range,
  //         "Specific Info": manpower?.specific_info,
  //         "Hiring TAT Fastag": manpower?.hiring_tat_fastag,
  //         "Hiring TAT Normal Cat1": manpower?.hiring_tat_normal_cat1,
  //         "Hiring TAT Normal Cat2": manpower?.hiring_tat_normal_cat2,
  //         "MRF Number": manpower?.mrf_number,
  //         "Status": manpower?.status,
  //         "Created At": manpower?.created_at ? manpower.created_at.split('T')[0] : '',
  //     }));

  //     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, "Manpower Requisition List");

  //     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  //     const data = new Blob([excelBuffer], { type: "application/octet-stream" });

  //     const fileName = `Manpower_Requisition_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  //     saveAs(data, fileName);

  //     swal.fire({
  //         title: 'Export Successful!',
  //         text: 'Manpower requisition data has been exported to Excel.',
  //         icon: '',
  //         iconHtml: `<img src="/validation/success.gif" alt="Success" style="width: 100px; height: 100px;">`,
  //         confirmButtonColor: theme.palette.success.main,
  //         confirmButtonText: 'OK'
  //     });
  // };

  const handleExport = () => {
    if (!filteredManpower || filteredManpower.length === 0) {
      swal.fire({
        title: 'No Data',
        text: 'No manpower requisition data available to export.',
        icon: 'warning',
        confirmButtonColor: theme.palette.error.main,
        confirmButtonText: 'OK'
      });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Manpower Requisition List");

    // Title in G1
    sheet.getCell("H1").value = "Manpower Requisition";
    sheet.getCell("H1").font = { bold: true, size: 14 };
    sheet.getCell("H1").alignment = { horizontal: "center" };

    const headerRow = sheet.addRow([
      "S.No", "Employee Name", "Employee Id", "Department",
      "Employment Status", "Proposed Designation", "No. of Resources",
      "Requirement Type", "Project Name", "Projection Plan", "Replacement Detail",
      "Job Description", "Education", "Experience", "CTC Range",
      "Specific Info", "Hiring TAT Fastag", "Hiring TAT Normal Cat1",
      "Hiring TAT Normal Cat2", "MRF Number", "Status", "HR Status", "HR Comments", "Director Status", "Director Comments", "Created At"
    ]);

    // Make header row bold
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' }; // optional: center text
    });


    filteredManpower.forEach((m, i) => {
      sheet.addRow([
        i + 1,
        m.emp_name,
        m.created_by,
        m.department_name,
        m.employment_status,
        m.designation,
        m.num_resources,
        m.requirement_type,
        m.project_name,
        m.projection_plan,
        m.replacement_detail,
        m.job_description,
        m.education,
        m.experience,
        m.ctc_range,
        m.specific_info,
        m.hiring_tat_fastag,
        m.hiring_tat_normal_cat1,
        m.hiring_tat_normal_cat2,
        m.mrf_number,
        m.status,
        m.hr_status,
        m.hr_comments,
        m.director_status,
        m.director_comments,
        m.created_at?.split("T")[0] ?? ""
      ]);
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      saveAs(new Blob([buffer]), `Manpower_Requisition_${Date.now()}.xlsx`);
    });

    swal.fire({
      title: 'Export Successful!',
      text: 'Manpower requisition data has been exported.',
      iconHtml: `<img src="/validation/success.gif" style="width:100px;height:100px;">`,
      confirmButtonColor: theme.palette.success.main
    });
  };



  return (
    <Box sx={{ p: 4, backgroundColor: '#f0f2f5' }} mt={10}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 12 }}>
          <Paper sx={{ p: 2, borderRadius: '8px' }} >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h5' sx={{
                fontWeight: 'bold',
                mb: 2,
              }}>
                Manpower Requisition Report
              </Typography>
            </Box>

            <div className="form-grid">
              <div className="form-section">
                <div className="section-grid multi-cols" >
                  <div className="form-field-item">
                    <label className="form-label">Functional Head</label>
                    <select
                      style={{ width: "60%" }}
                      name="functionalheadfilter"
                      value={functionalheadfilter}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Functional Head</option>
                      {manpowerRequisitionFHList?.map((fh) => (
                        <option key={fh.employee_id} value={fh.employee_id}>
                          {fh.ReportingManager}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field-item">
                    <label className="form-label" style={{ marginLeft: "-40%" }}>Status</label>
                    <select
                      style={{ width: "60%", marginLeft: "-40%" }}
                      name="statusfilter"
                      value={statusfilter}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Status</option>
                      {statuses?.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field-item">
                    <label className="form-label" style={{ marginLeft: "-80%" }}>Start Date</label>
                    <input
                      style={{ width: "60%", marginLeft: "-80%" }}
                      className="form-input"
                      type="date"
                      name="startdatefilter"
                      value={startdatefilter}
                      onChange={handleChange}
                      max={enddatefilter}
                    />
                  </div>

                  <div className="form-field-item">
                    <label className="form-label" style={{ marginLeft: "-120%" }}>End Date</label>
                    <input
                      style={{ width: "60%", marginLeft: "-120%" }}
                      className="form-input"
                      type="date"
                      name="enddatefilter"
                      value={enddatefilter}
                      onChange={handleChange}
                      min={startdatefilter}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 12 }}>
          <Paper sx={{ p: 2, borderRadius: '8px', marginTop: '8vh' }}>
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
              <Button
                variant="contained"
                color="success"
                onClick={handleExport}
                sx={{ width: '150px', color: 'white' }}
                style={{ marginRight: '15px', fontWeight: 'bold', fontSize: '16px', padding: '7px' }}
              >
                Export to Excel
              </Button>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => { //NOSONAR
                  setSearchTerm(e.target.value);
                  setPage(0);
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
             
                    <StyledTableCell>Director Status</StyledTableCell>
                           <StyledTableCell>HR Status</StyledTableCell>
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
                        
                      <StyledTableCell><StatusBadge status={manpower.director_status == "Pending" ? "-" : manpower.director_status} /></StyledTableCell>
                      <StyledTableCell><StatusBadge status={manpower.hr_status == "Pending" ? "-" : manpower.hr_status} /></StyledTableCell>
                      <StyledTableCell>
                        <Tooltip title="View Manpower" arrow placement="top">
                          <IconButton
                            aria-label="view"
                            color="info"
                            sx={{ mr: 1, width: "30px" }}
                            onClick={() => handleViewClick(manpower.id)}
                          >
                            <VisibilityIcon />
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
              labelDisplayedRows={({ from, to, count }) => count === 0 ? '0-0 of 0' : `${from}-${to} of ${count !== -1 ? count : `All ${filteredManpower.length}`}`}
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

export default ManpowerRequisitionReport;