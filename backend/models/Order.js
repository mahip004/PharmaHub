const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  paymentMethod: { type: String, enum: ["card", "upi", "cod", "online"], default: "card" },
  paymentId: { type: String }, // Stripe session or mock id
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
