import React, { useState, useEffect, use } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { FiUser, FiBriefcase, FiLayers, FiFileText, FiEdit3, FiClock, FiFile, FiX } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import "./Add_Form.css";
import { Select, MenuItem, FormControl, Button, Snackbar, Alert as MuiAlert, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, DialogContentText, Backdrop, CircularProgress } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";
import { useParams, useNavigate } from "react-router-dom";
import { fetchManpowerRequisitionById, updateManpowerRequisition, updateManpowerStatus, addQueryForm, fetchDepartmentsManagerId, fetchManagerList } from '../redux/cases/manpowerrequisitionSlice';
import { useDispatch, useSelector } from 'react-redux';
import swal from "sweetalert2";
import DirectorImage from "../assets/images/directorSign.png";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion, AnimatePresence } from 'framer-motion';

const ManpowerRequisitionEdit = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useSelector((state) => state.auth);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        department: "",
        depart_id: "",
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
        created_at: "",
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
    const [manpowerId, setManpowerId] = useState(null);
    const [manpowerStatus, setManpowerStatus] = useState(null);
    const [isDraft, setIsDraft] = useState(false);
    const [isRaiseQueryOpen, setIsRaiseQueryOpen] = useState(false);
    const [queryText, setQueryText] = useState("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    const { selectedRequisition, departments } = useSelector((state) => state.manpowerRequisition);

    useEffect(() => {
        dispatch(fetchManpowerRequisitionById(id));
        if (user?.emp_id) {
            dispatch(fetchDepartmentsManagerId(user.emp_id));
        }
    }, [dispatch, id, user?.emp_id]);

    useEffect(() => {
        if (selectedRequisition) {
            setManpowerStatus(selectedRequisition.status);
            setManpowerId(selectedRequisition.id);
            setIsDraft(selectedRequisition.status === "Draft");
            setQueryText(selectedRequisition.query_name || "");

            let tatValue = "";
            if (selectedRequisition.hiring_tat_fastag === 1) tatValue = "fastag";
            else if (selectedRequisition.hiring_tat_normal_cat1 === 1) tatValue = "normalCat1";
            else if (selectedRequisition.hiring_tat_normal_cat2 === 1) tatValue = "normalCat2";

            setFormData({
                id: selectedRequisition.id || "",
                department: selectedRequisition.department || "",
                depart_id: selectedRequisition.depart_id || "",
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
                specificInfo: selectedRequisition.specific_info || "",
                hiringTAT: tatValue,
                requestorSign: selectedRequisition.requestor_sign || null,
                directorSign: selectedRequisition.director_sign || null,
                mrfNumber: selectedRequisition.mrf_number || "",
                tatAgreed: selectedRequisition.tat_agreed || "",
                hrReview: selectedRequisition.hr_review || "",
                deliveryPhase: selectedRequisition.delivery_phase || "",
                hrstatus: selectedRequisition.hr_status || "",
                directorstatus: selectedRequisition.director_status || "",
                query_name_hr: selectedRequisition.query_name_hr || "",
                query_name_director: selectedRequisition.query_name_director || "",
                hr_comments: selectedRequisition.hr_comments || "",
                director_comments: selectedRequisition.director_comments || "",
                status: selectedRequisition.status || "",
                created_at : selectedRequisition.created_at || "",
            });
        }
    }, [selectedRequisition]);

    const validateField = (name, value) => {
        const newErrors = { ...errors };
        const isFileValid = (file) => {
            if (!file) return false;
            if (typeof file === 'string') return true;
            return file instanceof File && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
        };

        switch (name) {
            case 'department':
                if (!value) newErrors.department = 'Department is required.';
                else delete newErrors.department;
                break;
            case 'employmentStatus':
                if (!value) newErrors.employmentStatus = 'Status of Employment is required.';
                else delete newErrors.employmentStatus;
                break;
            case 'designation':
                if (!value) newErrors.designation = 'Proposed Designation is required.';
                else delete newErrors.designation;
                break;
            case 'numResources':
                if (!value || value < 1) newErrors.numResources = 'At least one resource is required.';
                else delete newErrors.numResources;
                break;
            case 'projectName':
                if (formData.requirementType && !value && ["Ramp up", "New Requirement", "Replacement"].includes(formData.requirementType)) {
                    newErrors.projectName = 'Project Name is required for this requirement type.';
                } else {
                    delete newErrors.projectName;
                }
                break;
            case 'projectionPlan':
                if (formData.requirementType === "Ramp up" && !value) {
                    newErrors.projectionPlan = 'Projection Plan is required for Ramp up.';
                } else {
                    delete newErrors.projectionPlan;
                }
                break;
            case 'rampUpFile':
                if (formData.requirementType === "Ramp up" && !isFileValid(value)) {
                    newErrors.rampUpFile = 'A valid image file (JPG, PNG) is required for Ramp up.';
                } else {
                    delete newErrors.rampUpFile;
                }
                break;
            case 'rampUpReason':
                if (formData.requirementType === "New Requirement" && !value) {
                    newErrors.rampUpReason = 'Reason is required for New Requirement.';
                } else {
                    delete newErrors.rampUpReason;
                }
                break;
            case 'replacementDetail':
                if (formData.requirementType === "Replacement" && !value) {
                    newErrors.replacementDetail = 'Replacement details are required.';
                } else {
                    delete newErrors.replacementDetail;
                }
                break;
            case 'jobDescription':
                if (!value) newErrors.jobDescription = 'Job Description is required.';
                else delete newErrors.jobDescription;
                break;
            case 'education':
                if (!value) newErrors.education = 'Educational Qualification is required.';
                else delete newErrors.education;
                break;
            case 'experience':
                if (!value) newErrors.experience = 'Experience is required.';
                else delete newErrors.experience;
                break;
            case 'ctcRange':
                if (!value) newErrors.ctcRange = 'Approx. CTC Range is required.';
                else delete newErrors.ctcRange;
                break;
            case 'hiringTAT':
                if (!value) newErrors.hiringTAT = 'A Hiring TAT option must be selected.';
                else delete newErrors.hiringTAT;
                break;
            case 'requestorSign':
                if ((isSeniorManager || isHr) && !isFileValid(value)) {
                    newErrors.requestorSign = 'A valid Requestor Sign image (JPG, PNG) is required.';
                } else {
                    delete newErrors.requestorSign;
                }
                break;
            case 'directorSign':
                if ((isDirector || isHr) && !isFileValid(value)) {
                    newErrors.directorSign = 'A valid Director Sign image (JPG, PNG) is required.';
                } else {
                    delete newErrors.directorSign;
                }
                break;
            case 'tatAgreed':
                if (isHr && !value.trim()) newErrors.tatAgreed = 'TAT Agreed is required for HR.';
                else delete newErrors.tatAgreed;
                break;
            case 'deliveryPhase':
                if (isHr && !value.trim()) newErrors.deliveryPhase = 'Phase of Delivery is required for HR.';
                else delete newErrors.deliveryPhase;
                break;
            case 'hrReview':
                if (isHr && !value.trim()) newErrors.hrReview = 'HR Review is required for HR.';
                else delete newErrors.hrReview;
                break;
            case 'hr_comments':
                if (isHr && !value) newErrors.hr_comments = 'HR Comments are required for HR.';
                else delete newErrors.hr_comments;
                break;
            case 'director_comments':
                if (isDirector && !value) newErrors.director_comments = 'Director Comments are required for HR.';
                else delete newErrors.director_comments;
                break;
            default:
                break;
        }
        setErrors(newErrors);
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? parseInt(value, 10) : value;

        if (name === 'depart_id') {
            const selectedDept = departments.find(dept => dept.id.toString() === value);
            setFormData(prev => ({
                ...prev,
                depart_id: value,
                department: selectedDept ? selectedDept.depart : ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: newValue }));
        }
        validateField(name, newValue);
    };

    const handleFileChange = (fieldName, file) => {
        setFormData(prev => ({ ...prev, [fieldName]: file }));
        validateField(fieldName, file);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const getFieldClassName = (fieldName) => {
        return errors[fieldName] && touched[fieldName] ? 'invalid-field' : '';
    };

    const renderError = (fieldName) => {
        return errors[fieldName] && touched[fieldName] ? (
            <div className="error-message">{errors[fieldName]}</div>
        ) : null;
    };

    const removeFile = (fieldName) => {
        setFormData(prev => ({ ...prev, [fieldName]: null }));
        validateField(fieldName, null);
    };

    const onSizeError = (file) => {
        setNotification({ open: true, message: `File "${file.name}" is too large. Please upload a file under 2MB.`, severity: 'error' });
    };

    const fileTypes = ["JPEG", "PNG", "JPG"];

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') return;
        setNotification({ ...notification, open: false });
    };

    const handleDownload = async (filePath) => {
        if (!filePath || typeof filePath !== 'string') {
            setNotification({ open: true, message: 'File path is invalid.', severity: 'error' });
            return;
        }
        const correctedFilePath = filePath.replace(/\\/g, '/');
        try {
            const response = await fetch(`${API_URL}/${correctedFilePath}`);
            if (!response.ok) throw new Error(`File not found. Status: ${response.status}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filePath.split(/[\\/]/).pop();
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            setNotification({ open: true, message: 'Download failed.', severity: 'error' });
        }
    };

    const handleStatusChange = (event, manpowerId) => {
        const newStatus = event.target.value;
        setManpowerStatus(newStatus);
        setManpowerId(manpowerId);
        setFormData(prev => ({ ...prev, status: newStatus }));

        if (!newStatus) {
            setNotification({ open: true, message: 'Status cannot be empty.', severity: 'error' });
            return;
        }

        if (newStatus === "Raise Query") {
            setIsRaiseQueryOpen(true);
            return;
        }

        if (isHr) setFormData(prev => ({ ...prev, hr_status: newStatus }));
        if (isDirector) setFormData(prev => ({ ...prev, director_status: newStatus }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const allTouched = {};
        console.log(formData, "formData");
        Object.keys(formData).forEach(key => { allTouched[key] = true; });
        setTouched(allTouched);

        if (isDirector && formData.status == "Pending") {
            setNotification({ open: true, message: 'Please select a status before updating.', severity: 'error' });
            return;
        }

        if (isHr && formData.status == "Approve") {
            setNotification({ open: true, message: 'Please select a status before updating.', severity: 'error' });
            return;
        }
         if (isHr && formData.status == "Pending") {
            setNotification({ open: true, message: 'Please select a status before updating.', severity: 'error' });
            return;
        }

        if (isHr && formData.status === 'HR Approve') {
            const hrFieldsToValidate = {
                // tatAgreed: 'TAT Agreed is required for HR Approval.',
                // deliveryPhase: 'Phase of Delivery is required for HR Approval.',
                // hrReview: 'HR - Head Review is required for HR Approval.',
                hr_comments: 'HR Comments are required for HR Approval.'
            };
            let hasHrErrors = false;
            Object.entries(hrFieldsToValidate).forEach(([field, message]) => {
                if (!formData[field]) {
                    errors[field] = message;
                    hasHrErrors = true;
                }
            });

            if (hasHrErrors) {
                setErrors({ ...errors });
                setNotification({ open: true, message: 'Please fill all required HR fields for approval.', severity: 'error' });
                return;
            }
        }

        if (isHr && ['Reject'].includes(formData.status)) {
            const hrFieldsToValidate = {
                hr_comments: 'HR Comments are required for HR Status.'
            };
            let hasHrErrors = false;
            Object.entries(hrFieldsToValidate).forEach(([field, message]) => {
                if (!formData[field]) {
                    errors[field] = message;
                    hasHrErrors = true;
                }
            });
        }

        if (isDirector && ['Approve', 'Reject'].includes(formData.status)) {
            const directorFieldsToValidate = {
                director_comments: 'Director Comments are required for Director Status.'
            };
            let hasDirectorErrors = false;
            Object.entries(directorFieldsToValidate).forEach(([field, message]) => {
                if (!formData[field]) {
                    errors[field] = message;
                    hasDirectorErrors = true;
                }
            });
        }


        const tempErrors = {};
        Object.keys(formData).forEach(name => {
            validateField(name, formData[name]);
            if (errors[name]) tempErrors[name] = errors[name];
        });

        if (Object.keys(errors).some(key => errors[key])) {
            setNotification({ open: true, message: 'Please fix validation errors.', severity: 'error' });
            return;
        }

        setIsConfirmOpen(true);
    };

    const handleConfirmUpdate = async () => {
        setIsConfirmOpen(false);
        setIsUpdating(true);

        // If the form is a draft, manually set the status to "Pending" upon submission.
        if (isDraft) {
            formData.status = 'Pending';
            setManpowerStatus('Pending');
        }

        const data = new FormData();
        for (const key in formData) {
            if (key === "hiringTAT" && formData.hiringTAT) {
                data.append("hiring_tat_fastag", formData.hiringTAT === "fastag");
                data.append("hiring_tat_normal_cat1", formData.hiringTAT === "normalCat1");
                data.append("hiring_tat_normal_cat2", formData.hiringTAT === "normalCat2");
            } else if (key !== "hiringTAT" && formData[key] !== null && formData[key] !== "") {
                data.append(key, formData[key]);
            }
        }

        try {
            await dispatch(updateManpowerRequisition({ id, data })).unwrap();

            if (manpowerStatus) {
                await dispatch(updateManpowerStatus({
                    manpowerId,
                    newStatus: manpowerStatus == "Draft" ? "Pending" : manpowerStatus,
                    hr_comments: formData.hr_comments,
                    director_comments: formData.director_comments,
                    data : selectedRequisition
                })).unwrap();
            }

            if (manpowerStatus === "Raise Query" && queryText) {
                const queryAddData = {
                    query_manpower_requisition_pid: manpowerId,
                    query_name: queryText,
                    query_created_by: user?.emp_id || null,
                    query_created_date: new Date().toISOString().split('T')[0],
                    query_created_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                    query_is_delete: 'Active',
                };
                await dispatch(addQueryForm(queryAddData)).unwrap();
            }

            setIsUpdating(false);
            setIsSuccessOpen(true);

        } catch (error) {
            setIsUpdating(false);
            swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to update Manpower Requisition.',
                icon: 'error',
                confirmButtonColor: theme.palette.error.main,
                confirmButtonText: 'OK'
            });
            setNotification({ open: true, message: `Update failed: ${error.message || "Please try again."}`, severity: "error" });
        }
    };

    const handleCloseConfirm = () => setIsConfirmOpen(false);
    const handleCloseSuccess = () => {
        setIsSuccessOpen(false);
        navigate('/mrf-list');
    };

    const DisplayField = ({ label, value }) => (
        <div>
            <label className="form-label">{label}</label>
            <p className="form-display-text">{value || 'N/A'}</p>
        </div>
    );

    const handleQueryTextChange = (e) => {
        const newQueryText = e.target.value;
        setQueryText(newQueryText);
        setFormData(prev => ({ ...prev, query_name: newQueryText }));
    };

    return (
        <div className="page-wrapper">
            <div className="form-panel">
                <div className="form-header">
                    <h1 className="info-title">Edit Manpower Requisition</h1>
                    <p className="info-subtitle">
                        Please update the details below. Ensure all fields are accurate to streamline the approval process.
                    </p>
                </div>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isUpdating}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Requirement Details Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiBriefcase /> Requirement Details</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Department</label>
                                    <select name="depart_id" disabled
                                        className={`form-select ${getFieldClassName('department')}`}
                                        value={formData.depart_id}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                    >
                                        <option value="">Select Department</option>
                                        {departments?.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.depart}
                                            </option>
                                        ))}
                                    </select>
                                    {renderError('department')}
                                </div>
                                <div>
                                    <label className="form-label">Status of Employment</label>
                                    <select
                                        name="employmentStatus"
                                        className={`form-select ${getFieldClassName('employmentStatus')}`}
                                        value={formData.employmentStatus}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Permanent">Permanent</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelancer">Freelancer</option>
                                    </select>
                                    {renderError('employmentStatus')}
                                </div>
                                <div>
                                    <label className="form-label">Proposed Designation</label>
                                    <input name="designation" className={`form-input ${getFieldClassName('designation')}`} value={formData.designation} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('designation')}
                                </div>
                                <div>
                                    <label className="form-label">No. of Resources</label>
                                    <input name="numResources" className={`form-input ${getFieldClassName('numResources')}`} type="number" value={formData.numResources} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('numResources')}
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Requirement Type</label>
                                    <select
                                        name="requirementType"
                                        className={`form-select ${getFieldClassName('requirementType')}`}
                                        value={formData.requirementType}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                    >
                                        <option value="Ramp up">Ramp up</option>
                                        <option value="New Requirement">New Requirement</option>
                                        <option value="Replacement">Replacement</option>
                                    </select>
                                </div>

                                {formData.requirementType === "Ramp up" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input name="projectName" className={`form-input ${getFieldClassName('projectName')}`} value={formData.projectName} onChange={handleInputChange} onBlur={handleBlur} />
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Projection Plan<span className="required-star">*</span></label>
                                            <input
                                                type="text"
                                                name="projectionPlan"
                                                value={formData.projectionPlan}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                className={`form-input ${getFieldClassName('projectionPlan')}`}
                                                placeholder="Enter projection plan"
                                            />
                                            {renderError('projectionPlan')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Upload File</label>
                                            <FileUploader
                                                classes={`file-uploader-custom ${getFieldClassName('rampUpFile')}`}
                                                maxSize={2}
                                                onSizeError={onSizeError}
                                                handleChange={(file) => handleFileChange("rampUpFile", file)}
                                                name="rampUpFile"
                                                types={fileTypes}
                                            >
                                                <div className="upload-area">
                                                    <div className="upload-instruction">
                                                        <span>Drag & Drop or Click to Upload</span>
                                                        <span className="file-types">(Accepted: JPEG, PNG, JPG)</span>
                                                    </div>
                                                </div>
                                            </FileUploader>
                                            {formData.rampUpFile && (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    {typeof formData.rampUpFile === 'string' ? (
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleDownload(formData.rampUpFile); }} className="file-name">{formData.rampUpFile.split(/[\\/]/).pop()}</a>
                                                    ) : (
                                                        <span className="file-name">{formData.rampUpFile.name}</span>
                                                    )}
                                                    <button type="button" onClick={() => removeFile("rampUpFile")} className="remove-file-btn"><FiX /></button>
                                                </div>
                                            )}
                                            {renderError('rampUpFile')}
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "New Requirement" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input name="projectName" className={`form-input ${getFieldClassName('projectName')}`} value={formData.projectName} onChange={handleInputChange} onBlur={handleBlur} />
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Reason for Additional Resources<span className="required-star">*</span></label>
                                            <input name="rampUpReason" className={`form-input ${getFieldClassName('rampUpReason')}`} value={formData.rampUpReason} onChange={handleInputChange} onBlur={handleBlur} />
                                            {renderError('rampUpReason')}
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "Replacement" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input name="projectName" className={`form-input ${getFieldClassName('projectName')}`} value={formData.projectName} onChange={handleInputChange} onBlur={handleBlur} />
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Resigned Employee (Name + ID)<span className="required-star">*</span></label>
                                            <input name="replacementDetail" className={`form-input ${getFieldClassName('replacementDetail')}`} value={formData.replacementDetail} onChange={handleInputChange} onBlur={handleBlur} />
                                            {renderError('replacementDetail')}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Candidate Profile Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiUser /> Candidate Profile</h3>
                            <div className="section-grid">
                                <div className="full-width">
                                    <label className="form-label">Job Description<span className="required-star">*</span></label>
                                    <textarea name="jobDescription" className={`form-textarea ${getFieldClassName('jobDescription')}`} rows="4" value={formData.jobDescription} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('jobDescription')}
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Educational Qualification<span className="required-star">*</span></label>
                                    <input name="education" className={`form-input ${getFieldClassName('education')}`} value={formData.education} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('education')}
                                </div>
                            </div>
                        </div>

                        {/* Experience & Compensation Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiLayers /> Experience & Compensation</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Experience (Min - Max)<span className="required-star">*</span></label>
                                    <input name="experience" className={`form-input ${getFieldClassName('experience')}`} value={formData.experience} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('experience')}
                                </div>
                                <div>
                                    <label className="form-label">Approx. CTC Range<span className="required-star">*</span></label>
                                    <input name="ctcRange" className={`form-input ${getFieldClassName('ctcRange')}`} value={formData.ctcRange} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('ctcRange')}
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Any Specific Information</label>
                                    <textarea name="specificInfo" className="form-textarea" rows="2" value={formData.specificInfo} onChange={handleInputChange} onBlur={handleBlur} />
                                </div>
                            </div>
                        </div>

                        {/* Hiring TAT Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiClock /> Turnaround time in detail, please tick required hiring TAT for the request</h3>
                            <div className={`checkbox-group ${getFieldClassName('hiringTAT')}`}>
                                <label className="radio-label">
                                    <input type="radio" name="hiringTAT" value="fastag" checked={formData.hiringTAT === 'fastag'} onChange={handleInputChange} />
                                    <span className="custom-radio"></span>
                                    Fastag Hiring (60 Days)
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="hiringTAT" value="normalCat1" checked={formData.hiringTAT === 'normalCat1'} onChange={handleInputChange} />
                                    <span className="custom-radio"></span>
                                    Normal Hiring – Cat 1 (90 Days)
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="hiringTAT" value="normalCat2" checked={formData.hiringTAT === 'normalCat2'} onChange={handleInputChange} />
                                    <span className="custom-radio"></span>
                                    Normal Hiring – Cat 2 (120 Days)
                                </label>
                            </div>
                            {renderError('hiringTAT')}
                        </div>

                        {/* Approvals Section */}
                        {/* {(isSeniorManager || isDirector || isHr) && (
                            <div className="form-section">
                                <h3 className="section-title"><FaUserCheck /> Approvals</h3>
                                <div className="section-grid multi-col">
                                    {isSeniorManager && user.emp_id != "1722" && (
                                        <div>
                                            <label className="form-label">Requestor Sign & Date<span className="required-star">*</span></label>
                                            <FileUploader
                                                classes={`file-uploader-custom ${getFieldClassName('requestorSign')}`}
                                                maxSize={2}
                                                onSizeError={onSizeError}
                                                handleChange={(file) => handleFileChange("requestorSign", file)}
                                                name="requestorSign"
                                                types={fileTypes}
                                            >
                                                <div className="upload-area"><div className="upload-instruction"><span>Drag & Drop or Click to Upload</span><span className="file-types">(Accepted: JPEG, PNG, JPG)</span></div></div>
                                            </FileUploader>
                                            {formData.requestorSign && (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    {typeof formData.requestorSign === 'string' ? (
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleDownload(formData.requestorSign); }} className="file-name">{formData.requestorSign.split(/[\\/]/).pop()}</a>
                                                    ) : (
                                                        <span className="file-name">{formData.requestorSign.name}</span>
                                                    )}
                                                    <button type="button" onClick={() => removeFile("requestorSign")} className="remove-file-btn"><FiX /></button>
                                                </div>
                                            )}
                                            {renderError('requestorSign')}
                                        </div>
                                    )}


                                    {(isDirector || isHr) && (
                                        <>
                                            <div>
                                                {formData.requestorSign ? (
                                                    <div>
                                                        <label className="form-label">Requestor Sign & Date</label>
                                                        <img src={`${API_URL}/${formData.requestorSign}`} alt="Requestor Sign" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }} />
                                                         <p style={{padding:'5%',fontSize:'13px'}}>{new Date(formData?.created_at).toISOString().split('T')[0]}</p>
                                                    </div>)
                                                    : <DisplayField label="Requestor Sign & Date" value={'Not provided.'} />
                                                }

                                              
                                            </div>
                                            <div> 
                                                {formData.directorSign && formData.directorstatus == "Approve" ? (
                                                <div>
                                                    <label className="form-label">Director Sign</label>
                                                    <img src={DirectorImage} alt="Director Sign" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }} />
                                                </div>
                                                )

                                                : !isDirector && <div>
                                                    <label className="form-label" >Director Sign</label>
                                                    <p style={{paddingTop:'4%', fontSize:'13px'}}>Not provided.</p>
                                                </div>}

                                                {(isDirector && formData.status == "pending") &&<div>
                                                    <label className="form-label">Director Sign</label>
                                                    <img src={DirectorImage} alt="Director Sign" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }} />
                                                </div>}
                                            </div>

                                        </>)}
                                </div>
                            </div>
                        )} */}

                        {/* HR Use Only Section */}
                        {isHr && (
                            <div className="form-section">
                                <h3 className="section-title"><FiEdit3 /> HR Use Only</h3>
                                <div className="section-grid multi-col">
                                    <div>
                                        <label className="form-label">MRF Number</label>
                                        <input name="mrfNumber" className={`form-input`} value={formData.mrfNumber} readOnly disabled />
                                        <small style={{ color: '#555', marginTop: '4px' }}>This field is auto-generated.</small>

                                    </div>
                                    <div>
                                        <label className="form-label">TAT Agreed (in days)<span className="required-star"></span></label>
                                        <input name="tatAgreed" className={`form-input ${getFieldClassName('tatAgreed')}`} value={formData.tatAgreed} onChange={handleInputChange} onBlur={handleBlur} />
                                        {renderError('tatAgreed')}
                                    </div>
                                    <div>
                                        <label className="form-label">Phase of Delivery for bulk hiring<span className="required-star"></span></label>
                                        <input name="deliveryPhase" className={`form-input ${getFieldClassName('deliveryPhase')}`} value={formData.deliveryPhase} onChange={handleInputChange} onBlur={handleBlur} />
                                        {renderError('deliveryPhase')}
                                    </div>
                                    <div>
                                        <label className="form-label">HR - Head Review<span className="required-star"></span></label>
                                        <input name="hrReview" className={`form-input ${getFieldClassName('hrReview')}`} value={formData.hrReview} onChange={handleInputChange} onBlur={handleBlur} />
                                        {renderError('hrReview')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Updation Section */}
                        {(isDirector || isHr) && !isDraft && (
                            <div className="form-section">
                                <h3 className="section-title"><FaUserCheck /> Status Updation</h3>
                                <div className="section-grid multi-col">
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={formData.status}
                                            displayEmpty
                                            onChange={(e) => handleStatusChange(e, formData.id)}
                                            size="small"
                                            sx={{ fontSize: "0.85rem", height: 36, borderRadius: '6px' }}
                                        >

                                            {isDirector && !isHr && [
                                                <MenuItem value="Pending">Select the Status</MenuItem>,
                                                <MenuItem key="Approve" value="Approve">Approve</MenuItem>,
                                                <MenuItem key="Reject" value="Reject">Reject</MenuItem>,
                                                <MenuItem key="Raise Query" value="Raise Query">Raise Query</MenuItem>,
                                                <MenuItem key="On Hold" value="On Hold">On Hold</MenuItem>
                                            ]}
                                            {isHr && [
                                                //  <MenuItem value="Pending">Select the Status</MenuItem>,
                                                <MenuItem value="Approve">Select the Status</MenuItem>,
                                                <MenuItem key="HR Approve" value="HR Approve">HR Approve</MenuItem>,
                                                <MenuItem key="Reject" value="Reject">Reject</MenuItem>,
                                                <MenuItem key="Raise Query" value="Raise Query">Raise Query</MenuItem>,
                                                <MenuItem key="On Hold" value="On Hold">On Hold</MenuItem>
                                            ]}
                                        </Select>
                                        {renderError('status')}
                                    </FormControl>
                                </div>

                                {formData.status === "Raise Query" && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Enter your query here"
                                            value={queryText}
                                            onChange={handleQueryTextChange}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </div>
                                )}
                                {formData.status && formData.status !== "" && (
                                    <>
                                        {(isDirector && manpowerStatus != "Raise Query") && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <label className="form-label">Director Comments<span className="required-star">*</span></label>
                                                <TextField fullWidth multiline rows={3} label="Enter your comments here" name="director_comments" value={formData.director_comments || ''} onChange={handleInputChange} variant="outlined" size="small" />
                                                {renderError('director_comments')}
                                            </div>
                                        )}
                                        {(isHr && manpowerStatus != "Raise Query") && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <label className="form-label">HR Comments<span className="required-star">*</span></label>
                                                <TextField fullWidth multiline rows={3} label="Enter your comments here" name="hr_comments" value={formData.hr_comments || ''} onChange={handleInputChange} variant="outlined" size="small" />
                                                {renderError('hr_comments')}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <Button type="submit" variant="contained" color="primary" disabled={isSeniorManager && !isDraft && formData.status === 'Draft'}>
                            {isSeniorManager && isDraft ? 'Submit' : 'Update'}
                        </Button>
                    </div>
                </form>
            </div>
            <Dialog
                open={isConfirmOpen}
                onClose={handleCloseConfirm}
            >
                <DialogTitle>{"Confirm Update"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to update this Manpower Requisition?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm}>Cancel</Button>
                    <Button onClick={handleConfirmUpdate} color="primary" autoFocus>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ mt: '64px' }}>
                <MuiAlert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </MuiAlert>
            </Snackbar>

            <AnimatePresence>
                {isConfirmOpen && (
                    <Dialog
                        open={isConfirmOpen}
                        onClose={handleCloseConfirm}
                        PaperProps={{
                            component: motion.div,
                            variants: {
                                hidden: { opacity: 0, scale: 0.8 },
                                visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
                                exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
                            },
                            initial: "hidden",
                            animate: "visible",
                            exit: "exit",
                            style: { borderRadius: '16px', padding: '1.5rem' }
                        }}
                    >
                        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                            <HelpOutlineIcon color="primary" sx={{ fontSize: '3rem', mb: 1 }} />
                            <br />
                            Confirm Update
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body1" textAlign="center">
                                Are you sure you want to update this Manpower Requisition?
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                            <Button onClick={handleCloseConfirm} variant="outlined" color="secondary">Cancel</Button>
                            <Button onClick={handleConfirmUpdate} variant="contained" color="primary" autoFocus>
                                Update
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Super Cool Success Dialog */}
            <AnimatePresence>
                {isSuccessOpen && (
                    <Dialog
                        open={isSuccessOpen}
                        onClose={handleCloseSuccess}
                        PaperProps={{
                            component: motion.div,
                            variants: {
                                hidden: { y: "-100vh", opacity: 0 },
                                visible: { y: "0", opacity: 1, transition: { type: "spring", stiffness: 120, damping: 15 } },
                                exit: { y: "100vh", opacity: 0, transition: { ease: "anticipate" } }
                            },
                            initial: "hidden",
                            animate: "visible",
                            exit: "exit",
                            sx: { borderRadius: '20px', padding: '2rem', textAlign: 'center', backgroundColor: '#F3FAF8' }
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, transition: { delay: 0.2, type: 'spring', stiffness: 260, damping: 20 } }}
                        >
                            <CheckCircleOutlineIcon sx={{ fontSize: '5rem', color: 'success.main' }} />
                        </motion.div>
                        <DialogTitle className="modern-swal-title" sx={{ p: '1rem 0 0.5rem' }}>
                            Updated Successfully!
                        </DialogTitle>
                        <DialogContent>
                            <Typography className="modern-swal-text">
                                The Manpower Requisition has been updated.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center', p: '1rem 0 0' }}>
                            <Button onClick={handleCloseSuccess} variant="contained" color="primary" size="large" sx={{ borderRadius: '50px', px: 4, fontWeight: 'bold' }}>OK</Button>
                        </DialogActions>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManpowerRequisitionEdit;
