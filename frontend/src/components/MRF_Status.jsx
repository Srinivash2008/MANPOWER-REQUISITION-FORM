import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, tableCellClasses, styled, IconButton, Modal, Fade,
    List, ListItem, ListItemText, Divider, Chip, Avatar
} from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMrfTrackingList } from '../redux/cases/manpowerrequisitionSlice';
import { useNavigate } from 'react-router-dom';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
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
    p: 0, // Padding will be handled internally
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

    const handleEditClick = (id) => {
        navigate(`/mrf_status_edit/${id}`);
    };

    const handleOpenModal = (item) => {
        const candidates = item.candidate_names.map((name, index) => ({
            name: name,
            offer_date: item.offer_dates[index] ? new Date(item.offer_dates[index]).toLocaleDateString() : 'N/A',
        }));
        setSelectedCandidates(candidates);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);


    return (
        <Box sx={{ p: 4, backgroundColor: '#f0f2f5', minHeight: '100vh'}}>
            <Paper sx={{ p: 3, borderRadius: '12px' , mt: 10 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#2A7F66', mb: 2 }}>
                    MRF Tracking Status
                </Typography>
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
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">Loading...</TableCell>
                                </TableRow>
                            ) : trackingData.length > 0 ? (
                                trackingData.map((item, index) => (
                                    <StyledTableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.mrf_number || '-'}</TableCell>
                                        <TableCell>{item.emp_name || '-'}</TableCell>
                                        <TableCell>{item.designation || '-'}</TableCell>
                                        <TableCell>{item.mrf_start_date ? new Date(item.mrf_start_date).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>{item.mrf_closed_date || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                variant="outlined"
                                                color="primary"
                                                label={`${item.candidates_count} / ${item.num_resources}`}
                                                onClick={() => handleOpenModal(item)}
                                                disabled={item.candidates_count === 0}
                                                sx={{
                                                    cursor: item.candidates_count > 0 ? 'pointer' : 'default',
                                                    fontWeight: 'bold',
                                                    transition: 'transform 0.2s ease-in-out',
                                                    '&:hover:not(.Mui-disabled)': {
                                                        transform: 'scale(1.05)',
                                                        backgroundColor: 'primary.main',
                                                        color: 'white',
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{item.mrf_track_status || '-'}</TableCell>
                                        <TableCell>
                                            {item.mrf_track_status !== 'Completed' && (
                                                <IconButton
                                                    onClick={() => handleEditClick(item.id)}
                                                    size="small"
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <EditDocumentIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        No HR Approved MRFs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Modal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    aria-labelledby="candidate-modal-title"
                    closeAfterTransition
                >
                    <Fade in={isModalOpen}>
                        <Box sx={modalStyle}>
                            <Box sx={{ 
                                p: 3, 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                background: 'linear-gradient(135deg, #2A7F66 0%, #1D5947 100%)',
                                color: 'white !important',
                                borderTopLeftRadius: '12px',
                                borderTopRightRadius: '12px',
                            }}>
                                <Typography id="candidate-modal-title" variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'white !important', }}>
                                    Candidate Details
                                </Typography>
                                <IconButton onClick={handleCloseModal} aria-label="close" sx={{ color: 'white' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
                                <List disablePadding>
                                    {selectedCandidates.length > 0 ? selectedCandidates.map((candidate, index) => (
                                            <ListItem key={index} disableGutters sx={{ p: 1, borderRadius: 2, '&:hover': { backgroundColor: 'action.hover' } }}>
                                                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                                    <PersonIcon />
                                                </Avatar>
                                                <ListItemText
                                                    primary={candidate.name}
                                                    secondary={`Offer Date: ${candidate.offer_date}`}
                                                    primaryTypographyProps={{ fontWeight: '600' }}
                                                />
                                            </ListItem>
                                    )) : (
                                        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                            No candidate details available.
                                        </Typography>
                                    )}
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