import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Backdrop
} from "@mui/material";
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

    return (
        <Box sx={{ p: 4, backgroundColor: '#f0f2f5', minHeight: '100vh', mt: 8 }}>
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '12px', maxWidth: '800px', mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2A7F66' }}>
                        Edit MRF Tracking Status
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back
                    </Button>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Display Fields */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight="bold">MRF Number</Typography>
                            <Typography variant="body1">{selectedRequisition.mrf_number || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight="bold">Hiring Manager</Typography>
                            <Typography variant="body1">{selectedRequisition.emp_name || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight="bold">Position</Typography>
                            <Typography variant="body1">{selectedRequisition.designation || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight="bold">MRF Start Date</Typography>
                            <Typography variant="body1">{selectedRequisition.mrf_start_date ? new Date(selectedRequisition.mrf_start_date).toLocaleDateString() : '-'}</Typography>
                        </Grid>

                        {/* Editable Fields */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                name="mrf_closed_date"
                                label="MRF Closed Date"
                                value={formData.mrf_closed_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                name="offer_date"
                                label="Offer Date"
                                value={formData.offer_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="candidate_name"
                                label="Candidate Name"
                                value={formData.candidate_name}
                                onChange={handleInputChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
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

                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isUpdating}
                                sx={{
                                    backgroundColor: '#2A7F66',
                                    '&:hover': { backgroundColor: '#1D5947' }
                                }}
                            >
                                {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Update Status'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isUpdating}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default MRF_Status_Edit;