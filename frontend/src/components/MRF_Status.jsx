import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, tableCellClasses, styled, IconButton
} from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { fetchManpowerRequisitionByuserId } from '../redux/cases/manpowerrequisitionSlice';
import { useNavigate } from 'react-router-dom';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

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
    const navigate = useNavigate();
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

    const handleEditClick = (id) => {
        navigate(`/manpower_requisition_edit/${id}`);
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
                               
                                <StyledTableCell>Offer Date</StyledTableCell>
                                <StyledTableCell>Candidate Name</StyledTableCell>
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
                                        
                                        <TableCell>{item.offer_date || '-'}</TableCell>
                                        <TableCell>{item.candidate_name || '-'}</TableCell>
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
            </Paper>
        </Box>
    );
};

export default MRF_Status;