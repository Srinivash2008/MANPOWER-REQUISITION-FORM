import React, { useState, useEffect, use } from 'react';
import { FiUser, FiBriefcase, FiLayers, FiFileText, FiEdit3, FiClock, FiFile, FiDownload, FiHelpCircle, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import "./Add_Form.css";
import { Snackbar, Alert as MuiAlert, Button, Tooltip, Box, TextField, Typography, AppBar, Toolbar, Avatar, Menu, MenuItem, Divider, Backdrop, CircularProgress, Card, CardContent } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchManpowerRequisitionById, fetchQuery, replyToQuery } from '../redux/cases/manpowerrequisitionSlice';
import { useDispatch, useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { jwtDecode } from 'jwt-decode';
import { fetchUserByEmpId } from '../redux/cases/manpowerrequisitionSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/images/logo_MRF_new.png';
import { login, logout } from '../redux/auth/authSlice';

const FHReply = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);

    const { selectedRequisition, query, loading } = useSelector((state) => state.manpowerRequisition);

    console.log(selectedRequisition, "selectedRequisition");
    const { user } = useSelector((state) => state.auth);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: "",
        department: "",
        employmentStatus: "",
        designation: "",
        numResources: 1,
        requirementType: "",
        projectName: "",
        projectionPlan: "",
        replacementDetail: "",
        rampUpFile: null,
        rampUpReason: "",
        jobDescription: "",
        education: "",
        experience: "",
        ctcRange: "",
        specificInfo: "",
        hiringTAT: "",
        requestorSign: null,
        directorSign: null,
        mrfNumber: "",
        tatAgreed: "",
        hrReview: "",
        deliveryPhase: "",
        hrstatus: "",
        directorstatus: "",
        query_name_hr: "",
        query_name_director: "",
        hr_comments: "",
        director_comments: "",
        status: "",
        created_at: ""
    });

    const [reply, setReply] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        if (user && id) {
            try {
                const decodedData = jwtDecode(id);
                dispatch(fetchManpowerRequisitionById(decodedData.pid));
                dispatch(fetchQuery(decodedData.pid));
            } catch (e) {
                console.error("Failed to decode or parse ID:", e);
                setError("Invalid identifier provided.");
            }
        }
    }, [dispatch, id, user]);

    useEffect(() => {
        if(selectedRequisition){
        if(selectedRequisition.query_created_by == "1400"){
            if(selectedRequisition.Director_Query_Answer){
            setIsSubmitted(true);
            }
        }
        else if(selectedRequisition.query_created_by == "1722"){
            if(selectedRequisition.HR_Query_Answer){
            setIsSubmitted(true);
            }
        }    
    }

    }, [selectedRequisition]);




    useEffect(() => {
        if (selectedRequisition) {
            let tatValue = "";
            if (selectedRequisition.hiring_tat_fastag === 1) tatValue = "Fastag Hiring (60 Days)";
            else if (selectedRequisition.hiring_tat_normal_cat1 === 1) tatValue = "Normal Hiring – Cat 1 (90 Days)";
            else if (selectedRequisition.hiring_tat_normal_cat2 === 1) tatValue = "Normal Hiring – Cat 2 (120 Days)";

            setFormData({
                id: selectedRequisition.id || "",
                department: selectedRequisition.department || "",
                employmentStatus: selectedRequisition.employment_status || "",
                designation: selectedRequisition.designation || "",
                numResources: selectedRequisition.num_resources || 1,
                requirementType: selectedRequisition.requirement_type || "",
                projectName: selectedRequisition.project_name || "",
                projectionPlan: selectedRequisition.projection_plan || "",
                replacementDetail: selectedRequisition.replacement_detail || "",
                rampUpFile: selectedRequisition.ramp_up_file || null,
                rampUpReason: selectedRequisition.ramp_up_reason || "",
                jobDescription: selectedRequisition.job_description || "",
                education: selectedRequisition.education || "",
                experience: selectedRequisition.experience || "",
                ctcRange: selectedRequisition.ctc_range || "",
                specificInfo: selectedRequisition.specific_info || "-",
                hiringTAT: tatValue,
                requestorSign: selectedRequisition.requestor_sign || null,
                directorSign: selectedRequisition.director_sign || null,
                mrfNumber: selectedRequisition.mrf_number || "-",
                tatAgreed: selectedRequisition.tat_agreed || "-",
                hrReview: selectedRequisition.hr_review || "-",
                deliveryPhase: selectedRequisition.delivery_phase || "-",
                hrstatus: selectedRequisition.hr_status || "",
                directorstatus: selectedRequisition.director_status || "",
                query_name_hr: selectedRequisition.query_name_hr || "",
                query_name_director: selectedRequisition.query_name_director || "",
                hr_comments: selectedRequisition.hr_comments || "-",
                director_comments: selectedRequisition.director_comments || "-",
                status: selectedRequisition.status || "",
                created_at: selectedRequisition.created_at || "-"
            });
        }
    }, [selectedRequisition]);

    useEffect(() => {
        if (query) {
            setFormData(prev => ({ ...prev, query_name_hr: query.query_name_hr, query_name_director: query.query_name_director }))
        }
    }, [query]);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    const handleDownload = async (filePath) => {
        if (!filePath || typeof filePath !== 'string') {
            setNotification({
                open: true,
                message: 'File path is invalid.',
                severity: 'error'
            });
            return;
        }
        const correctedFilePath = filePath.replace(/\\/g, '/');
        console.log(`${API_URL}/${correctedFilePath}`, "url")

        try {
            const response = await fetch(`${API_URL}/${correctedFilePath}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error(`File not found. Status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            let fileName = correctedFilePath.split(/[\\/]/).pop();

            if (!fileName.includes(".")) {
                const mime = blob.type;

                if (mime.includes("pdf")) fileName += ".pdf";
                else if (mime.includes("word")) fileName += ".docx";
                else if (mime.includes("spreadsheet") || mime.includes("excel"))
                    fileName += ".xlsx";
                else fileName += ".file";
            }

            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Download failed:", error);
            setNotification({
                open: true,
                message: 'Download failed.',
                severity: 'error'
            });
        }
    };

    const handleSubmitReply = async () => {
        if (!reply.trim()) {
            setNotification({
                open: true,
                message: 'Reply cannot be empty.',
                severity: 'error'
            });
            return;
        } 
        const decodedData = jwtDecode(id);
        try {
            setIsSubmitting(true);
            await dispatch(replyToQuery({ id: decodedData.pid, reply })).unwrap();
            setNotification({
                open: true, 
                message: 'Reply submitted successfully!',
                severity: 'success'
            });
            setIsSubmitted(true);
        } catch (error) {
            setNotification({
                open: true,
                message: `Failed to submit reply: ${error}`,
                severity: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUserMenuClick = (event) => {
        setUserMenuAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        sessionStorage.removeItem("MER_EDIT_ID");
        handleUserMenuClose();
        navigate("/login");
    };


    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error" variant="h6">{error}</Typography>
            </Box>
        );
    }

    if (loading || !selectedRequisition) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const DisplayField = ({ label, value }) => (
        <div>
            <label className="form-label">{label}</label>
            <p className="form-display-text">{value || 'N/A'}</p>
        </div>
    );

    const DisplayTextarea = ({ label, value }) => (
        <div className="full-width">
            <label className="form-label">{label}</label>
            <p className="form-display-textarea">{value || 'N/A'}</p>
        </div>
    );

    if (isSubmitted) {
        return (
            <>
            <AppBar position="fixed" sx={{
                backgroundColor: 'white',
                color: '#2A7F66',
                boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 5px 0 rgba(0,0,0,0.04), 0 1px 10px 0 rgba(0,0,0,0.08)',
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <img
                            src={Logo}
                            alt="MRF Logo"
                            style={{ height: '40px', marginRight: '16px', cursor: 'pointer' }}
                            onClick={() => navigate('/dashboard')}
                        />
                       
                    </Box> 
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={handleUserMenuClick}>
                        <Typography variant="subtitle1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user?.emp_name}
                        </Typography>
                        <Avatar sx={{ bgcolor: '#2A7F66', width: 40, height: 40 }}>
                            {user?.emp_name ? user.emp_name.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                    </Box>
                    <Menu
                        anchorEl={userMenuAnchorEl}
                        open={Boolean(userMenuAnchorEl)}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        PaperProps={{ sx: { mt: 1 } }}
                    >
                        <MenuItem
                            onClick={handleLogout}
                            sx={{ color: 'error.main', '&:hover': { backgroundColor: 'error.main', color: 'white' } }}
                        >
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <Card sx={{ maxWidth: 400, textAlign: 'center', p: 4, borderRadius: 4, boxShadow: 3 }}>
                    <CardContent>
                        <FiCheckCircle size={60} style={{ color: 'green', marginBottom: '16px' }} />
                        <Typography variant="h5" component="div" gutterBottom>
                            Form Submitted
                        </Typography>
                        <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                            Your reply has been successfully submitted.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </Box>
            </>
        );
    }

    return (
        <div className="page-wrapper">
            <AppBar position="fixed" sx={{
                backgroundColor: 'white',
                color: '#2A7F66',
                boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 5px 0 rgba(0,0,0,0.04), 0 1px 10px 0 rgba(0,0,0,0.08)',
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <img
                            src={Logo}
                            alt="MRF Logo"
                            style={{ height: '40px', marginRight: '16px', cursor: 'pointer' }}
                            onClick={() => navigate('/dashboard')}
                        />
                       
                    </Box> 
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={handleUserMenuClick}>
                        <Typography variant="subtitle1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user?.emp_name}
                        </Typography>
                        <Avatar sx={{ bgcolor: '#2A7F66', width: 40, height: 40 }}>
                            {user?.emp_name ? user.emp_name.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                    </Box>
                    <Menu
                        anchorEl={userMenuAnchorEl}
                        open={Boolean(userMenuAnchorEl)}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        PaperProps={{ sx: { mt: 1 } }}
                    >
                        <MenuItem
                            onClick={handleLogout}
                            sx={{ color: 'error.main', '&:hover': { backgroundColor: 'error.main', color: 'white' } }}
                        >
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <div className="form-panel"style={{marginTop:'3%'}}>
               
                <div className="form-header">
                    <h1 className="info-title">
                        Reply to Query
                    </h1>
                    <p className="info-subtitle">
                        Review the query and provide your reply below.
                    </p>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-grid">

                        {/* Query Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiHelpCircle /> Query Details</h3>
                             {formData.query_name_director && (
                                <div style={{ marginTop: '1rem' }}>
                                    <DisplayTextarea label="Director Query" value={formData.query_name_director} />
                                </div>
                            )}
                            {formData.query_name_hr && (
                                <div style={{ marginTop: '1rem' }}>
                                    <DisplayTextarea label="HR Query" value={formData.query_name_hr} />
                                </div>
                            )}
                        </div>

                        {/* Reply Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiMessageSquare /> Your Reply</h3>
                            <TextField
                                label="Your Reply"
                                multiline
                                rows={4}
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                variant="outlined"
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmitReply}
                                sx={{ mt: 2 }}
                            >
                                Submit Reply
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MuiAlert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </MuiAlert>
            </Snackbar>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isSubmitting}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default FHReply;
