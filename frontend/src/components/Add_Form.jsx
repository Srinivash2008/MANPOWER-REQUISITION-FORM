import React, { useState, useEffect } from 'react';
import { FiUser, FiBriefcase, FiLayers, FiFileText, FiEdit3, FiClock, FiX, FiFile } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { FileUploader } from "react-drag-drop-files";
import "./Add_Form.css";
import { addManpowerRequisition, fetchDepartmentsManagerId } from "../redux/cases/manpowerrequisitionSlice";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const App_Form = () => {
    const { token, user } = useSelector((state) => state.auth);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // --- Role-based visibility flags ---
    const isHr = user?.emp_id === "12345";
    const isDirector = user?.emp_dept === "Director" && !isHr;
    const isSeniorManager = user?.emp_pos === "Senior Manager" && !isHr && !isDirector;

    // --- Form State ---
    const [formData, setFormData] = useState({
        department: "",
        employmentStatus: "",
        designation: "",
        numResources: 1,
        requirementType: "Ramp up",
        projectName: "",
        replacementDetail: "",
        rampUpFile: null,
        rampUpReason: "",
        jobDescription: "",
        education: "",
        experience: "",
        ctcRange: "",
        specificInfo: "",
        hiringTAT: "",
        created_by: user?.emp_id || "",
        requestorSign: null,
        directorSign: null,
        mrfNumber: "",
        tatAgreed: "",
        hrReview: "",
        deliveryPhase: ""
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // --- Dynamic Initial Values based on role ---
    useEffect(() => {
        const initialData = {
            department: "",
            employmentStatus: "",
            designation: "",
            numResources: 1,
            requirementType: "Ramp up",
            projectName: "",
            replacementDetail: "",
            rampUpFile: null,
            rampUpReason: "",
            jobDescription: "",
            education: "",
            experience: "",
            ctcRange: "",
            specificInfo: "",
            hiringTAT: "",
            created_by: user?.emp_id || "",
        };

        // Only include fields that this user role can see
        if (isSeniorManager || isHr) {
            initialData.requestorSign = null;
        }
        if (isDirector || isHr) {
            initialData.directorSign = null;
        }
        if (isHr) {
            initialData.mrfNumber = "";
            initialData.tatAgreed = "";
            initialData.hrReview = "";
            initialData.deliveryPhase = "";
        }

        setFormData(initialData);
    }, [user, isHr, isDirector, isSeniorManager]);

    const dispatch = useDispatch();
    const {
        status: submissionStatus,
        departments
    } = useSelector((state) => state.manpowerRequisition) || {};

    // --- Validation Functions ---
    const validateField = (name, value) => {
        const newErrors = { ...errors };

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
                if (formData.requirementType === "Ramp up" && !value) {
                    newErrors.rampUpFile = 'File upload is required for Ramp up.';
                } else if (value && !['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)) {
                    newErrors.rampUpFile = 'Only image files are accepted';
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
                if (!value) {
                    newErrors.hiringTAT = 'A Hiring TAT option must be selected.';
                } else {
                    delete newErrors.hiringTAT;
                }
                break;
            case 'requestorSign':
                if ((isSeniorManager || isHr) && !value) {
                    newErrors.requestorSign = 'Requestor Sign is required.';
                } else if (value && !['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)) {
                    newErrors.requestorSign = 'Only JPEG, PNG, and JPG files are allowed.';
                } else {
                    delete newErrors.requestorSign;
                }
                break;
            case 'directorSign':
                if ((isDirector || isHr) && !value) {
                    newErrors.directorSign = 'Director Sign is required.';
                } else if (value && !['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)) {
                    newErrors.directorSign = 'Only JPEG, PNG, and JPG files are allowed.';
                } else {
                    delete newErrors.directorSign;
                }
                break;
            case 'mrfNumber':
                if (isHr && !value) newErrors.mrfNumber = 'MRF Number is required for HR.';
                else delete newErrors.mrfNumber;
                break;
            case 'tatAgreed':
                if (isHr && !value) newErrors.tatAgreed = 'TAT Agreed is required for HR.';
                else delete newErrors.tatAgreed;
                break;
            case 'deliveryPhase':
                if (isHr && !value) newErrors.deliveryPhase = 'Phase of Delivery is required for HR.';
                else delete newErrors.deliveryPhase;
                break;
            case 'hrReview':
                if (isHr && !value) newErrors.hrReview = 'HR Review is required for HR.';
                else delete newErrors.hrReview;
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    const validateForm = () => {
        const newErrors = {};

        // Base validations
        if (!formData.department) newErrors.department = 'Department is required.';
        if (!formData.employmentStatus) newErrors.employmentStatus = 'Status of Employment is required.';
        if (!formData.designation) newErrors.designation = 'Proposed Designation is required.';
        if (!formData.numResources || formData.numResources < 1) newErrors.numResources = 'At least one resource is required.';
        if (!formData.jobDescription) newErrors.jobDescription = 'Job Description is required.';
        if (!formData.education) newErrors.education = 'Educational Qualification is required.';
        if (!formData.experience) newErrors.experience = 'Experience is required.';
        if (!formData.ctcRange) newErrors.ctcRange = 'Approx. CTC Range is required.';
        if (!formData.hiringTAT) newErrors.hiringTAT = 'A Hiring TAT option must be selected.';

        // Requirement type specific validations
        if (formData.requirementType === "Ramp up") {
            if (!formData.projectName) newErrors.projectName = 'Project Name is required for Ramp up.';
            if (!formData.rampUpFile) newErrors.rampUpFile = 'File upload is required for Ramp up.';
            else if (!['image/jpeg', 'image/png', 'image/jpg'].includes(formData.rampUpFile.type)) {
                newErrors.rampUpFile = 'Only image files are accepted';
            }
        }

        if (formData.requirementType === "New Requirement") {
            if (!formData.projectName) newErrors.projectName = 'Project Name is required for New Requirement.';
            if (!formData.rampUpReason) newErrors.rampUpReason = 'Reason is required for New Requirement.';
        }

        if (formData.requirementType === "Replacement") {
            if (!formData.projectName) newErrors.projectName = 'Project Name is required for Replacement.';
            if (!formData.replacementDetail) newErrors.replacementDetail = 'Replacement details are required.';
        }

        // Role-based validations
        if ((isSeniorManager || isHr) && !formData.requestorSign) {
            newErrors.requestorSign = 'Requestor Sign is required.';
        }

        if ((isDirector || isHr) && !formData.directorSign) {
            newErrors.directorSign = 'Director Sign is required.';
        }

        if (isHr) {
            if (!formData.mrfNumber) newErrors.mrfNumber = 'MRF Number is required for HR.';
            if (!formData.tatAgreed) newErrors.tatAgreed = 'TAT Agreed is required for HR.';
            if (!formData.deliveryPhase) newErrors.deliveryPhase = 'Phase of Delivery is required for HR.';
            if (!formData.hrReview) newErrors.hrReview = 'HR Review is required for HR.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Form Handlers ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'number' ? parseInt(value) : value;
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        validateField(name, newValue);
    };

    const handleFileChange = (fieldName, file) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: file
        }));
        validateField(fieldName, file);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const removeFile = (fieldName) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: null
        }));
        validateField(fieldName, null);
    };

    const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });

    const fileTypes = ["JPEG", "PNG", "JPG"];

    useEffect(() => {
        if (user?.emp_id) {
            dispatch(fetchDepartmentsManagerId(user.emp_id));
        }
    }, [dispatch, user?.emp_id]);

    const onSizeError = (file) => {
        setNotification({
            open: true,
            message: `File "${file.name}" is too large. Please upload a file under 2MB.`,
            severity: 'error'
        });
    };

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        if (!validateForm()) {
            setNotification({
                open: true,
                message: 'Please fix the validation errors before submitting.',
                severity: 'error'
            });
            return;
        }

        const data = new FormData();

        // Append all form fields to the FormData object
        for (const key in formData) {
            if (key === 'hiringTAT' && formData.hiringTAT) {
                // Append hiring TAT fields based on the selected radio button
                data.append('hiring_tat_fastag', formData.hiringTAT === 'fastag');
                data.append('hiring_tat_normal_cat1', formData.hiringTAT === 'normalCat1');
                data.append('hiring_tat_normal_cat2', formData.hiringTAT === 'normalCat2');
                continue;
            }
            if (formData[key] !== null && formData[key] !== "") {
                data.append(key, formData[key]);
            }
        }

        dispatch(addManpowerRequisition(data))
            .unwrap()
            .then(() => {
                setNotification({
                    open: true,
                    message: 'MRF request submitted successfully!',
                    severity: 'success'
                });
                // Reset form
                setFormData({
                    department: "",
                    employmentStatus: "",
                    designation: "",
                    numResources: 1,
                    requirementType: "Ramp up",
                    projectName: "",
                    replacementDetail: "",
                    rampUpFile: null,
                    rampUpReason: "",
                    jobDescription: "",
                    education: "",
                    experience: "",
                    ctcRange: "",
                    specificInfo: "",
                    hiringTAT: "",
                    created_by: user?.emp_id || "",
                    requestorSign: null,
                    directorSign: null,
                    mrfNumber: "",
                    tatAgreed: "",
                    hrReview: "",
                    deliveryPhase: ""
                });
                setErrors({});
                setTouched({});
            })
            .catch((error) => {
                setNotification({
                    open: true,
                    message: `Submission failed: ${error.message || "Please try again."}`,
                    severity: 'error'
                });
            });
    };

    const handleSaveAsDraft = (e) => {
        e.preventDefault();

        // Mark all fields as touched to show errors
        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        if (!validateForm()) {
            setNotification({
                open: true,
                message: 'Please fix the validation errors before saving as a draft.',
                severity: 'error'
            });
            return;
        }
        const data = new FormData();

        // Append all form fields to the FormData object
        for (const key in formData) {
            if (key === 'hiringTAT' && formData.hiringTAT) {
                data.append('hiring_tat_fastag', formData.hiringTAT === 'fastag');
                data.append('hiring_tat_normal_cat1', formData.hiringTAT === 'normalCat1');
                data.append('hiring_tat_normal_cat2', formData.hiringTAT === 'normalCat2');
                continue;
            }
            if (formData[key] !== null && formData[key] !== "") {
                data.append(key, formData[key]);
            }
        }

        // Add status to indicate it's a draft
        data.append('status', 'Draft');

        dispatch(addManpowerRequisition(data))
            .unwrap()
            .then(() => {
                setNotification({
                    open: true,
                    message: 'MRF saved as draft successfully!',
                    severity: 'success'
                });
                // Reset form
                setFormData({
                    department: "", employmentStatus: "", designation: "", numResources: 1,
                    requirementType: "Ramp up", projectName: "", replacementDetail: "",
                    rampUpFile: null, rampUpReason: "", jobDescription: "", education: "",
                    experience: "", ctcRange: "", specificInfo: "", hiringTAT: "",
                    created_by: user?.emp_id || "", requestorSign: null, directorSign: null,
                    mrfNumber: "", tatAgreed: "", hrReview: "", deliveryPhase: ""
                });
                setErrors({});
                setTouched({});
            })
            .catch((error) => {
                setNotification({
                    open: true,
                    message: `Failed to save draft: ${error.message || "Please try again."}`,
                    severity: 'error'
                });
            });
    };




    const isFormValid = () => {
        return Object.keys(errors).length === 0;
    };

    const getFieldClassName = (fieldName) => {
        return errors[fieldName] && touched[fieldName] ? 'invalid-field' : '';
    };

    const renderError = (fieldName) => {
        return errors[fieldName] && touched[fieldName] ? (
            <div className="error-message">{errors[fieldName]}</div>
        ) : null;
    };

    return (
        <div className="page-wrapper">
            <div className="form-panel">
                <div className="form-header">
                    <h1 className="info-title">
                        Manpower Requisition Form
                    </h1>
                    <p className="info-subtitle">
                        Please fill out the details below to initiate a new hiring request.
                        Ensure all fields are accurate to streamline the approval process.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Requirement Details Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiBriefcase /> Requirement Details</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Department<span className="required-star">*</span></label>
                                    <select 
                                        name="department" 
                                        value={formData.department} 
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`form-select ${getFieldClassName('department')}`}
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
                                    <label className="form-label">Status of Employment<span className="required-star">*</span></label>
                                    <select 
                                        name="employmentStatus" 
                                        value={formData.employmentStatus} 
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`form-select ${getFieldClassName('employmentStatus')}`}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Permanent">Permanent</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelancer">Freelancer</option>
                                    </select>
                                    {renderError('employmentStatus')}
                                </div>

                                <div>
                                    <label className="form-label">Proposed Designation<span className="required-star">*</span></label>
                                    <input 
                                        type="text"
                                        name="designation" 
                                        value={formData.designation} 
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`form-input ${getFieldClassName('designation')}`}
                                        placeholder="Enter designation" 
                                    />
                                    {renderError('designation')}
                                </div>

                                <div>
                                    <label className="form-label">No. of Resources<span className="required-star">*</span></label>
                                    <input 
                                        type="number"
                                        name="numResources" 
                                        value={formData.numResources} 
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        min="1"
                                        className={`form-input ${getFieldClassName('numResources')}`}
                                        placeholder="e.g., 1" 
                                    />
                                    {renderError('numResources')}
                                </div>

                                <div className="full-width">
                                    <label className="form-label">Requirement Type</label>
                                    <select 
                                        name="requirementType" 
                                        value={formData.requirementType} 
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        <option value="Ramp up">Ramp up</option>
                                        <option value="New Requirement">New Requirement</option>
                                        <option value="Replacement">Replacement</option>
                                    </select>
                                </div>

                                {/* Conditional Fields */}
                                {formData.requirementType === "Ramp up" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input 
                                                type="text"
                                                name="projectName" 
                                                value={formData.projectName} 
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                className={`form-input ${getFieldClassName('projectName')}`}
                                                placeholder="Enter project name" 
                                            />
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Upload File<span className="required-star">*</span></label>
                                            <FileUploader
                                                classes="file-uploader-custom"
                                                maxSize={2}
                                                onSizeError={onSizeError}
                                                handleChange={(file) => handleFileChange("rampUpFile", file)}
                                                name="rampUpFile"
                                                types={fileTypes}
                                            >
                                                <div className={`upload-area ${getFieldClassName('rampUpFile')}`}>
                                                    <div className="upload-instruction">
                                                        <span>Drag & Drop or Click to Upload</span>
                                                        <span className="file-types">(Accepted: JPEG, PNG, JPG)</span>
                                                    </div>
                                                </div>
                                            </FileUploader>
                                            {renderError('rampUpFile')}
                                            {formData.rampUpFile && (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    <span className="file-name">{formData.rampUpFile.name}</span>
                                                    <button type="button" onClick={() => removeFile("rampUpFile")} className="remove-file-btn">
                                                        <FiX />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "New Requirement" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input 
                                                type="text"
                                                name="projectName" 
                                                value={formData.projectName} 
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                className={`form-input ${getFieldClassName('projectName')}`}
                                                placeholder="Enter project name" 
                                            />
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Reason for Additional Resources<span className="required-star">*</span></label>
                                            <input 
                                                type="text"
                                                name="rampUpReason" 
                                                value={formData.rampUpReason} 
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                className={`form-input ${getFieldClassName('rampUpReason')}`}
                                                placeholder="Required for New Requirement" 
                                            />
                                            {renderError('rampUpReason')}
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "Replacement" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name<span className="required-star">*</span></label>
                                            <input 
                                                type="text"
                                                name="projectName" 
                                                value={formData.projectName} 
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                className={`form-input ${getFieldClassName('projectName')}`}
                                                placeholder="Enter project name" 
                                            />
                                            {renderError('projectName')}
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Resigned Employee (Name + ID)<span className="required-star">*</span></label>
                                            <input 
                                                type="text"
                                                name="replacementDetail" 
                                                value={formData.replacementDetail} 
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                className={`form-input ${getFieldClassName('replacementDetail')}`}
                                                placeholder="Required only for replacements" 
                                            />
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
                                    <textarea 
                                        name="jobDescription" 
                                        value={formData.jobDescription} 
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        rows="4" 
                                        className={`form-textarea ${getFieldClassName('jobDescription')}`}
                                        placeholder="Enter detailed job description" 
                                    />
                                    {renderError('jobDescription')}
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Educational Qualification<span className="required-star">*</span></label>
                                    <input 
                                        type="text"
                                        name="education" 
                                        value={formData.education} 
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`form-input ${getFieldClassName('education')}`}
                                        placeholder="e.g., B.Tech in Computer Science" 
                                    />
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
                                    <input 
                                        type="text"
                                        name="experience" 
                                        value={formData.experience} 
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`form-input ${getFieldClassName('experience')}`}
                                        placeholder="e.g., 3-5 years" 
                                    />
                                    {renderError('experience')}
                                </div>
                                <div>
                                    <label className="form-label">Approx. CTC Range<span className="required-star">*</span></label>
                                    <input 
                                        type="text"
                                        name="ctcRange" 
                                        value={formData.ctcRange} 
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`form-input ${getFieldClassName('ctcRange')}`}
                                        placeholder="e.g., 8-12 LPA" 
                                    />
                                    {renderError('ctcRange')}
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Any Specific Information</label>
                                    <textarea 
                                        name="specificInfo" 
                                        value={formData.specificInfo} 
                                        onChange={handleInputChange}
                                        rows="2" 
                                        className="form-textarea"
                                        placeholder="Enter any other specific requirements" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hiring TAT Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiClock /> Turnaround time in detail, please tick required hiring TAT for the request<span className="required-star">*</span></h3>
                            <div className={`checkbox-group ${getFieldClassName('hiringTAT')}`}>
                                <label className="radio-label">
                                    <input 
                                        type="radio"
                                        name="hiringTAT"
                                        value="fastag"
                                        checked={formData.hiringTAT === 'fastag'} 
                                        onChange={handleInputChange}
                                    />
                                    <span className="custom-radio"></span>
                                    Fastag Hiring (60 Days)
                                </label>
                                <label className="radio-label">
                                    <input 
                                        type="radio"
                                        name="hiringTAT"
                                        value="normalCat1"
                                        checked={formData.hiringTAT === 'normalCat1'} 
                                        onChange={handleInputChange}
                                    />
                                    <span className="custom-radio"></span>
                                    Normal Hiring – Cat 1 (90 Days)
                                </label>
                                <label className="radio-label">
                                    <input 
                                        type="radio"
                                        name="hiringTAT"
                                        value="normalCat2"
                                        checked={formData.hiringTAT === 'normalCat2'} 
                                        onChange={handleInputChange}
                                    />
                                    <span className="custom-radio"></span>
                                    Normal Hiring – Cat 2 (120 Days)
                                </label>
                            </div>
                            {renderError('hiringTAT')}
                        </div>

                        {/* Approvals Section - Only show if user has permission */}
                        {(isSeniorManager || isDirector || isHr) && (
                            <div className="form-section">
                                <h3 className="section-title"><FaUserCheck /> Approvals</h3>
                                <div className="section-grid multi-col">
                                    {(isSeniorManager || isHr) && (
                                        <div>
                                            <label className="form-label">Requestor Sign & Date<span className="required-star">*</span></label>
                                            <FileUploader
                                                classes="file-uploader-custom"
                                                maxSize={2}
                                                onSizeError={onSizeError}
                                                handleChange={(file) => handleFileChange("requestorSign", file)}
                                                name="requestorSign"
                                                types={fileTypes}
                                            >
                                                <div className={`upload-area ${getFieldClassName('requestorSign')}`}>
                                                    <div className="upload-instruction">
                                                        <span>Drag & Drop or Click to Upload</span>
                                                        <span className="file-types">(Accepted: JPEG, PNG, JPG)</span>
                                                    </div>
                                                </div>
                                            </FileUploader>
                                            {renderError('requestorSign')}
                                            {formData.requestorSign && (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    <span className="file-name">{formData.requestorSign.name}</span>
                                                    <button type="button" onClick={() => removeFile("requestorSign")} className="remove-file-btn">
                                                        <FiX />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {(isDirector || isHr) && (
                                        <div>
                                            <label className="form-label">Director Sign<span className="required-star">*</span></label>
                                            <FileUploader
                                                classes="file-uploader-custom"
                                                maxSize={2}
                                                onSizeError={onSizeError}
                                                handleChange={(file) => handleFileChange("directorSign", file)}
                                                name="directorSign"
                                                types={fileTypes}
                                            >
                                                <div className={`upload-area ${getFieldClassName('directorSign')}`}>
                                                    <div className="upload-instruction">
                                                        <span>Drag & Drop or Click to Upload</span>
                                                        <span className="file-types">(Accepted: JPEG, PNG, JPG)</span>
                                                    </div>
                                                </div>
                                            </FileUploader>
                                            {renderError('directorSign')}
                                            {formData.directorSign && (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    <span className="file-name">{formData.directorSign.name}</span>
                                                    <button type="button" onClick={() => removeFile("directorSign")} className="remove-file-btn">
                                                        <FiX />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* HR Use Only Section - Only show if user is HR */}
                        {isHr && (
                            <div className="form-section">
                                <h3 className="section-title"><FiEdit3 /> HR Use Only</h3>
                                <div className="section-grid multi-col">
                                    <div>
                                        <label className="form-label">MRF Number<span className="required-star">*</span></label>
                                        <input 
                                            type="text"
                                            name="mrfNumber" 
                                            value={formData.mrfNumber} 
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`form-input ${getFieldClassName('mrfNumber')}`}
                                            placeholder="Enter MRF Number" 
                                        />
                                        {renderError('mrfNumber')}
                                    </div>
                                    <div>
                                        <label className="form-label">TAT Agreed (in days)<span className="required-star">*</span></label>
                                        <input 
                                            type="text"
                                            name="tatAgreed" 
                                            value={formData.tatAgreed} 
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`form-input ${getFieldClassName('tatAgreed')}`}
                                            placeholder="Enter agreed TAT in days" 
                                        />
                                        {renderError('tatAgreed')}
                                    </div>
                                    <div>
                                        <label className="form-label">Phase of Delivery for bulk hiring<span className="required-star">*</span></label>
                                        <input 
                                            type="text"
                                            name="deliveryPhase" 
                                            value={formData.deliveryPhase} 
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`form-input ${getFieldClassName('deliveryPhase')}`}
                                            placeholder="e.g., Phase 1" 
                                        />
                                        {renderError('deliveryPhase')}
                                    </div>
                                    <div>
                                        <label className="form-label">HR - Head Review<span className="required-star">*</span></label>
                                        <input 
                                            type="text"
                                            name="hrReview" 
                                            value={formData.hrReview} 
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`form-input ${getFieldClassName('hrReview')}`}
                                            placeholder="Enter review comments" 
                                        />
                                        {renderError('hrReview')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="draft-button"
                            onClick={handleSaveAsDraft}
                            disabled={submissionStatus === 'loading'}
                        >
                            {submissionStatus === 'loading' ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={submissionStatus === 'loading' || !isFormValid()}
                        >
                            {submissionStatus === 'loading' ? 'Submitting...' : 'Submit MRF Request'}
                        </button>
                    </div>
                </form>
            </div>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default App_Form;