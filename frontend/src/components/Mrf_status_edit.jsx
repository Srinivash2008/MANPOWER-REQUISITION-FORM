import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Backdrop, Divider, IconButton, Card, CardContent, Tooltip
} from "@mui/material";
import {
    Numbers as NumbersIcon,
    Person as PersonIcon,
    Badge as BadgeIcon,
    CalendarToday as CalendarTodayIcon,
    Update as UpdateIcon,
    Group as GroupIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material'; 
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMrfTrackingById, updateManpowerTracking } from '../redux/cases/manpowerrequisitionSlice';
import swal from "sweetalert2";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MRF_Status_Edit = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedRequisition, loading } = useSelector((state) => state.manpowerRequisition);

    const [formData, setFormData] = useState({
        mrf_closed_date: '',
        mrf_track_status: '',
        candidates: []
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(fetchMrfTrackingById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedRequisition) {
            const numResources = selectedRequisition.num_resources || 1;
            const existingCandidates = selectedRequisition.tracking_details || [];
            
            const initialCandidates = Array.from({ length: numResources }, (_, index) => {
                const existing = existingCandidates[index];
                return {
                    mrf_track_id: existing?.mrf_track_id || null,
                    offer_date: existing?.offer_date ? existing.offer_date.split('T')[0] : '',
                    candidate_name: existing?.candidate_name || ''
                };
            });

            setFormData({
                mrf_closed_date: selectedRequisition.mrf_closed_date ? selectedRequisition.mrf_closed_date.split('T')[0] : '',
                mrf_track_status: selectedRequisition.mrf_track_status || 'In Process',
                candidates: initialCandidates
            });
        }
    }, [selectedRequisition]);

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedCandidates = [...formData.candidates];
        updatedCandidates[index] = { ...updatedCandidates[index], [name]: value };
        setFormData(prev => ({ ...prev, candidates: updatedCandidates }));
    };

    const allCandidatesFilled = formData.candidates.every(c => c.candidate_name && c.offer_date);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        if (newStatus === 'Completed' && !allCandidatesFilled) {
            swal.fire({
                title: 'Incomplete Details',
                text: 'Please fill in the offer date and name for all candidates before marking as completed.',
                icon: 'warning',
                confirmButtonColor: '#2A7F66',
            });
            return;
        }
        setFormData(prev => ({ ...prev, mrf_track_status: newStatus }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        const payload = {
            id: id,
            ...formData
        };

        if (payload.mrf_track_status === 'Completed' && !allCandidatesFilled) {
            setIsUpdating(false);
            swal.fire({
                title: 'Cannot Complete MRF',
                text: 'Please ensure all candidate details (Offer Date and Name) are filled before completing the MRF.',
                icon: 'error',
                confirmButtonColor: '#d33',
            });
            return;
        }

        try {
            await dispatch(updateManpowerTracking(payload)).unwrap();
            setIsUpdating(false);
            swal.fire({
                title: 'Success!',
                text: 'MRF Tracking status updated successfully.',
                icon: 'success',
                confirmButtonColor: '#2A7F66',
            }).then(() => {
                navigate('/approved-mrf');
            });
        } catch (error) {
            setIsUpdating(false);
            swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to update MRF Tracking status.',
                icon: 'error',
                confirmButtonColor: '#d33',
            });
        }
    };

    if (loading || !selectedRequisition) {
        return (
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    const DisplayField = ({ icon, label, value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, borderRadius: 2, transition: 'background-color 0.3s', '&:hover': { backgroundColor: 'action.hover' } }}>
            <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                    {value}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px', maxWidth: '100%', mx: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', mt: { xs: 8, md: 9 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2A7F66', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Edit MRF Tracking Status
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: '#2A7F66', borderColor: '#2A7F66', '&:hover': { borderColor: '#1D5947', backgroundColor: 'rgba(42, 127, 102, 0.04)' } }}
                    >
                        Back
                    </Button>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 5 } }}>
                        <Box sx={{ flex: '1 1 1%' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.secondary', mb: 2 }}>
                                Requisition Details
                            </Typography>
                            <DisplayField icon={<NumbersIcon />} label="MRF Number" value={selectedRequisition.mrf_number || '-'} />
                            <DisplayField icon={<PersonIcon />} label="Hiring Manager" value={selectedRequisition.emp_name || '-'} />
                            <DisplayField icon={<BadgeIcon />} label="Position" value={selectedRequisition.designation || '-'} />
                            <DisplayField icon={<GroupIcon />} label="Number of Resources" value={selectedRequisition.num_resources || '-'} />
                            <DisplayField icon={<CalendarTodayIcon />} label="MRF Start Date" value={selectedRequisition.mrf_start_date ? new Date(selectedRequisition.mrf_start_date).toLocaleDateString() : '-'} />
                        </Box>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                            <Divider orientation="vertical" flexItem />
                        </Box>

                        <Box sx={{ flex: '1 1 55%' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.secondary', mb: 3, display: 'flex', alignItems: 'center' }}>
                                <GroupIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                                Candidate & Status Update
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <Box>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        name="mrf_closed_date"
                                        label="MRF Closed Date"
                                        value={formData.mrf_closed_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mrf_closed_date: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                    />
                                </Box>
                                <Box sx={{ maxHeight: '40vh', overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    {formData.candidates.map((candidate, index) => (
                                        <Box key={index}>
                                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: '#fafafa' }}>
                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}><PersonAddIcon sx={{ mr: 1 }}/> Candidate #{index + 1}</Typography>
                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <TextField fullWidth type="date" name="offer_date" label="Offer Date" value={candidate.offer_date} onChange={(e) => handleInputChange(e, index)} InputLabelProps={{ shrink: true }} variant="outlined" />
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <TextField fullWidth name="candidate_name" label="Candidate Name" value={candidate.candidate_name} onChange={(e) => handleInputChange(e, index)} variant="outlined" />
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <FormControl fullWidth variant="outlined" sx={{ mt: 2.5 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="mrf_track_status"
                                    value={formData.mrf_track_status}
                                    onChange={handleStatusChange}
                                    label="Status"
                                >
                                    <MenuItem value="In Process">In Process</MenuItem>
                                    <Tooltip title={!allCandidatesFilled ? "Fill all candidate details to complete" : ""}>
                                        <span>
                                            <MenuItem value="Completed" disabled={!allCandidatesFilled}>Completed</MenuItem>
                                        </span>
                                    </Tooltip>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isUpdating}
                            startIcon={<UpdateIcon />}
                            sx={{
                                backgroundColor: '#2A7F66',
                                '&:hover': { backgroundColor: '#1D5947' }
                            }}
                        >
                            {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Update Status'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isUpdating}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default MRF_Status_Edit;