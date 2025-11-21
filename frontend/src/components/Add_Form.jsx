import React, { useState } from "react";
import { FiUser, FiBriefcase, FiLayers, FiFileText, FiEdit3 } from "react-icons/fi";
import { FaUserCheck, FaUsersCog } from "react-icons/fa";
import "./Add_Form.css"; // Import the new CSS file

const App_Form = () => {
    const [formData, setFormData] = useState({
        department: "",
        employmentStatus: "",
        designation: "",
        numResources: 1,
        requirementType: "Ramp up",
        replacementDetail: "",
        rampUpReason: "",
        jobDescription: "",
        education: "",
        experience: "",
        ctcRange: "",
        specificInfo: "",
        hiringTAT: { fastag: false, normalCat1: false, normalCat2: false },
        requestorSign: "",
        directorSign: "",
        mrfNumber: "",
        receivedBy: "",
        tatAgreed: "",
        hrReview: "",
        deliveryPhase: "",
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setFormData((p) => ({ ...p, [name]: files[0] }));
        } else {
            setFormData((p) => ({ ...p, [name]: value }));
        }
    };

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setFormData((p) => ({
            ...p,
            hiringTAT: { ...p.hiringTAT, [name]: checked },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        alert("Form submitted! Check console for details.");
    };

    return (
        <div className="page-wrapper">
            {/* --- RIGHT SCROLLABLE FORM PANEL --- */}
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
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-section">
                            <h3 className="section-title"><FiBriefcase /> Requirement Details</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Department</label>
                                    <input className="form-input" name="department" onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="form-label">Status of Employment</label>
                                    <select className="form-select" name="employmentStatus" onChange={handleChange} required>
                                        <option value="">Select Status</option>
                                        <option value="Permanent">Permanent</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelancer">Freelancer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Proposed Designation</label>
                                    <input className="form-input" name="designation" onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="form-label">No. of Resources</label>
                                    <input className="form-input" type="number" name="numResources" min="1" onChange={handleChange} required />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Requirement Type</label>
                                    <select className="form-select" name="requirementType" onChange={handleChange}>
                                        <option value="Ramp up">Ramp up</option>
                                        <option value="New Requirement">New Requirement</option>
                                        <option value="Replacement">Replacement</option>
                                    </select>
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Resigned Employee (Name + ID)</label>
                                    <input
                                        className="form-input"
                                        name="replacementDetail"
                                        disabled={formData.requirementType !== "Replacement"}
                                        onChange={handleChange}
                                        placeholder="Required only for replacements"
                                    />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Reason for Additional Resources</label>
                                    <input
                                        className="form-input"
                                        name="rampUpReason"
                                        disabled={formData.requirementType === "Replacement"}
                                        onChange={handleChange}
                                        placeholder="Required for Ramp up or New Requirement"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title"><FiUser /> Candidate Profile</h3>
                            <div className="section-grid">
                                <div className="full-width">
                                    <label className="form-label">Job Description</label>
                                    <textarea className="form-textarea" rows="4" name="jobDescription" onChange={handleChange} required />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Educational Qualification</label>
                                    <input className="form-input" name="education" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title"><FiLayers /> Experience & Compensation</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Experience (Min - Max)</label>
                                    <input className="form-input" name="experience" placeholder="e.g., 3-5 years" onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="form-label">Approx. CTC Range</label>
                                    <input className="form-input" name="ctcRange" placeholder="e.g., 8-12 LPA" onChange={handleChange} required />
                                </div>
                                <div className="full-width">
                                    <label className="form-label">Any Specific Information</label>
                                    <textarea className="form-textarea" rows="2" name="specificInfo" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title"><FaUsersCog /> Turnaround time in detail, please tick required hiring TAT for the request</h3>
                            <div className="checkbox-group">
                                <label className="checkbox-label"><input type="checkbox" name="fastag" onChange={handleCheckbox} /> Fastag Hiring (45 Days)</label>
                                <label className="checkbox-label"><input type="checkbox" name="normalCat1" onChange={handleCheckbox} /> Normal Hiring – Cat 1 (90 Days)</label>
                                <label className="checkbox-label"><input type="checkbox" name="normalCat2" onChange={handleCheckbox} /> Normal Hiring – Cat 2 (120 Days)</label>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title"><FaUserCheck /> Approvals</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">Requestor Sign & Date</label>
                                    <input className="form-input" type="file" name="requestorSign" onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="form-label">Director</label>
                                    <input className="form-input" type="file" name="directorSign" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title"><FiEdit3 /> HR Use Only</h3>
                            <div className="section-grid multi-col">
                                <div>
                                    <label className="form-label">MRF Number</label>
                                    <input className="form-input" name="mrfNumber" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="form-label">TAT Agreed (in days)</label>
                                    <input className="form-input" name="tatAgreed" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="form-label">Phase of Delivery for bulk hiring</label>
                                    <input className="form-input" name="deliveryPhase" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="form-label">HR - Head Review</label>
                                    <input className="form-input" name="hrReview" onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="submit-button">
                        Submit MRF Request
                    </button>
                </form>
            </div>



        </div >
    );
};

export default App_Form;
