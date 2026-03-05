const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const useMock = !RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === "rzp_test_REPLACE_ME";

// POST /api/payment/create-order
// Creates a Razorpay order (or returns mock if no keys set)
router.post("/create-order", async (req, res) => {
  try {
    const { amount, orderId } = req.body; // amount in rupees
    const amountPaise = Math.round(parseFloat(amount) * 100); // Razorpay expects paise

    if (useMock) {
      // Mock mode: return a fake order so frontend can skip straight to success
      return res.json({
        id: "mock_razorpay_order_" + Date.now(),
        amount: amountPaise,
        currency: "INR",
        mock: true,
      });
    }

    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `receipt_${orderId || Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ message: err.message || "Failed to create payment order" });
  }
});

// POST /api/payment/verify-payment
// Verifies Razorpay payment signature after user pays
router.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || razorpay_order_id.startsWith("mock_")) {
      // Mock mode — auto verify
      return res.json({ verified: true, mock: true });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Razorpay verify-payment error:", err);
    res.status(500).json({ message: "Verification error" });
  }
});

module.exports = router;
