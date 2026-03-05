const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  med_name: { type: String, required: true },
  med_desc: { type: String },
  usage: { type: String },
  dosage: { type: String },
  side_effects: { type: String },
  med_price: { type: Number },
  med_quantity: { type: Number },
});

module.exports = mongoose.model("Medicine", medicineSchema, "Medicines");
