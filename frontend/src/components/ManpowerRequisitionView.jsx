import React, { useState, useEffect } from 'react';
import { FiUser, FiBriefcase, FiLayers, FiFileText, FiEdit3, FiClock, FiFile, FiX } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import "./Add_Form.css";
import { useParams } from "react-router-dom";
import { fetchManpowerRequisitionById } from '../redux/cases/manpowerrequisitionSlice';
import { useDispatch, useSelector } from 'react-redux';

const ManpowerRequisitionView = () => {
    const dispatch  = useDispatch();
    const { id } = useParams(); 
    const { user } = useSelector((state) => state.auth);

    // --- Role-based visibility flags ---
    const isHr = user?.emp_id === "12345";
    const isDirector = user?.emp_dept === "Director" && !isHr;
    const isSeniorManager = user?.emp_pos === "Senior Manager" && !isHr && !isDirector;

    const [formData, setFormData] = useState({
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
    });

    useEffect(() => {
        dispatch(fetchManpowerRequisitionById(id));
    }, [dispatch, id]);

    const selectedRequisition = useSelector((state) => state.manpowerRequisition.selectedRequisition);

    useEffect(() => {
        if (selectedRequisition) {
            console.log("Selected Requisition:", selectedRequisition);
            setFormData({
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
                    fastag: selectedRequisition.hiring_tat_fastag,
                    normalCat1: selectedRequisition.hiring_tat_normal_cat1,
                    normalCat2: selectedRequisition.hiring_tat_normal_cat2,
                },
                requestorSign: selectedRequisition.requestor_sign || null,
                directorSign: selectedRequisition.director_sign || null,
                mrfNumber: selectedRequisition.mrf_number || "",
                tatAgreed: selectedRequisition.tat_agreed || "",
                hrReview: selectedRequisition.hr_review || "",
                deliveryPhase: selectedRequisition.delivery_phase || "",
            });
        }
    }, [selectedRequisition]);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    return (
        <div className="page-wrapper">
            <div className="form-panel">
                <div className="form-header">
                    <h1 
                        className="info-title" 
                    >
                        Manpower Requisition Form
                    </h1>
                    <p 
                        className="info-subtitle" 
                    >
                        Please fill out the details below to initiate a new hiring request.
                        Ensure all fields are accurate to streamline the approval process.
                    </p>
                </div>
                <form> {/* Using form for semantic structure, but no submission */}
                    <div className="form-grid">
                        {/* Requirement Details Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiBriefcase /> Requirement Details</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Department</label>
                                    <input className="form-input" value={formData.department} readOnly/>
                                </div>
                                <div>
                                    <label className="form-label">Status of Employment</label>
                                     <input className="form-input" value={formData.employmentStatus} readOnly/>
                                </div>
                                <div>
                                    <label className="form-label">Proposed Designation</label>
                                    <input className="form-input" value={formData.designation} readOnly/>
                                </div>
                                <div>
                                    <label className="form-label">No. of Resources</label>
                                    <input className="form-input" type="number" value={formData.numResources} readOnly/>
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Requirement Type</label>
                                     <input className="form-input" value={formData.requirementType} readOnly/>
                                </div>

                                {/* Conditional Fields */}
                                {formData.requirementType === "Ramp up" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name</label>
                                            <input className="form-input" value={formData.projectName} readOnly/>
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Uploaded File</label>
                                            {formData.rampUpFile ? (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    <a href={`${API_URL}/uploads/${formData.rampUpFile}`} target="_blank" rel="noopener noreferrer" className="file-name">{formData.rampUpFile}</a>
                                                </div>
                                            ) : <p>No file uploaded.</p>}
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "New Requirement" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name</label>
                                            <input className="form-input" value={formData.projectName} readOnly/>
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Reason for Additional Resources</label>
                                            <input className="form-input" value={formData.rampUpReason} readOnly/>
                                        </div>
                                    </>
                                )}

                                {formData.requirementType === "Replacement" && (
                                    <>
                                        <div className="full-width">
                                            <label className="form-label">Project Name</label>
                                            <input className="form-input" value={formData.projectName} readOnly/>
                                        </div>
                                        <div className="full-width">
                                            <label className="form-label">Resigned Employee (Name + ID)</label>
                                            <input className="form-input" value={formData.replacementDetail} readOnly/>
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
                                    <label className="form-label">Job Description</label>
                                    <textarea className="form-textarea" rows="4" value={formData.jobDescription} readOnly />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Educational Qualification</label>
                                    <input className="form-input" value={formData.education} readOnly />
                                </div>
                            </div>
                        </div>

                        {/* Experience & Compensation Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiLayers /> Experience & Compensation</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Experience (Min - Max)</label>
                                    <input className="form-input" value={formData.experience} readOnly />
                                </div>
                                <div>
                                    <label className="form-label">Approx. CTC Range</label>
                                    <input className="form-input" value={formData.ctcRange} readOnly />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Any Specific Information</label>
                                    <textarea className="form-textarea" rows="2" value={formData.specificInfo} readOnly />
                                </div>
                            </div>
                        </div>

                        {/* Hiring TAT Section */}
                        <div className="form-section">
                            <h3 className="section-title"><FiClock /> Turnaround time in detail, please tick required hiring TAT for the request</h3>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={formData.hiringTAT.fastag} readOnly disabled />
                                    <span className="custom-checkbox"></span>
                                    Fastag Hiring (45 Days)
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={formData.hiringTAT.normalCat1} readOnly disabled />
                                    <span className="custom-checkbox"></span>
                                    Normal Hiring – Cat 1 (90 Days)
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={formData.hiringTAT.normalCat2} readOnly disabled />
                                    <span className="custom-checkbox"></span>
                                    Normal Hiring – Cat 2 (120 Days)
                                </label>
                            </div>
                        </div>

                        {/* Approvals Section - Conditionally Rendered */}
                        {(isSeniorManager || isDirector || isHr) && (
                            <div className="form-section">
                                <h3 className="section-title"><FaUserCheck /> Approvals</h3>
                                <div className="section-grid multi-col">
                                    {(isSeniorManager || isHr) && (
                                        <div>
                                            <label className="form-label">Requestor Sign & Date</label>
                                            {formData.requestorSign ? (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    <a href={`${API_URL}/${formData.requestorSign}`} target="_blank" rel="noopener noreferrer" className="file-name">{formData.requestorSign.split('\\').pop()}</a>
                                                </div>
                                            ) : <p>Not provided.</p>}
                                        </div>
                                    )}
                                    {(isDirector || isHr) && (
                                        <div>
                                            <label className="form-label">Director Sign</label>
                                            {formData.directorSign ? (
                                                <div className="file-display-card">
                                                    <FiFile className="file-icon" />
                                                    <a href={`${API_URL}/${formData.directorSign}`} target="_blank" rel="noopener noreferrer" className="file-name">{formData.directorSign.split('\\').pop()}</a>
                                                </div>
                                            ) : <p>Not provided.</p>}
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
                                    <div><label className="form-label">MRF Number</label><input className="form-input" value={formData.mrfNumber} readOnly /></div>
                                    <div><label className="form-label">TAT Agreed (in days)</label><input className="form-input" value={formData.tatAgreed} readOnly /></div>
                                    <div><label className="form-label">Phase of Delivery for bulk hiring</label><input className="form-input" value={formData.deliveryPhase} readOnly /></div>
                                    <div><label className="form-label">HR - Head Review</label><input className="form-input" value={formData.hrReview} readOnly /></div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManpowerRequisitionView;