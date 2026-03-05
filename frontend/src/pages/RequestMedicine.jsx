import React, { useState } from "react";
import "./RequestMedicine.css";
import { FiSend, FiPackage } from "react-icons/fi";

const RequestMedicine = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        medicineName: "",
        dosage: "",
        quantity: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you'd send this to the backend
        console.log("Medicine Request Submitted:", formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="request-container">
                <div className="success-card">
                    <div className="success-icon-bg">
                        <FiPackage className="success-icon" />
                    </div>
                    <h2>Request Submitted!</h2>
                    <p>We've received your request for <strong>{formData.medicineName}</strong>. Our team will contact you at <strong>{formData.email}</strong> as soon as it's available.</p>
                    <button className="back-btn" onClick={() => setSubmitted(false)}>Request Another</button>
                </div>
            </div>
        );
    }

    return (
        <div className="request-container">
            <div className="request-header">
                <h1>Request a Medicine</h1>
                <p>Can't find what you're looking for? Let us know, and we'll source it for you.</p>
            </div>

            <div className="request-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Medicine Name</label>
                        <input
                            type="text"
                            name="medicineName"
                            required
                            placeholder="Enter medicine name"
                            value={formData.medicineName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Dosage (Optional)</label>
                            <input
                                type="text"
                                name="dosage"
                                placeholder="e.g. 500mg"
                                value={formData.dosage}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                required
                                min="1"
                                placeholder="1"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Additional Notes</label>
                        <textarea
                            name="message"
                            placeholder="Any specific instructions or urgency?"
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <button type="submit" className="submit-request-btn">
                        <FiSend className="btn-icon" /> Send Request
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RequestMedicine;
