// server/routes/stripe.js
const express = require("express");
const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const useMockPayment = !STRIPE_KEY || STRIPE_KEY === "mock" || STRIPE_KEY === "dummy" || STRIPE_KEY === "sk_test_mock";

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, orderId } = req.body || {};
    const successUrl = `${FRONTEND_URL}/order-success?session_id=mock_session&orderId=${orderId || ""}`;

    if (useMockPayment) {
      console.log("Mock payment: redirecting to success (no Stripe key)");
      return res.json({ id: "mock_session", url: successUrl, mock: true });
    }

    const Stripe = require("stripe");
    const stripe = Stripe(STRIPE_KEY);
    const line_items = Array.isArray(items) && items.length > 0
      ? items.map((item) => ({
          price_data: {
            currency: "inr",
            product_data: {
              name: item.name || "Medicine",
              description: item.description || undefined,
            },
            unit_amount: Math.round((item.price || 0) * 100),
          },
          quantity: item.quantity || 1,
        }))
      : [
          {
            price_data: {
              currency: "inr",
              product_data: { name: "Medicine Order" },
              unit_amount: 10000,
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: successUrl,
      cancel_url: `${FRONTEND_URL}/cart`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ message: err.message || "Payment session failed" });
  }
});

module.exports = router;
