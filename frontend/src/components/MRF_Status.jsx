import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, tableCellClasses, styled, IconButton, Modal, Fade, TablePagination,
    List, ListItem, ListItemText, Chip, Avatar, FormControl, InputLabel, Select, MenuItem, Tooltip,
    Button
} from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMrfTrackingList } from '../redux/cases/manpowerrequisitionSlice';
import { useNavigate } from 'react-router-dom';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

// Head cells: nowrap. Body cells: allow wrap, small font, tight padding.
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#2A7F66',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        fontSize: 11,
        padding: '8px 6px',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: 1.2,
        textAlign: 'center',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 12,
        padding: '8px',
        whiteSpace: 'normal',      // allow wrapping
        wordBreak: 'break-word',
    },
}));

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 450 },
    bgcolor: '#f9f9f9',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    borderRadius: '12px',
    p: 0,
    display: 'flex',
    flexDirection: 'column'
};

const MRF_Status = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { data: manpowerRequisitionList, loading } = useSelector((state) => state.manpowerRequisition);

    const [trackingData, setTrackingData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        dispatch(fetchMrfTrackingList(user?.emp_id));
    }, [dispatch, user?.emp_id]);

    useEffect(() => {
        if (manpowerRequisitionList) {
            setTrackingData(manpowerRequisitionList.map(item => ({
                ...item,
                mrf_closed_date: item.mrf_closed_date ? item.mrf_closed_date.split('T')[0] : '',
                offer_date: item.offer_date ? item.offer_date.split('T')[0] : '',
                candidate_names: item.candidate_names ? item.candidate_names.split(', ') : [],
                candidates_count: item.candidates_count || 0,
                offer_dates: item.offer_dates ? item.offer_dates.split(', ') : [],
                joined_date: item.joined_date || '',
                tat_days: item.tat_days != null ? item.tat_days : null,
                MRF_date_limit: item.MRF_date_limit || null,
                isEditing: false,
            })));
        }
    }, [manpowerRequisitionList]);

    const handleFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(0);
    };

    const getBadgeStyles = (status) => {
        switch (status) {
            case 'Offered':
                return { bgcolor: '#1565c0', color: '#fff !important' };
            case 'Joined':
                return { bgcolor: '#2e7d32', color: '#fff !important' };
            case 'In Process':
                return { bgcolor: '#ed6c02', color: '#fff !important' };
            default:
                return { bgcolor: '#eeeeee', color: '#000' };
        }
    };

    const filteredData = trackingData.filter(item => {
        if (statusFilter === 'All') return true;
        return item.mrf_track_status === statusFilter;
    });

    const paginatedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleExport = () => {
        if (filteredData.length === 0) {
            swal.fire({
                title: 'No Data',
                text: 'There is no data to export.',
                icon: 'warning',
                confirmButtonColor: '#2A7F66',
            });
            return;
        }

        const exportData = filteredData.map((item, index) => ({
            'S.No': index + 1,
            'MRF Number': item.mrf_number || '-',
            'Hiring Manager': item.emp_name || '-',
            'Position': item.designation || '-',
            'Replacement Detail': item.requirement_type === 'Replacement' ? item.replacement_detail || '-' : '-',
            'MRF Start Date': item.mrf_hr_approve_date ? new Date(item.mrf_hr_approve_date).toLocaleDateString('en-GB') : '-',
            'MRF Closed Date': item.mrf_closed_date ? new Date(item.mrf_closed_date).toLocaleDateString('en-GB') : '-',
            'Candidates': `${item.candidates_count} / ${item.num_resources}`,
            'TAT (Days)': item.tat_days != null ? `${item.tat_days} Days` : '-',
            'TAT Limit': item.MRF_date_limit || '-',
            'Status': item.mrf_track_status || '-',
            'Candidate Names': item.candidate_names ? item.candidate_names.join(', ') : '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MRF Tracking');
        XLSX.writeFile(workbook, `MRF_Tracking_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
    };

    const handleOpenModal = (item) => {
        const candidates = item.candidate_names.map((name, index) => ({
            name: name,
            offer_date: item.offer_dates[index] ? new Date(item.offer_dates[index]).toLocaleDateString('en-GB') : 'N/A',
        }));
        setSelectedCandidates(candidates);
        setIsModalOpen(true);
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', mt: 10 }}>

                {/* Header Row */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2A7F66' }}>
                        MRF Tracking Status
                    </Typography>

                    {/* Export + Filter grouped on right */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'center', sm: 'flex-end' }
                    }}>
                        <Button
                            variant="contained"
                            onClick={handleExport}
                            sx={{
                                backgroundColor: '#2A7F66',
                                '&:hover': { backgroundColor: '#1D5947' },
                                textTransform: 'none',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                fontSize: 13,
                            }}
                        >
                            Export to Excel
                        </Button>

                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="In Process">In Process</MenuItem>
                                <MenuItem value="Offered">Offered</MenuItem>
                                <MenuItem value="Joined">Joined</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {/* Table — no overflowX so no horizontal scroll */}
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center">S.No</StyledTableCell>
                                <StyledTableCell align="center">MRF Number</StyledTableCell>
                                <StyledTableCell align="center">Hiring Manager</StyledTableCell>
                                <StyledTableCell align="center">Position</StyledTableCell>
                                <StyledTableCell align="center">Replacement</StyledTableCell>
                                <StyledTableCell align="center">MRF Start Date</StyledTableCell>
                                <StyledTableCell align="center">MRF Closed Date</StyledTableCell>
                                <StyledTableCell align="center">Candidates</StyledTableCell>
                                <StyledTableCell align="center">TAT</StyledTableCell>
                                <StyledTableCell align="center">Status</StyledTableCell>
                                <StyledTableCell align="center">Candidate Names</StyledTableCell>
                                <StyledTableCell align="center">Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={12} align="center">Loading...</TableCell>
                                </TableRow>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => {
                                    const limitDays = item.MRF_date_limit ? parseInt(item.MRF_date_limit) : null;
                                    const isOverdue = limitDays && item.tat_days > limitDays;

                                    return (
                                        <StyledTableRow
                                            key={item.id}
                                            sx={isOverdue ? { backgroundColor: '#ffebee !important' } : {}}
                                        >
                                            {/* S.No */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, whiteSpace: 'nowrap', width: '60px' }}>
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>

                                            {/* MRF Number */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, whiteSpace: 'nowrap', width: '80px' }}>
                                                {item.mrf_number || '-'}
                                            </TableCell>

                                            {/* Hiring Manager — wraps */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, minWidth: 80, width: '100px' }}>
                                                {item.emp_name || '-'}
                                            </TableCell>

                                            {/* Position — wraps */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, minWidth: 80, width: '90px' }}>
                                                {item.designation || '-'}
                                            </TableCell>

                                            {/* Replacement — wraps */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, minWidth: 80, width: '90px' }}>
                                               {item.requirement_type === 'Replacement' && item.replacement_detail ? (
                                                <Tooltip title={item.replacement_detail} arrow placement="top">
                                                    <span style={{
                                                        display: 'inline-block',
                                                        maxWidth: '130px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        verticalAlign: 'middle',
                                                        cursor: 'pointer'
                                                    }}>
                                                        {item.replacement_detail}
                                                    </span>
                                                </Tooltip>
                                            ) : '-'}
                                            </TableCell>

                                            {/* MRF Start Date — nowrap */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, whiteSpace: 'nowrap', width: '85px' }}>
                                                {item.mrf_hr_approve_date ? new Date(item.mrf_hr_approve_date).toLocaleDateString('en-GB') : '-'}
                                            </TableCell>

                                            {/* MRF Closed Date — nowrap */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, whiteSpace: 'nowrap', width: '85px' }}>
                                                {item.mrf_closed_date ? new Date(item.mrf_closed_date).toLocaleDateString('en-GB') : '-'}
                                            </TableCell>

                                            {/* Candidates chip — nowrap */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, whiteSpace: 'nowrap',width: '100px' }}>
                                                <Chip
                                                    variant="outlined"
                                                    color="primary"
                                                    label={`${item.candidates_count} / ${item.num_resources}`}
                                                    onClick={() => handleOpenModal(item)}
                                                    disabled={item.candidates_count === 0}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        fontSize: 11,
                                                        cursor: item.candidates_count > 0 ? 'pointer' : 'default'
                                                    }}
                                                />
                                            </TableCell>

                                            {/* TAT chip — nowrap */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, whiteSpace: 'nowrap',width: '65px' }}>
                                                {item.tat_days != null ? (
                                                    <Tooltip
                                                        title={
                                                            limitDays
                                                                ? isOverdue
                                                                    ? `Limit Exceeded by ${item.tat_days - limitDays} Days (Total Limit: ${limitDays} Days)`
                                                                    : `${limitDays - item.tat_days} Days Remaining (Total Limit: ${limitDays} Days)`
                                                                : ''
                                                        }
                                                        arrow
                                                    >
                                                        <Chip
                                                            label={`${item.tat_days} Days`}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                fontSize: 11,
                                                                bgcolor: isOverdue ? '#d32f2f' : '#e0f2f1',
                                                                color: isOverdue ? '#fff' : '#2A7F66',
                                                                '& .MuiChip-label': {
                                                                    color: isOverdue ? '#fff' : '#2A7F66',
                                                                },
                                                                borderRadius: '6px',
                                                                minWidth: '70px',
                                                                cursor: 'pointer',
                                                            }}
                                                        />
                                                    </Tooltip>
                                                ) : '-'}
                                            </TableCell>

                                            {/* Status chip — nowrap */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, whiteSpace: 'nowrap', width: '60px' }}>
                                                <Chip
                                                    label={item.mrf_track_status || '-'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        fontSize: 11,
                                                        minWidth: '80px',
                                                        borderRadius: '6px',
                                                        ...getBadgeStyles(item.mrf_track_status),
                                                        '& .MuiChip-label': {
                                                            color: 'white !important',
                                                        }
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Candidate Names — wraps, show first + N more on hover */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, minWidth: 100 }}>
                                                {item.candidate_names && item.candidate_names.length > 0 ? (
                                                    <Tooltip title={item.candidate_names.join(', ')} arrow placement="top">
                                                        <span style={{ cursor: 'pointer' }}>
                                                            {item.candidate_names.length === 1
                                                                ? item.candidate_names[0]
                                                                : `${item.candidate_names[0]} +${item.candidate_names.length - 1} more`}
                                                        </span>
                                                    </Tooltip>
                                                ) : '-'}
                                            </TableCell>

                                            {/* Action */}
                                            <TableCell align="center" sx={{ fontSize: 12, px: 1, whiteSpace: 'nowrap' }}>

                                                <IconButton
                                                    onClick={() => navigate(`/mrf_status_edit/${item.id}`)}
                                                    size="small"
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <EditDocumentIcon fontSize="small" />
                                                </IconButton>

                                            </TableCell>
                                        </StyledTableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={12} align="center">No data found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />

                {/* Candidate Modal */}
                <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <Fade in={isModalOpen}>
                        <Box sx={modalStyle}>
                            <Box sx={{
                                p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: 'linear-gradient(135deg, #2A7F66 0%, #1D5947 100%)', color: 'white',
                                borderTopLeftRadius: '12px', borderTopRightRadius: '12px',
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white'}}>Candidate Details</Typography>
                                <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: 'white' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
                                <List disablePadding>
                                    {selectedCandidates.map((candidate, idx) => (
                                        <ListItem key={idx} sx={{ p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                                <PersonIcon />
                                            </Avatar>
                                            <ListItemText
                                                primary={candidate.name}
                                                secondary={`Offer Date: ${candidate.offer_date}`}
                                                primaryTypographyProps={{ fontWeight: '600' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Box>
                    </Fade>
                </Modal>

            </Paper>
        </Box>
    );
};

export default MRF_Status;