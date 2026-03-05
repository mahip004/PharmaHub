import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import "./AppointmentForm.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    department: "General",
    reason: "",
    patientType: "new",
  });
  const [myAppointments, setMyAppointments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMyAppointments(Array.isArray(data) ? data : []))
      .catch(() => setMyAppointments([]));
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(`${API_URL}/api/appointments`, {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data._id || data.id) {
          alert("Appointment request submitted successfully.");
          setFormData({
            name: "",
            email: "",
            phone: "",
            date: "",
            time: "",
            department: "General",
            reason: "",
            patientType: "new",
          });
          setMyAppointments((prev) => [data, ...prev]);
        } else alert(data.message || "Failed to submit.");
      })
      .catch(() => alert("Network error. Please try again."))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="appointment-page">
      <Sidebar />
      <div className="form-container">
        <h2 className="form-title">Book an Appointment</h2>
        <form onSubmit={handleSubmit} className="appointment-form">
          <label>Name</label>
          <input type="text" name="name" placeholder="Enter Name" value={formData.name} onChange={handleChange} required />
          <label>Email</label>
          <input type="email" name="email" placeholder="Enter Email" value={formData.email} onChange={handleChange} required />
          <label>Phone Number</label>
          <input type="tel" name="phone" placeholder="Enter Phone" value={formData.phone} onChange={handleChange} required />
          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          <label>Time</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
          <label>Department</label>
          <select name="department" value={formData.department} onChange={handleChange}>
            <option value="General">General</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Neurology">Neurology</option>
          </select>
          <label>Reason for Visit</label>
          <textarea name="reason" placeholder="Describe your reason" value={formData.reason} onChange={handleChange} />
          <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Make an Appointment"}</button>
        </form>

        {myAppointments.length > 0 && (
          <div className="my-appointments">
            <h3>Your Appointments</h3>
            <ul>
              {myAppointments.map((apt) => (
                <li key={apt._id}>
                  {apt.date} {apt.time} — {apt.department} — {apt.status || "pending"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentForm;
