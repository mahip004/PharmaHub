const express = require("express");
const router = express.Router();
const { jwtMiddleware } = require("../middleware/jwtMiddleware");
const { getTimetable, createAppointment, getMyAppointments } = require("../controllers/appointmentController");

router.get("/timetable", getTimetable);
router.post("/appointments", createAppointment);
router.get("/appointments", jwtMiddleware, getMyAppointments);

module.exports = router;
