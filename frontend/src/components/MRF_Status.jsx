import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, tableCellClasses, styled, IconButton, Modal, Fade, TablePagination,
    List, ListItem, ListItemText, Chip, Avatar, FormControl, InputLabel, Select, MenuItem, Tooltip
} from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMrfTrackingList } from '../redux/cases/manpowerrequisitionSlice';
import { useNavigate } from 'react-router-dom';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

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

    // Badge styling based on status
    const getBadgeStyles = (status) => {
        switch (status) {
            case 'Offered':
                return {
                    bgcolor: '#1565c0',
                    color: '#fff !important'
                };
            case 'Joined':
                return {
                    bgcolor: '#2e7d32',
                    color: '#fff !important'
                };
            case 'In Process':
                return {
                    bgcolor: '#ed6c02',
                    color: '#fff !important'
                };
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
                                <StyledTableCell>Replacement</StyledTableCell>
                                <StyledTableCell>MRF Start Date</StyledTableCell>
                                <StyledTableCell>MRF Closed Date</StyledTableCell>
                                <StyledTableCell>Candidates</StyledTableCell>
                                <StyledTableCell align="center">TAT</StyledTableCell>
                                <StyledTableCell align="center">Status</StyledTableCell>
                                <StyledTableCell align="center">Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">Loading...</TableCell>
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
                                            <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell align="center">{item.mrf_number || '-'}</TableCell>
                                            <TableCell align="center">{item.emp_name || '-'}</TableCell>
                                            <TableCell align="center">{item.designation || '-'}</TableCell>
                                            <TableCell align="center">
                                                {item.requirement_type === 'Replacement' ? item.replacement_detail || '-' : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {item.mrf_hr_approve_date ? new Date(item.mrf_hr_approve_date).toLocaleDateString('en-GB') : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {item.mrf_closed_date ? new Date(item.mrf_closed_date).toLocaleDateString('en-GB') : '-'}
                                            </TableCell>
                                            <TableCell align="center">
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
                                                                bgcolor: isOverdue ? '#d32f2f' : '#e0f2f1',
                                                                color: isOverdue ? '#fff' : '#2A7F66',
                                                                '& .MuiChip-label': {
                                                                    color: isOverdue ? '#fff' : '#2A7F66',
                                                                },
                                                                borderRadius: '6px',
                                                                minWidth: '80px',
                                                                cursor: 'pointer',
                                                            }}
                                                        />
                                                    </Tooltip>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={item.mrf_track_status || '-'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        minWidth: '100px',
                                                        borderRadius: '6px',
                                                        ...getBadgeStyles(item.mrf_track_status),
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
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">No data found.</TableCell>
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