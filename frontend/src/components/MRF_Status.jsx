import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, tableCellClasses, styled, IconButton, Modal, Fade, TablePagination,
    List, ListItem, ListItemText, Chip, Avatar, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMrfTrackingList } from '../redux/cases/manpowerrequisitionSlice';
import { useNavigate } from 'react-router-dom';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

// Simplified row styling - removed row-level green background logic
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#2A7F66',
        color: theme.palette.common.white,
        fontWeight: 'bold',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
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
                isEditing: false,
            })));
        }
    }, [manpowerRequisitionList]);

    const handleFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(0);
    };

    // Logic for Badge styling based on status
    const getBadgeStyles = (status) => {
        switch (status) {
            case 'In Process':
                return {
                    bgcolor: '#ed6c02', // Orange (Warning color)
                    color: '#fff !important' // White text
                };
            case 'Offered':
                return { bgcolor: '#1565c0', color: '#fff !important' }; // Blue
            case 'Joined':
                return { bgcolor: '#2e7d32', color: '#fff !important' }; // Green
            default:
                return {
                    bgcolor: '#eeeeee',
                    color: '#000'
                };
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

    const handleOpenModal = (item) => {
        const candidates = item.candidate_names.map((name, index) => ({
            name: name,
            offer_date: item.offer_dates[index] ? new Date(item.offer_dates[index]).toLocaleDateString('en-GB') : 'N/A',
        }));
        setSelectedCandidates(candidates);
        setIsModalOpen(true);
    };

    return (
        <Box sx={{ p: 4, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Paper sx={{ p: 3, borderRadius: '12px', mt: 10 }}>
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

                    <FormControl size="small" sx={{ minWidth: 200 }}>
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

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>S.No</StyledTableCell>
                                <StyledTableCell>MRF Number</StyledTableCell>
                                <StyledTableCell>Hiring Manager</StyledTableCell>
                                <StyledTableCell>Position</StyledTableCell>
                                <StyledTableCell>MRF Start Date</StyledTableCell>
                                <StyledTableCell>MRF Closed Date</StyledTableCell>
                                <StyledTableCell>Candidates</StyledTableCell>
                                <StyledTableCell align="center">Status</StyledTableCell>
                                <StyledTableCell align="center">Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={9} align="center">Loading...</TableCell></TableRow>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <StyledTableRow key={item.id}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{item.mrf_number || '-'}</TableCell>
                                        <TableCell>{item.emp_name || '-'}</TableCell>
                                        <TableCell>{item.designation || '-'}</TableCell>
                                        <TableCell>
                                            {item.mrf_hr_approve_date ? new Date(item.mrf_hr_approve_date).toLocaleDateString('en-GB') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {item.mrf_closed_date ? new Date(item.mrf_closed_date).toLocaleDateString('en-GB') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                variant="outlined"
                                                color="primary"
                                                label={`${item.candidates_count} / ${item.num_resources}`}
                                                onClick={() => handleOpenModal(item)}
                                                disabled={item.candidates_count === 0}
                                                sx={{ fontWeight: 'bold', cursor: item.candidates_count > 0 ? 'pointer' : 'default' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {/* Badge Design Section */}
                                            <Chip
                                                label={item.mrf_track_status || '-'}
                                                size="small"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    minWidth: '100px',
                                                    borderRadius: '6px',
                                                    ...getBadgeStyles(item.mrf_track_status),
                                                    // Target the internal label span specifically
                                                    '& .MuiChip-label': {
                                                        color: 'white !important',
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={() => navigate(`/mrf_status_edit/${item.id}`)}
                                                size="small"
                                                sx={{ color: 'primary.main' }}
                                            >
                                                <EditDocumentIcon />
                                            </IconButton>
                                        </TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={9} align="center">No data found.</TableCell></TableRow>
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

                <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <Fade in={isModalOpen}>
                        <Box sx={modalStyle}>
                            <Box sx={{
                                p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: 'linear-gradient(135deg, #2A7F66 0%, #1D5947 100%)', color: 'white',
                                borderTopLeftRadius: '12px', borderTopRightRadius: '12px',
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Candidate Details</Typography>
                                <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                            </Box>
                            <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
                                <List disablePadding>
                                    {selectedCandidates.map((candidate, idx) => (
                                        <ListItem key={idx} sx={{ p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}><PersonIcon /></Avatar>
                                            <ListItemText primary={candidate.name} secondary={`Offer Date: ${candidate.offer_date}`} primaryTypographyProps={{ fontWeight: '600' }} />
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