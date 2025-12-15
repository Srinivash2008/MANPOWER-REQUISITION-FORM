import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { FiUser, FiBriefcase, FiLayers, FiFileText, FiEdit3, FiClock, FiFile, FiX } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import "./Add_Form.css";
import { Select, MenuItem, FormControl, Button, Snackbar, Alert as MuiAlert, TextField  } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchManpowerRequisition, fetchManpowerRequisitionById, updateManpowerRequisition, updateManpowerStatus,optimisticUpdateManpowerStatus, revertManpowerStatus, addQueryForm } from '../redux/cases/manpowerrequisitionSlice';
import { useDispatch, useSelector } from 'react-redux';
import swal from "sweetalert2";
import { FaCommentDots } from 'react-icons/fa';

const ManpowerRequisitionView = () => {
    const dispatch  = useDispatch();
    const theme = useTheme();
    const { id } = useParams(); 
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const isEditMode = location.pathname.includes('manpower_requisition_edit');

    // --- Role-based visibility flags ---
    const isHr = user?.emp_id === "12345";
    const isDirector = user?.emp_dept === "Director" && !isHr;
    const isSeniorManager = user?.emp_pos === "Senior Manager" && !isHr && !isDirector;

    const [formData, setFormData] = useState({
        id: "",
        department: "",
        employmentStatus: "",
        designation: "",
        numResources: 1,
        requirementType: "",
        projectName: "",
        replacementDetail: "",
        rampUpFile: null,
        rampUpReason: "",
        jobDescription: "",
        education: "",
        experience: "",
        ctcRange: "",
        specificInfo: "",
        hiringTAT: { fastag: false, normalCat1: false, normalCat2: false }, //NOSONAR
        requestorSign: null,
        directorSign: null,
        mrfNumber: "",
        tatAgreed: "",
        hrReview: "",
        deliveryPhase: "",
        status: "",
        query_name: "",
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const manpowerRequisitionList = useSelector((state)=> state.manpowerRequisition.data);
    const status = useSelector((state) => state.manpowerRequisition.status);
    const [manpowerId, setManpowerId] = useState(null);
    const [manpowerStatus, setManpowerStatus] = useState(null);
    const [isRaiseQueryOpen, setIsRaiseQueryOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchManpowerRequisitionById(id));
    }, [dispatch, id]);

    useEffect(() => {
        dispatch(fetchManpowerRequisition());
    }, [dispatch]);

    const selectedRequisition = useSelector((state) => state.manpowerRequisition.selectedRequisition);

    useEffect(() => {
        if (selectedRequisition) {
            setFormData({
                id: selectedRequisition.id || "",
                department: selectedRequisition.department || "",
                employmentStatus: selectedRequisition.employment_status || "",
                designation: selectedRequisition.designation || "",
                numResources: selectedRequisition.num_resources || 1,
                requirementType: selectedRequisition.requirement_type || "",
                projectName: selectedRequisition.project_name || "",
                replacementDetail: selectedRequisition.replacement_detail || "",
                rampUpFile: selectedRequisition.ramp_up_file || null,
                rampUpReason: selectedRequisition.ramp_up_reason || "",
                jobDescription: selectedRequisition.job_description || "",
                education: selectedRequisition.education || "",
                experience: selectedRequisition.experience || "",
                ctcRange: selectedRequisition.ctc_range || "",
                specificInfo: selectedRequisition.specific_info || "",
                hiringTAT: {
                    fastag: !!selectedRequisition.hiring_tat_fastag,
                    normalCat1: !!selectedRequisition.hiring_tat_normal_cat1,
                    normalCat2: !!selectedRequisition.hiring_tat_normal_cat2,
                },
                requestorSign: selectedRequisition.requestor_sign || null,
                directorSign: selectedRequisition.director_sign || null,
                mrfNumber: selectedRequisition.mrf_number || "",
                tatAgreed: selectedRequisition.tat_agreed || "",
                hrReview: selectedRequisition.hr_review || "",
                deliveryPhase: selectedRequisition.delivery_phase || "",
                status: selectedRequisition.status || "",
                query_name: selectedRequisition.query_name || "",
            });
        }
    }, [selectedRequisition]);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // --- Validation Functions (adapted from Add_Form.jsx) ---
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        // Helper to check if a file is valid (either an existing string path or a new valid File object)
        const isFileValid = (file) => {
            if (!file) return false;
            if (typeof file === 'string') return true; // Already uploaded file path
            if (file instanceof File && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) return true;
            return false;
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
                if (formData.requirementType && !value &&
                    (formData.requirementType === "Ramp up" ||
                     formData.requirementType === "New Requirement" ||
                     formData.requirementType === "Replacement")) {
                    newErrors.projectName = 'Project Name is required for this requirement type.';
                } else {
                    delete newErrors.projectName;
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
                if (!Object.values(value).some(option => option)) {
                    newErrors.hiringTAT = 'At least one Hiring TAT option must be selected.';
                } else {
                    delete newErrors.hiringTAT;
                }
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
            case 'mrfNumber':
                if (isHr && !value) newErrors.mrfNumber = 'MRF Number is required for HR.';
                else delete newErrors.mrfNumber;
                break;
            // case 'tatAgreed':
            //     if (isHr && !value) newErrors.tatAgreed = 'TAT Agreed is required for HR.';
            //     else delete newErrors.tatAgreed;
            //     break;
            // case 'deliveryPhase':
            //     if (isHr && !value) newErrors.deliveryPhase = 'Phase of Delivery is required for HR.';
            //     else delete newErrors.deliveryPhase;
            //     break;
            // case 'hrReview':
            //     if (isHr && !value) newErrors.hrReview = 'HR Review is required for HR.';
            //     else delete newErrors.hrReview;
            //     break;
            default:
                break;
        }
        setErrors(newErrors);
    };

    const validateForm = () => {
        // Trigger validation for all fields
        Object.keys(formData).forEach(name => {
            validateField(name, formData[name]);
        });

        // Re-validate and collect errors
        const tempErrors = {};
        Object.keys(formData).forEach(name => {
            const fieldErrors = { ...errors };
            validateField(name, formData[name]);
            if (errors[name]) {
                tempErrors[name] = errors[name];
            }
        });
        
        // A full re-validation pass to be sure
        const allTouched = {};
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
            validateField(key, formData[key]);
            if (errors[key]) newErrors[key] = errors[key];
        });
        
        // Manually re-running validateField to populate a fresh error object
        let freshErrors = {};
        for (const key in formData) {
            validateField(key, formData[key]);
            // Since validateField sets state, we need to build our own error object here
            // This is a bit of a workaround because of the async nature of setState
        }
        // The `errors` state will be updated by the last call to validateField.
        // We return its validity.
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('hiringTAT.')) {
            const tatField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                hiringTAT: { ...prev.hiringTAT, [tatField]: checked }
            }));
            if (isEditMode) validateField('hiringTAT', { ...formData.hiringTAT, [tatField]: checked });
        } else {
            const newValue = type === 'number' ? parseInt(value, 10) : value;
            setFormData(prev => ({ ...prev, [name]: newValue }));
            if (isEditMode) validateField(name, newValue);
        }
    };

    const handleFileChange = (fieldName, file) => {
        setFormData(prev => ({ ...prev, [fieldName]: file }));
        if (isEditMode) validateField(fieldName, file);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        if (isEditMode) validateField(name, value);
    };

    const getFieldClassName = (fieldName) => {
        if (!isEditMode) return '';
        return errors[fieldName] && touched[fieldName] ? 'invalid-field' : '';
    };

    const renderError = (fieldName) => {
        if (!isEditMode) return null;
        return errors[fieldName] && touched[fieldName] ? (
            <div className="error-message">{errors[fieldName]}</div>
        ) : null;
    };


    const removeFile = (fieldName) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: null
        }));
        if (isEditMode) validateField(fieldName, null);
    };


    const onSizeError = (file) => {
        setNotification({
            open: true,
            message: `File "${file.name}" is too large. Please upload a file under 2MB.`,
            severity: 'error'
        });
    };

    const fileTypes = ["JPEG", "PNG", "JPG"];
    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched to show errors on first submit attempt
        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        // Re-run validation for all fields before submitting
        Object.keys(formData).forEach(name => validateField(name, formData[name]));

        // Check if there are any errors after validation
        if (Object.keys(errors).some(key => errors[key])) {
            return;
        }
        const data = new FormData();

        // Append all form fields to the FormData object
        for (const key in formData) {
            if (key === 'hiringTAT') {
                data.append('hiring_tat_fastag', formData.hiringTAT.fastag);
                data.append('hiring_tat_normal_cat1', formData.hiringTAT.normalCat1);
                data.append('hiring_tat_normal_cat2', formData.hiringTAT.normalCat2);
            } else if (formData[key] !== null && formData[key] !== "") {
                data.append(key, formData[key]);
            }
        }

        dispatch(updateManpowerRequisition({ id, data }))
            .unwrap()
            .then(() => {
                setNotification({ open: true, message: 'MRF updated successfully!', severity: 'success' });
                setTimeout(() => navigate('/mrf-list'), 2000);
            })
            .catch((error) => {
                setNotification({
                    open: true,
                    message: `Update failed: ${error.message || "Please try again."}`,
                    severity: 'error'
                });
            });
    };

    const handleDownload = async () => {
        let filePath = "";
    
        if (formData.rampUpFile) {
            filePath = formData.rampUpFile;
        } else if (formData.requestorSign) {
            filePath = formData.requestorSign;
        } else if (formData.directorSign) {
            filePath = formData.directorSign;
        } else {
            console.error("No file available to download.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${filePath}`);
            console.log("Download response:", response);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = filePath.split(/[\\/]/).pop(); // Extract file name
            a.click();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };    

    const manpowerArray = Array.isArray(manpowerRequisitionList) ? manpowerRequisitionList : [];

    const handleStatusChange = (event, manpowerId) => {
        
        const newStatus = event.target.value;
        const originalManpower = manpowerArray.find((M) => M.id === manpowerId);

        if (!originalManpower || newStatus === originalManpower.status) {
            return;
        }

        if (newStatus === "Raise Query") {
            setManpowerId(manpowerId);
            setManpowerStatus(newStatus);
            setIsRaiseQueryOpen(true);
            return;
        }

        swal.fire({
            title: "Are you sure?",
            text: `Change status from "${originalManpower.status}" to "${newStatus}"?`,
            icon: '',
            iconHtml: `<img src="/validation/warning.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
            showCancelButton: true,      
            confirmButtonColor: theme.palette.primary.main,
            cancelButtonColor: theme.palette.error.main,
            confirmButtonText: "Yes, update it!",
        }).then(async (result) => {
            if (!result.isConfirmed) {
                return;
            }

            dispatch(optimisticUpdateManpowerStatus({ manpowerId, newStatus }));
            try {
                await dispatch(updateManpowerStatus({ manpowerId, newStatus })).unwrap();
                swal.fire({
                    title: 'Updated!',
                    text: 'Manpower status updated successfully.',
                    icon: '',
                    iconHtml: `<img src="/validation/success.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
                    confirmButtonColor: theme.palette.error.main,
                    confirmButtonText: 'OK'
                }).then(async () => {
                    window.location.reload();
                });
            } catch (err) {
                dispatch(revertManpowerStatus({ manpowerId, originalManpower }));
                swal.fire({
                    title: 'Error!',
                    text: err.message || 'Failed to update Manpower.',
                    icon: '',
                    iconHtml: `<img src="/validation/error.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
                    confirmButtonColor: theme.palette.error.main,
                    confirmButtonText: 'OK'
                });
            }
        });
    }

    const handleQueryTextChange = (e) => {
        const newQueryText = e.target.value;
        setFormData(prevFormData => ({
            ...prevFormData,
            query_name: newQueryText, // Update the queryText field
        }));
    };

    const currentUserId = user?.emp_id || null;
    const created_at = new Date().toLocaleTimeString('en-US', { hour12: false });
    const formattedDate = new Date().toISOString().split('T')[0]; 

    const handleQuerySubmit = async (e) => {
        e.preventDefault();
        const { id, query_name } = formData;
        const queryAddData = {
            query_manpower_requisition_pid: id,
            query_name: query_name,
            query_created_by: currentUserId,
            query_created_date: formattedDate,
            query_created_time: created_at,
            query_is_delete: 'Active',
        };

        await dispatch(addQueryForm(queryAddData)).unwrap();
        await dispatch(updateManpowerStatus({ manpowerId, newStatus: manpowerStatus })).unwrap();
        window.location.reload();
    }

    return (
        <div className="page-wrapper">
            <div className="form-panel">
                <div className="form-header">
                    <h1 
                        className="info-title" 
                    >
                        View Manpower Requisition
                    </h1>
                    <p 
                        className="info-subtitle" 
                    >
                        Please fill out the details below to initiate a new hiring request.
                        Ensure all fields are accurate to streamline the approval process.
                    </p>
                </div>
                <form onSubmit={isEditMode ? handleSubmit : (e) => e.preventDefault()}>
                    <div className="form-grid">
                        {/* Requirement Details Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiBriefcase /> Requirement Details</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Department</label>
                                    <input name="department" className={`form-input ${getFieldClassName('department')}`} value={formData.department} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                    {renderError('department')}
                                </div>
                                <div>
                                    <label className="form-label">Status of Employment</label>
                                     <input name="employmentStatus" className={`form-input ${getFieldClassName('employmentStatus')}`} value={formData.employmentStatus} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                     {renderError('employmentStatus')}
                                </div>
                                <div>
                                    <label className="form-label">Proposed Designation</label>
                                    <input name="designation" className={`form-input ${getFieldClassName('designation')}`} value={formData.designation} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                    {renderError('designation')}
                                </div>
                                <div>
                                    <label className="form-label">No. of Resources</label>
                                    <input name="numResources" className={`form-input ${getFieldClassName('numResources')}`} type="number" value={formData.numResources} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                    {renderError('numResources')}
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Requirement Type</label>
                                     <input name="requirementType" className="form-input" value={formData.requirementType} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                </div>

                                {/* Conditional Fields */}
                                {formData.requirementType === "Ramp up" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input name="projectName" className={`form-input ${getFieldClassName('projectName')}`} value={formData.projectName} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Uploaded File</label>
                                            {isEditMode ? (
                                                <>
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
                                                            <span className="file-name">{typeof formData.rampUpFile === 'string' ? formData.rampUpFile.split(/[\\/]/).pop() : formData.rampUpFile.name}</span>
                                                            <button type="button" onClick={() => removeFile("rampUpFile")} className="remove-file-btn"><FiX /></button>
                                                        </div>
                                                    )}
                                                    {renderError('rampUpFile')}
                                                </>
                                            ) : formData.rampUpFile ? (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    <a
                                                        href="#"
                                                        onClick={handleDownload}
                                                        className="file-name"
                                                    >
                                                        {formData.rampUpFile.split(/[\\/]/).pop()}
                                                    </a>
                                                </div>
                                            ) : (<p>No file uploaded.</p>)
                                            }
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "New Requirement" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input name="projectName" className={`form-input ${getFieldClassName('projectName')}`} value={formData.projectName} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Reason for Additional Resources<span className="required-star">*</span></label>
                                            <input name="rampUpReason" className={`form-input ${getFieldClassName('rampUpReason')}`} value={formData.rampUpReason} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                            {renderError('rampUpReason')}
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "Replacement" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input name="projectName" className={`form-input ${getFieldClassName('projectName')}`} value={formData.projectName} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Resigned Employee (Name + ID)<span className="required-star">*</span></label>
                                            <input name="replacementDetail" className={`form-input ${getFieldClassName('replacementDetail')}`} value={formData.replacementDetail} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur}/>
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
                                    <textarea name="jobDescription" className={`form-textarea ${getFieldClassName('jobDescription')}`} rows="4" value={formData.jobDescription} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('jobDescription')}
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Educational Qualification<span className="required-star">*</span></label>
                                    <input name="education" className={`form-input ${getFieldClassName('education')}`} value={formData.education} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
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
                                    <input name="experience" className={`form-input ${getFieldClassName('experience')}`} value={formData.experience} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('experience')}
                                </div>
                                <div>
                                    <label className="form-label">Approx. CTC Range<span className="required-star">*</span></label>
                                    <input name="ctcRange" className={`form-input ${getFieldClassName('ctcRange')}`} value={formData.ctcRange} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
                                    {renderError('ctcRange')}
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Any Specific Information</label>
                                    <textarea name="specificInfo" className="form-textarea" rows="2" value={formData.specificInfo} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
                                </div>
                            </div>
                        </div>

                        {/* Hiring TAT Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiClock /> Turnaround time in detail, please tick required hiring TAT for the request</h3>
                            <div className={`checkbox-group ${getFieldClassName('hiringTAT')}`}>
                                <label className="checkbox-label">
                                    <input name="hiringTAT.fastag" type="checkbox" checked={formData.hiringTAT.fastag} readOnly={!isEditMode} disabled={!isEditMode} onChange={handleInputChange} />
                                    <span className="custom-checkbox"></span>
                                    Fastag Hiring (60 Days)
                                </label>
                                <label className="checkbox-label">
                                    <input name="hiringTAT.normalCat1" type="checkbox" checked={formData.hiringTAT.normalCat1} readOnly={!isEditMode} disabled={!isEditMode} onChange={handleInputChange} />
                                    <span className="custom-checkbox"></span>
                                    Normal Hiring – Cat 1 (90 Days)
                                </label>
                                <label className="checkbox-label">
                                    <input name="hiringTAT.normalCat2" type="checkbox" checked={formData.hiringTAT.normalCat2} readOnly={!isEditMode} disabled={!isEditMode} onChange={handleInputChange} />
                                    <span className="custom-checkbox"></span>
                                    Normal Hiring – Cat 2 (120 Days)
                                </label>
                            </div>
                            {renderError('hiringTAT')}
                        </div>

                        {/* Approvals Section - Conditionally Rendered */}
                        {(isSeniorManager || isDirector || isHr) && (
                            <div className="form-section">
                                <h3 className="section-title"><FaUserCheck /> Approvals</h3>
                                <div className="section-grid multi-col">
                                    {(isSeniorManager || isHr) && (
                                        <div>
                                            <label className="form-label">Requestor Sign & Date<span className="required-star">*</span></label>
                                            {isEditMode ? (
                                                <>
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
                                                            <span className="file-name">{typeof formData.requestorSign === 'string' ? formData.requestorSign.split(/[\\/]/).pop() : formData.requestorSign.name}</span>
                                                            <button type="button" onClick={() => removeFile("requestorSign")} className="remove-file-btn"><FiX /></button>
                                                        </div>
                                                    )}
                                                    {renderError('requestorSign')}
                                                </>
                                            ) : formData.requestorSign ? (
                                                // <div className="file-display-card"><FiFile className="file-icon" /><a href='#!' onClick={handleDownload}  className="file-name">{formData.requestorSign.split(/[\\/]/).pop()}</a></div>
                                                // <div className="file-display-card">
                                                //     <FiFile className="file-icon" />
                                                //     <a
                                                //         href="#"
                                                //         onClick={handleDownload}
                                                //         className="file-name"
                                                //     >
                                                //         {formData.requestorSign.split(/[\\/]/).pop()}
                                                //     </a>
                                                // </div>
    <img
        src={`${API_URL}/${formData.requestorSign}`}
         
    />
                                            ) : (<p>Not provided.</p>)}
                                        </div>
                                    )}
                                    {(isDirector || isHr) && (
                                        <div>
                                            <label className="form-label">Director Sign<span className="required-star">*</span></label>
                                            {isEditMode ? (
                                                <>
                                                    <FileUploader
                                                        classes={`file-uploader-custom ${getFieldClassName('directorSign')}`}
                                                        maxSize={2}
                                                        onSizeError={onSizeError}
                                                        handleChange={(file) => handleFileChange("directorSign", file)}
                                                        name="directorSign"
                                                        types={fileTypes}
                                                    >
                                                        <div className="upload-area"><div className="upload-instruction"><span>Drag & Drop or Click to Upload</span><span className="file-types">(Accepted: JPEG, PNG, JPG)</span></div></div>
                                                    </FileUploader>
                                                    {formData.directorSign && (
                                                        <div className="file-display-card"><FiFile className="file-icon" /><span className="file-name">{typeof formData.directorSign === 'string' ? formData.directorSign.split(/[\\/]/).pop() : formData.directorSign.name}</span><button type="button" onClick={() => removeFile("directorSign")} className="remove-file-btn"><FiX /></button></div>
                                                    )}
                                                    {renderError('directorSign')}
                                                </>
                                            ) : formData.directorSign ? (
                                                <div className="file-display-card"><FiFile className="file-icon" /><a href={`${API_URL}/${formData.directorSign}`} target="_blank" rel="noopener noreferrer" className="file-name">{formData.directorSign.split(/[\\/]/).pop()}</a></div>
                                            ) : (<p>Not provided.</p>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* HR Use Only Section - Conditionally Rendered */}
                        {isHr && (
                            <div className="form-section">
                                <h3 className="section-title"><FiEdit3 /> HR Use Only</h3>
                                <div className="section-grid multi-col">
                                    <div>
                                        <label className="form-label">MRF Number<span className="required-star">*</span></label>
                                        <input name="mrfNumber" className={`form-input ${getFieldClassName('mrfNumber')}`} value={formData.mrfNumber} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
                                        {renderError('mrfNumber')}
                                    </div>
                                    <div>
                                        <label className="form-label">TAT Agreed (in days)<span className="required-star"></span></label>
                                        <input name="tatAgreed" className={`form-input ${getFieldClassName('tatAgreed')}`} value={formData.tatAgreed} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
                                        {renderError('tatAgreed')}
                                    </div>
                                    <div>
                                        <label className="form-label">Phase of Delivery for bulk hiring<span className="required-star"></span></label>
                                        <input name="deliveryPhase" className={`form-input ${getFieldClassName('deliveryPhase')}`} value={formData.deliveryPhase} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
                                        {renderError('deliveryPhase')}
                                    </div>
                                    <div>
                                        <label className="form-label">HR - Head Review<span className="required-star"></span></label>
                                        <input name="hrReview" className={`form-input ${getFieldClassName('hrReview')}`} value={formData.hrReview} readOnly={!isEditMode} onChange={handleInputChange} onBlur={handleBlur} />
                                        {renderError('hrReview')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(isSeniorManager || isDirector || isHr) && (
                            <>
                                <div className="form-section">
                                    <h3 className="section-title"><FaUserCheck /> Status Updation</h3>
                                    <div className="section-grid multi-col">
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={formData.status}
                                                onChange={(e) => handleStatusChange(e, formData.id)}
                                                size="small"
                                                sx={{ fontSize: "0.85rem", height: 36, borderRadius: '6px' }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 200,
                                                            width: 200,
                                                            zIndex: 20000,
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Pending" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                                    Pending
                                                </MenuItem>
                                                <MenuItem value="Approve" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                                    Approve
                                                </MenuItem>
                                                <MenuItem value="Reject" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                                    Reject
                                                </MenuItem>
                                                <MenuItem value="Raise Query" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                                    Raise Query
                                                </MenuItem>
                                                <MenuItem value="On Hold" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                                    On Hold
                                                </MenuItem>
                                                <MenuItem value="HR Approve" sx={{ fontSize: "0.85rem", py: 0.5, '&:hover': { backgroundColor: '#E9F5F2' } }}>
                                                    HR Approve
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>

                                {(isRaiseQueryOpen || formData.status === "Raise Query") && (
                                    <div className="form-section">
                                        <h3 className="section-title">
                                            <FaCommentDots /> Query Details
                                        </h3>
                                        <input type="hidden" name="query_manpower_requisition_pid" value={manpowerId} />
                                        <input type="hidden" name="status" value={manpowerStatus} />
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Enter your query here"
                                            value={formData.query_name || ''}
                                            onChange={(e) => handleQueryTextChange(e)}
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontSize: "0.85rem" }}
                                        />
                                        {formData.status !== "Raise Query" && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                                <Button type="submit" variant="contained" color="primary" onClick={handleQuerySubmit}>
                                                    Update
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {isEditMode && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <Button type="submit" variant="contained" color="primary">
                                Update
                            </Button>
                        </div>
                    )}
                </form>
            </div>
            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MuiAlert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </MuiAlert>
            </Snackbar>
        </div>
    );
};

export default ManpowerRequisitionView;