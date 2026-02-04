import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Backdrop, Divider
} from "@mui/material";
import {
    Numbers as NumbersIcon,
    Person as PersonIcon,
    Badge as BadgeIcon,
    CalendarToday as CalendarTodayIcon,
    Update as UpdateIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchManpowerRequisitionById, updateManpowerTracking } from '../redux/cases/manpowerrequisitionSlice';
import swal from "sweetalert2";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MRF_Status_Edit = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedRequisition, loading } = useSelector((state) => state.manpowerRequisition);

    const [formData, setFormData] = useState({
        mrf_closed_date: '',
        offer_date: '',
        candidate_name: '',
        mrf_track_status: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(fetchManpowerRequisitionById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedRequisition) {
            setFormData({
                mrf_closed_date: selectedRequisition.mrf_closed_date ? selectedRequisition.mrf_closed_date.split('T')[0] : '',
                offer_date: selectedRequisition.offer_date ? selectedRequisition.offer_date.split('T')[0] : '',
                candidate_name: selectedRequisition.candidate_name || '',
                mrf_track_status: selectedRequisition.mrf_track_status || 'In Process'
            });
        }
    }, [selectedRequisition]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        const payload = {
            id: id,
            ...formData
        };

        try {
            await dispatch(updateManpowerTracking(payload)).unwrap();
            setIsUpdating(false);
            swal.fire({
                title: 'Success!',
                text: 'MRF Tracking status updated successfully.',
                icon: 'success',
                confirmButtonColor: '#2A7F66',
            }).then(() => {
                navigate('/mrf-status');
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
        <Box sx={{ p: 4, backgroundColor: '#f0f2f5', minHeight: '100vh'}}>
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px', maxWidth: '90%', mx: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.05)',mt:9 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2A7F66' }}>
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
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={5}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.secondary', mb: 2 }}>
                                Requisition Details
                            </Typography>
                            <DisplayField icon={<NumbersIcon />} label="MRF Number" value={selectedRequisition.mrf_number || '-'} />
                            <DisplayField icon={<PersonIcon />} label="Hiring Manager" value={selectedRequisition.emp_name || '-'} />
                            <DisplayField icon={<BadgeIcon />} label="Position" value={selectedRequisition.designation || '-'} />
                            <DisplayField icon={<CalendarTodayIcon />} label="MRF Start Date" value={selectedRequisition.mrf_start_date ? new Date(selectedRequisition.mrf_start_date).toLocaleDateString() : '-'} />
                        </Grid>

                        <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Divider orientation="vertical" flexItem />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.secondary', mb: 3 }}>Update Status</Typography>
                            <TextField
                                sx={{ mb: 2.5 }}
                                fullWidth
                                type="date"
                                name="mrf_closed_date"
                                label="MRF Closed Date"
                                value={formData.mrf_closed_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                            <TextField
                                sx={{ mb: 2.5 }}
                                fullWidth
                                type="date"
                                name="offer_date"
                                label="Offer Date"
                                value={formData.offer_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                            <TextField
                                sx={{ mb: 2.5 }}
                                fullWidth
                                name="candidate_name"
                                label="Candidate Name"
                                value={formData.candidate_name}
                                onChange={handleInputChange}
                                variant="outlined"
                            />

                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="mrf_track_status"
                                    value={formData.mrf_track_status}
                                    onChange={handleInputChange}
                                    label="Status"
                                >
                                    <MenuItem value="In Process">In Process</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
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