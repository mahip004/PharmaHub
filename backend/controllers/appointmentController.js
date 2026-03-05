const Appointment = require("../models/Appointment");

function getUserId(req) {
  return req.user?.id || req.user?._id;
}

const memory = () => (global.USE_MEMORY_STORE ? require("../store/memoryStore") : null);

const TIMETABLE = [
  { doctor: "Dr. Smith", specialization: "Cardiologist", day: "Monday", time: "10:00 AM - 2:00 PM" },
  { doctor: "Dr. Johnson", specialization: "Dermatologist", day: "Wednesday", time: "12:00 PM - 4:00 PM" },
  { doctor: "Dr. Brown", specialization: "Pediatrician", day: "Friday", time: "9:00 AM - 1:00 PM" },
  { doctor: "Dr. Williams", specialization: "General Physician", day: "Tuesday", time: "11:00 AM - 3:00 PM" },
  { doctor: "Dr. Davis", specialization: "Neurologist", day: "Thursday", time: "9:00 AM - 1:00 PM" },
];

async function getTimetable(req, res) {
  try {
    const mem = memory();
    if (mem && mem.getTimetable) return res.json(mem.getTimetable());
    return res.json(TIMETABLE);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}

async function createAppointment(req, res) {
  try {
    const userId = getUserId(req) || null;
    const { name, email, phone, date, time, department, reason, patientType } = req.body;
    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ message: "Name, email, phone, date and time are required" });
    }
    const mem = memory();
    if (mem) {
      const apt = mem.addAppointment({
        userId,
        name,
        email,
        phone,
        date,
        time,
        department: department || "General",
        reason: reason || "",
        patientType: patientType || "new",
      });
      return res.status(201).json(apt);
    }
    const apt = new Appointment({
      userId,
      name,
      email,
      phone,
      date,
      time,
      department: department || "General",
      reason: reason || "",
      patientType: patientType || "new",
    });
    await apt.save();
    res.status(201).json(apt);
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getMyAppointments(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const mem = memory();
    if (mem) return res.json(mem.getAppointmentsByUser(userId));
    const list = await Appointment.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getTimetable,
  createAppointment,
  getMyAppointments,
};