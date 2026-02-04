import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, tableCellClasses, styled, TextField, Button, Select, MenuItem, FormControl
} from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { fetchManpowerRequisitionByuserId } from '../redux/cases/manpowerrequisitionSlice';
import swal from "sweetalert2";

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

const MRF_Status = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { data: manpowerRequisitionList, loading } = useSelector((state) => state.manpowerRequisition);

    const [trackingData, setTrackingData] = useState([]);

    useEffect(() => {
        dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
    }, [dispatch, user?.emp_id]);

    useEffect(() => {
        if (manpowerRequisitionList) {
            const hrApprovedList = manpowerRequisitionList.filter(
                (mrf) => mrf.hr_status === 'HR Approve'
            );
            setTrackingData(hrApprovedList.map(item => ({
                ...item,
                mrf_closed_date: item.mrf_closed_date ? item.mrf_closed_date.split('T')[0] : '',
                offer_date: item.offer_date ? item.offer_date.split('T')[0] : '',
                isEditing: false,
            })));
        }
    }, [manpowerRequisitionList]);

    const handleInputChange = (e, id) => {
        const { name, value } = e.target;
        setTrackingData(prevData =>
            prevData.map(item =>
                item.id === id ? { ...item, [name]: value } : item
            )
        );
    };

    const handleUpdate = (id) => {
        const currentItem = trackingData.find(item => item.id === id);
        const payload = {
            id: currentItem.id,
            mrf_closed_date: currentItem.mrf_closed_date,
            mrf_track_status: currentItem.mrf_track_status,
            offer_date: currentItem.offer_date,
            candidate_name: currentItem.candidate_name,
        };

        // dispatch(updateManpowerTracking(payload))
        //     .unwrap()
        //     .then(() => {
        //         swal.fire({
        //             title: 'Success!',
        //             text: 'MRF Tracking updated successfully.',
        //             icon: 'success',
        //             confirmButtonColor: '#2A7F66',
        //         });
        //         dispatch(fetchManpowerRequisitionByuserId(user?.emp_id));
        //     })
        //     .catch((error) => {
        //         swal.fire({
        //             title: 'Error!',
        //             text: error.message || 'Failed to update MRF Tracking.',
        //             icon: 'error',
        //             confirmButtonColor: '#d33',
        //         });
        //     });
    };

    return (
        <Box sx={{ p: 4, backgroundColor: '#f0f2f5', minHeight: '100vh', mt: 10 }}>
            <Paper sx={{ p: 3, borderRadius: '12px' }}>
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
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Offer Date</StyledTableCell>
                                <StyledTableCell>Candidate Name</StyledTableCell>
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
                                        <TableCell>{item.mrf_number}</TableCell>
                                        <TableCell>{item.emp_name}</TableCell>
                                        <TableCell>{item.designation}</TableCell>
                                        <TableCell>{item.mrf_start_date ? new Date(item.mrf_start_date).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="date"
                                                name="mrf_closed_date"
                                                value={item.mrf_closed_date || ''}
                                                onChange={(e) => handleInputChange(e, item.id)}
                                                InputLabelProps={{ shrink: true }}
                                                size="small"
                                                variant="standard"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormControl variant="standard" size="small" fullWidth>
                                                <Select
                                                    name="mrf_track_status"
                                                    value={item.mrf_track_status || ''}
                                                    onChange={(e) => handleInputChange(e, item.id)}
                                                    disabled={item.mrf_track_status === 'Completed'}
                                                >
                                                    <MenuItem value="In Process">In Process</MenuItem>
                                                    <MenuItem value="Completed">Completed</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="date"
                                                name="offer_date"
                                                value={item.offer_date || ''}
                                                onChange={(e) => handleInputChange(e, item.id)}
                                                InputLabelProps={{ shrink: true }}
                                                size="small"
                                                variant="standard"
                                                disabled={item.mrf_track_status === 'Completed'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                name="candidate_name"
                                                value={item.candidate_name || ''}
                                                onChange={(e) => handleInputChange(e, item.id)}
                                                size="small"
                                                variant="standard"
                                                disabled={item.mrf_track_status === 'Completed'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleUpdate(item.id)}
                                                sx={{
                                                    backgroundColor: '#2A7F66',
                                                    '&:hover': {
                                                        backgroundColor: '#1D5947'
                                                    }
                                                }}
                                            >
                                                Update
                                            </Button>
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
            </Paper>
        </Box>
    );
};

export default MRF_Status;