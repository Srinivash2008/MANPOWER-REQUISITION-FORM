import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Backdrop, Divider, IconButton, Card, CardContent, Tooltip
} from "@mui/material";
import {
    Numbers as NumbersIcon,
    Person as PersonIcon,
    Badge as BadgeIcon,
    CalendarToday as CalendarTodayIcon, // NOSONAR
    Update as UpdateIcon,
    Group as GroupIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material'; 
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit'; 
import { fetchMrfTrackingById, updateManpowerTracking, deleteManpowerTrackingCandidate } from '../redux/cases/manpowerrequisitionSlice';
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
            const existingCandidates = selectedRequisition.tracking_details || [];
            
            const initialCandidates = existingCandidates.map(existing => {
                return {
                    mrf_track_id: existing.mrf_track_id,
                    offer_date: existing.offer_date ? existing.offer_date.split('T')[0] : '',
                    candidate_name: existing.candidate_name || '',
                    isEditing: false,
                    isNew: false,
                };
            });

            setFormData({
                mrf_closed_date: selectedRequisition.mrf_closed_date ? selectedRequisition.mrf_closed_date.split('T')[0] : '',
                mrf_track_status: selectedRequisition.mrf_track_status || 'In Process', // NOSONAR
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

    const handleToggleEdit = (index) => {
        setFormData(prev => {
            const updatedCandidates = [...prev.candidates];
            updatedCandidates[index] = {
                ...updatedCandidates[index],
                isEditing: !updatedCandidates[index].isEditing,
            };
            return { ...prev, candidates: updatedCandidates };
        });
    };

    const handleCancelNewCandidate = (index) => {
        setFormData(prev => {
            const updatedCandidates = [...prev.candidates];
            // If it's a new candidate entry, remove it from the array
            if (updatedCandidates[index].isNew) {
                updatedCandidates.splice(index, 1);
            }
            return { ...prev, candidates: updatedCandidates };
        });
    };

    const handleUpdateCandidate = async (index) => {
        setIsUpdating(true);
        const candidateToUpdate = { ...formData.candidates[index] };

        const payload = {
            id: id, // This is the MRF ID, not the candidate ID
            mrf_closed_date: formData.mrf_closed_date,
            mrf_track_status: formData.mrf_track_status,
            candidates: [candidateToUpdate], // Send only the candidate being updated/created
        };

        try {
            await dispatch(updateManpowerTracking(payload)).unwrap();
            swal.fire('Success', 'Candidate details updated successfully!', 'success');
            
            // Refetch data to get the latest state from the server
            dispatch(fetchMrfTrackingById(id));

        } catch (error) {
            swal.fire('Error', error.message || 'Failed to update candidate details.', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteCandidate = async (index) => {
        const candidateToDelete = formData.candidates[index];

        // If it's a new candidate that hasn't been saved, just remove it from the state
        if (candidateToDelete.isNew) {
            handleCancelNewCandidate(index);
            return;
        }

        const result = await swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${candidateToDelete.candidate_name}? You won't be able to revert this!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setIsUpdating(true);
            try {
                await dispatch(deleteManpowerTrackingCandidate(candidateToDelete.mrf_track_id)).unwrap();
                swal.fire('Deleted!', 'The candidate has been marked as inactive.', 'success');
                // Refetch data to update the list
                dispatch(fetchMrfTrackingById(id));
            } catch (error) {
                swal.fire('Error', error.message || 'Failed to delete candidate.', 'error');
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const handleAddCandidate = () => {
        if (formData.candidates.length < selectedRequisition.num_resources) {
            setFormData(prev => ({
                ...prev,
                candidates: [
                    ...prev.candidates,
                    { mrf_track_id: null, offer_date: '', candidate_name: '', isEditing: true, isNew: true }
                ]
            }));
        }
    };

    const isAnyCandidateEditing = formData.candidates.some(c => c.isEditing);

    const allCandidatesFilled = formData.candidates.every(c => c.candidate_name && c.offer_date);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        // Re-evaluate `allCandidatesFilled` inside the handler to ensure it's up-to-date
        const allFilled = formData.candidates.every(c => c.candidate_name && c.offer_date);

        if (newStatus === 'Completed' && !allFilled) {
            swal.fire({
                title: 'Incomplete Details',
                text: 'Please fill in the offer date and name for all candidates before marking as completed.',
                icon: 'warning',
                confirmButtonColor: '#2A7F66',
            });
            return; // Prevent status change
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
                html: `
                    <div style="text-align: center;">
                        <div style="display: inline-block; border-radius: 50%; background-color: #E8F5E9; padding: 10px;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #4CAF50;">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                            </svg>
                        </div>
                        <h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 16px; color: #333;">Success!</h2>
                        <p style="font-size: 1rem; color: #666;">MRF Tracking status updated successfully.</p>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2A7F66', 
                showCloseButton: false,
                customClass: {
                    popup: 'modern-swal-popup'
                }
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
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px', maxWidth: '90%', mx: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', mt: { xs: 8, md: 9 } }}>
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
                            <DisplayField icon={<CalendarTodayIcon />} label="MRF Start Date" value={selectedRequisition.mrf_hr_approve_date ? new Date(selectedRequisition.mrf_hr_approve_date).toLocaleDateString() : '-'} />
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
                            </Box>

                            <FormControl fullWidth variant="outlined" sx={{ mt: 3 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="mrf_track_status"
                                    value={formData.mrf_track_status}
                                    onChange={handleStatusChange}
                                    label="Status"
                                >
                                    <MenuItem value="In Process">In Process</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                </Select>
                            </FormControl>
                            
                                
                                <Box sx={{ maxHeight: '40vh', overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
                                    {formData.candidates.map((candidate, index) => (
                                        <Box key={index}>
                                            <Card 
                                                variant="outlined" 
                                                sx={{ 
                                                    p: 2, 
                                                    borderRadius: 2, 
                                                    backgroundColor: candidate.isNew ? '#E8F5E9' : '#fafafa',
                                                    transition: 'all 0.3s ease-in-out',
                                                    boxShadow: candidate.isNew ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                                                }}
                                            >
                                                <Typography 
                                                    variant="subtitle1" 
                                                    fontWeight="bold" 
                                                    sx={{ 
                                                        mb: 2, 
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        color: candidate.isNew && !candidate.isEditing ? 'text.disabled' : 'text.primary'
                                                    }}><PersonAddIcon sx={{ mr: 1 }}/> Candidate #{index + 1}</Typography>
                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                         <TextField
                                                             fullWidth
                                                             type="date"
                                                             name="offer_date"
                                                             label="Offer Date"
                                                             value={candidate.offer_date}
                                                             onChange={(e) => handleInputChange(e, index)}
                                                             InputLabelProps={{ shrink: true }}
                                                             variant="outlined"
                                                             InputProps={{ // NOSONAR
                                                                 readOnly: !candidate.isEditing, // NOSONAR
                                                             }}
                                                         />
                                                         <TextField
                                                             fullWidth
                                                             name="candidate_name"
                                                             label="Candidate Name"
                                                             value={candidate.candidate_name}
                                                             onChange={(e) => handleInputChange(e, index)}
                                                             variant="outlined"
                                                             InputProps={{ // NOSONAR
                                                                 readOnly: !candidate.isEditing,
                                                             }}
                                                         />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {!candidate.isEditing ? (
                                                            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleToggleEdit(index)}>Edit</Button>
                                                        ) : (
                                                            <>
                                                                <Button variant="contained" startIcon={<UpdateIcon />} onClick={() => handleUpdateCandidate(index)} disabled={isUpdating}>Update</Button>
                                                                {candidate.isNew && <Button variant="text" color="error" onClick={() => handleCancelNewCandidate(index)}>Cancel</Button>}
                                                            </>
                                                        )}
                                                        {!candidate.isNew && (
                                                            <IconButton onClick={() => handleDeleteCandidate(index)} disabled={isUpdating || isAnyCandidateEditing} color="error"><DeleteIcon /></IconButton>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Box>
                                    ))}
                                </Box>
                                {formData.candidates.length < selectedRequisition.num_resources && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <Button
                                            variant="dashed"
                                            onClick={handleAddCandidate}
                                            disabled={isAnyCandidateEditing}
                                        >
                                            <PersonAddIcon sx={{ mr: 1 }} /> {formData.candidates.length === 0 ? 'Add Candidate' : 'Add Another Candidate'}
                                        </Button>
                                    </Box>
                                )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isUpdating || isAnyCandidateEditing} // Disable overall update if any candidate is being edited
                            sx={{
                                backgroundColor: '#2A7F66',
                                '&:hover': { backgroundColor: '#1D5947' }
                            }}
                        >
                            {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Update Overall Status'}
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
                            