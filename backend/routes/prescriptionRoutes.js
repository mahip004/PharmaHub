const express = require("express");
const router = express.Router();
const multer = require("multer");
const { jwtMiddleware } = require("../middleware/jwtMiddleware");
const { uploadPrescription, getMyPrescriptions } = require("../controllers/prescriptionController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/upload-prescription", jwtMiddleware, upload.single("prescription"), uploadPrescription);
router.get("/prescriptions", jwtMiddleware, getMyPrescriptions);

module.exports = router;
