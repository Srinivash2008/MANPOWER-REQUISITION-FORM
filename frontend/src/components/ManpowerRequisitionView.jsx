import React, { useState, useEffect } from 'react';
import { FiUser, FiBriefcase, FiLayers, FiFileText, FiEdit3, FiClock, FiFile, FiDownload } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import "./Add_Form.css";
import { Snackbar, Alert as MuiAlert, Button, Tooltip, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchManpowerRequisitionById, fetchManagerList } from '../redux/cases/manpowerrequisitionSlice';
import { useDispatch, useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ManpowerRequisitionView = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { token, user } = useSelector((state) => state.auth);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const navigate = useNavigate();
    useEffect(() => {
        if (token) {
            dispatch(fetchManagerList());
        }
    }, [token, dispatch]);

    const { managerList } = useSelector((state) => state.manpowerRequisition);

    // --- Role-based visibility flags ---
    const isHr = user?.emp_id === "12345" || user?.emp_id === "1722";
    const isDirector = user?.emp_id === "1400";
    const isSeniorManager = managerList.some(manager => manager.employee_id === user?.emp_id);

    const [formData, setFormData] = useState({
        id: "",
        department: "", // Keep department for display
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

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        dispatch(fetchManpowerRequisitionById(id));
    }, [dispatch, id]);

    const { selectedRequisition } = useSelector((state) => state.manpowerRequisition);
    console.log(selectedRequisition, "selectedRequisition")
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
                created_at: selectedRequisition.created_at || "-",
                Director_Query_Answer: selectedRequisition.Director_Query_Answer || "",
                HR_Query_Answer: selectedRequisition.HR_Query_Answer || ""
            });
        }
    }, [selectedRequisition]);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    // const handleDownload = async (filePath) => {
    //     if (!filePath || typeof filePath !== 'string') {
    //         setNotification({ open: true, message: 'File path is invalid.', severity: 'error' });
    //         return;
    //     }

    //     try {
    //         const response = await fetch(`${API_URL}/${filePath}`);
    //         if (!response.ok) throw new Error(`File not found. Status: ${response.status}`);
    //         const blob = await response.blob();
    //         const url = window.URL.createObjectURL(blob);

    //         const a = document.createElement("a");
    //         a.href = url;
    //         a.download = filePath.split(/[\\/]/).pop(); // Extract file name
    //         document.body.appendChild(a);
    //         a.click();
    //         a.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (error) {
    //         console.error("Download failed:", error);
    //         setNotification({ open: true, message: 'Download failed.', severity: 'error' });
    //     }
    // };

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

            // Extract filename
            let fileName = correctedFilePath.split(/[\\/]/).pop();

            // If filename has no extension, detect based on MIME
            if (!fileName.includes(".")) {
                const mime = blob.type;

                if (mime.includes("pdf")) fileName += ".pdf";
                else if (mime.includes("word")) fileName += ".docx";
                else if (mime.includes("spreadsheet") || mime.includes("excel"))
                    fileName += ".xlsx";
                else fileName += ".file";
            }

            // Create a temporary link for download
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Release memory
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 5, flexDirection: "row-reverse" }}>
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
                        View Manpower Requisition
                    </h1>
                    <p className="info-subtitle">
                        This is a read-only view of the requisition. To make changes, please use the edit functionality.
                    </p>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-grid">
                        {/* Requirement Details Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiBriefcase /> Requirement Details</h3>
                            <div className="section-grid multi-col">
                                <DisplayField label="Department" value={formData.department} />
                                <DisplayField label="Status of Employment" value={formData.employmentStatus} />
                                <DisplayField label="Proposed Designation" value={formData.designation} />
                                <DisplayField label="No. of Resources" value={formData.numResources} />
                                <DisplayField label="Requirement Type" value={formData.requirementType} />

                                {/* Conditional Fields */}
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
                                                        <Tooltip title={formData.rampUpFile.split(/[\\/]/).pop()} placement="top">
                                                            <span className="file-info-name">{formData.rampUpFile.split(/[\\/]/).pop()}</span>
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

                        {/* Candidate Profile Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiUser /> Candidate Profile</h3>
                            <div className="section-grid">
                                <DisplayTextarea label="Job Description" value={formData.jobDescription} />
                                <DisplayField label="Educational Qualification" value={formData.education} />
                            </div>
                        </div>

                        {/* Experience & Compensation Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiLayers /> Experience & Compensation</h3>
                            <div className="section-grid multi-col">
                                <DisplayField label="Experience (Min - Max)" value={formData.experience} />
                                <DisplayField label="Approx. CTC Range" value={formData.ctcRange} />
                                <DisplayTextarea label="Any Specific Information" value={formData.specificInfo} />
                            </div>
                        </div>

                        {/* Hiring TAT Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiClock /> Turnaround time in detail, please tick required hiring TAT for the request</h3>
                            <p className="form-display-text">{formData.hiringTAT || 'N/A'}</p>
                        </div>

                        {/* Approvals Section - Conditionally Rendered */}
                        {/* <div className="form-section">
                            <h3 className="section-title"><FaUserCheck /> Approvals</h3>
                            <div className="section-grid multi-col">
                                {formData.requestorSign ? (
                                    <div>
                                        <label className="form-label">Requestor Sign & Date</label>
                                        <img src={`${API_URL}/${formData.requestorSign}`} alt="Requestor Sign" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }} />
                                        <p style={{padding:'5%',fontSize:'13px'}}>{new Date(formData.created_at).toISOString().split('T')[0]}</p>
                                    </div>)
                                    : <DisplayField label="Requestor Sign & Date" value={'Not provided.'} />
                                }
                                {formData.directorSign && formData.directorstatus == "Approve" ? (
                                    <div>
                                        <label className="form-label">Director Sign</label>
                                        <img src={DirectorImage} alt="Director Sign" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }} />
                                        <p style={{padding:'5%',fontSize:'13px'}}>{new Date(formData.created_at).toISOString().split('T')[0]}</p>
                                    </div>
                                )

                                    : <DisplayField label="Director Sign" value={'Not provided.'} />}

                            </div>
                        </div> */}


                        {/* HR Use Only Section - Conditionally Rendered test */}
                        <div className="form-section">
                            <h3 className="section-title"><FiEdit3 /> HR Use Only</h3>
                            <div className="section-grid multi-col">
                                <DisplayField label="MRF Number" value={formData.mrfNumber} />
                                <DisplayField label="TAT Agreed (in days)" value={formData.tatAgreed} />
                                <DisplayField label="Phase of Delivery for bulk hiring" value={formData.deliveryPhase} />
                                <DisplayField label="HR - Head Review" value={formData.hrReview} />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title"><FaUserCheck /> Director Status</h3>
                            <div className="section-grid multi-col">
                                <DisplayField label="Director Status Name" value={formData.directorstatus == 'Pending' ? "-" : (formData.directorstatus === 'Approve' ? 'Approved' : formData.directorstatus)} />
                            </div>
                            {formData.directorstatus === 'Raise Query' ? (
                                <div style={{ marginTop: '1rem' }}>
                                    <DisplayTextarea label="Director Query" value={formData.query_name_director} />
                                </div>
                            ) : (
                                <>
                                    {
                                        (formData.directorstatus !== "Raise Query" && formData.directorstatus !== "FH Replied") && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <DisplayTextarea label="Director Comments" value={formData.director_comments} />
                                            </div>
                                        )
                                    }
                                </>
                            )}
                            {formData.directorstatus === 'FH Replied' && (
                                <div style={{ marginTop: '1rem' }}>
                                    <DisplayTextarea label="Director Query" value={formData.query_name_director} />
                                    <DisplayTextarea label="Director Query Answer" value={formData.Director_Query_Answer} />
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3 className="section-title"><FaUserCheck /> HR Status</h3>
                            <div className="section-grid multi-col">
                                <DisplayField label="Status Name" value={formData.hrstatus == 'Pending' ? "-" : (formData.hrstatus === 'HR Approve' ? 'HR Approved' : formData.hrstatus)} />
                            </div>
                            {formData.hrstatus === 'Raise Query' ? (
                                <div style={{ marginTop: '1rem' }}>
                                    <DisplayTextarea label="HR Query" value={formData.query_name_hr} />
                                </div>
                            ) : (
                                <>
                                    {
                                        (formData.hrstatus !== "Raise Query" && formData.hrstatus !== "FH Replied") && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <DisplayTextarea label="HR Comments" value={formData.hr_comments} />
                                            </div>
                                        )
                                    }</>
                            )}
                            {formData.hrstatus === 'FH Replied' && (
                                <div style={{ marginTop: '1rem' }}>
                                    <DisplayTextarea label="HR Query" value={formData.query_name_hr} />
                                    <DisplayTextarea label="FH Answer" value={formData.HR_Query_Answer} />
                                </div>
                            )}
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

export default ManpowerRequisitionView;