const mongoose = require("mongoose");

const prescriptionMedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: "" },
  frequency: { type: String, default: "" },
  rawText: { type: String },
});

const prescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String }, // optional: store uploaded image path/URL if needed
  extractedText: { type: String },
  medicines: [prescriptionMedicineSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
