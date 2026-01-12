import React, { useState, useEffect } from 'react';
import { FiUser, FiBriefcase, FiLayers, FiFileText, FiEdit3, FiClock, FiFile, FiDownload, FiHelpCircle, FiMessageSquare } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import "./Add_Form.css";
import { Snackbar, Alert as MuiAlert, Button, Tooltip, Box, TextField } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchManpowerRequisitionById, fetchQuery, replyToQuery } from '../redux/cases/manpowerrequisitionSlice';
import { useDispatch, useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FHReply = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { token, user } = useSelector((state) => state.auth);
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
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        dispatch(fetchManpowerRequisitionById(id));
        dispatch(fetchQuery(id));
    }, [dispatch, id]);

    const { selectedRequisition, query } = useSelector((state) => state.manpowerRequisition);

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
        // const correctedFilePath = filePath.replace(/\\/g, '/');
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
        try {
            await dispatch(replyToQuery({ id, reply })).unwrap();
            setNotification({
                open: true,
                message: 'Reply submitted successfully!',
                severity: 'success'
            });
            navigate('/dashboard');
        } catch (error) {
            setNotification({
                open: true,
                message: `Failed to submit reply: ${error}`,
                severity: 'error'
            });
        }
    };


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

    return (
        <div className="page-wrapper">
            <div className="form-panel">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2,mt:5, flexDirection: "row-reverse" }}>
                     <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackIcon sx={{ color: 'white' }} />}
                        sx={{
                            backgroundColor: 'success.main',
                            color: 'white',
                            '&:hover': { backgroundColor: 'success.dark' },
                        }}
                    >Back</Button>
                </Box>
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
                             <div style={{ marginTop: '1rem' }}>
                                <DisplayTextarea label="Director Query" value={formData.query_name_director} />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <DisplayTextarea label="HR Query" value={formData.query_name_hr} />
                            </div>
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


                        {/* Requirement Details Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiBriefcase /> Requirement Details</h3>
                            <div className="section-grid multi-col">
                                <DisplayField label="Department" value={formData.department} />
                                <DisplayField label="Status of Employment" value={formData.employmentStatus} />
                                <DisplayField label="Proposed Designation" value={formData.designation} />
                                <DisplayField label="No. of Resources" value={formData.numResources} />
                                <DisplayField label="Requirement Type" value={formData.requirementType} />

                                {formData.requirementType === "Ramp up" && (
                                    <>
                                        <DisplayField label="Project Name" value={formData.projectName} />
                                        <DisplayField label="Projection Plan" value={formData.projectionPlan} />
                                        <div className="full-width">
                                            <label className="form-label">Uploaded File</label>
                                            {formData.rampUpFile ? (
                                                <div className="professional-file-display">
                                                    <div className="file-info">
                                                        <FiFile className="file-info-icon" />
                                                        <Tooltip title={formData.rampUpFile.split(/[\/]/).pop()} placement="top">
                                                            <span className="file-info-name">{formData.rampUpFile.split(/[\/]/).pop()}</span>
                                                        </Tooltip>
                                                    </div>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={(e) => { e.preventDefault(); handleDownload(formData.rampUpFile); }}
                                                        startIcon={<FiDownload />}
                                                        size="small">
                                                        Download
                                                    </Button>
                                                </div>
                                            ) : (<p className="form-display-text">No file uploaded.</p>)}
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "New Requirement" && (
                                    <>
                                        <div className="full-width">
                                            <DisplayField label="Project Name" value={formData.projectName} />
                                            <DisplayField label="Reason for Additional Resources" value={formData.rampUpReason} />
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "Replacement" && (
                                    <DisplayField label="Resigned Employee (Name + ID)" value={formData.replacementDetail} />
                                )}
                            </div>
                        </div>

                    </div>
                </form>
            </div>
            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MuiAlert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </MuiAlert>
            </Snackbar>
        </div>
    );
};

export default FHReply;
