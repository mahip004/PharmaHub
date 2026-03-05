import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AboutUs.css";

const AboutUs = () => {
  const navigate = useNavigate(); // Hook to handle navigation

  return (
    <div className="about-page">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="about-container">
        <div className="about-content">
          <h1 className="about-title">
            Welcome to <span>PharmaHub</span>
          </h1>

          <p className="about-description">
            At <strong>PharmaHub</strong>, we are reshaping the future of healthcare through cutting-edge automation and AI. 
            Our mission is to simplify your medical journey — whether it's understanding your prescriptions, booking doctor appointments, or ordering medicines — we’ve got it covered in just a few taps.
          </p>

          <p className="about-description">
            Imagine uploading a handwritten prescription or a simple QR code and instantly getting details of the medicines, dosages, test suggestions, and the option to schedule your medication or place an order — all in one place.
          </p>

          <p className="about-description">
            From AI-powered side effect analysis, valid prescription verification, to a fully stocked pharmacy inventory — we ensure you're informed, safe, and taken care of. Our secure login system, TTS-enabled chatbot, and intuitive interface make the experience smooth and accessible for everyone.
          </p>

          <div className="about-points">
            <h2>Our Features:</h2>
            <ul>
              <li>🗣️ Voice-Accessible (TTS) Chatbot</li>
              <li>💊 Medicine Details & Side Effects</li>
              <li>📝 Handwritten Prescription to Text + QR Upload</li>
              <li>📋 Valid Prescription Checker</li>
              <li>📦 Inventory Management & One-Click Medicine Order</li>
              <li>🏥 Doctor Appointment Queue Management</li>
              <li>📆 Medicine Scheduler & Timetable</li>
              <li>🔐 Secure Login System</li>
              <li>📁 Prescription History Management</li>
            </ul>
          </div>

          <p className="about-tagline">
            Join us in redefining convenience, one prescription at a time.
          </p>

          <div className="about-cta">
            <button className="cta-button" onClick={() => navigate("/")}>
              Explore PharmaHub
            </button>
          </div>
        </div>

        <div className="about-image">
          {/* You can add an image here if needed */}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
