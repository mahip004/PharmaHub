import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import "./timetable.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Timetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/timetable`)
      .then((res) => res.json())
      .then((data) => setSchedule(Array.isArray(data) ? data : []))
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="timetable-page">
      <Sidebar />
      <div className="container">
        <h2 className="title">Doctor's Timetable</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="timetable">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Day</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length > 0 ? (
                schedule.map((row, i) => (
                  <tr key={i}>
                    <td>{row.doctor}</td>
                    <td>{row.specialization}</td>
                    <td>{row.day}</td>
                    <td>{row.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No schedule data.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Timetable;
