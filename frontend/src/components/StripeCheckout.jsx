import React from "react";
import axios from "axios";

const StripeCheckout = () => {
  const handleCheckout = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/stripe/create-checkout-session`
      );
      const sessionId = res.data.id;

      const stripe = await window.Stripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      ); // make sure .env is set
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error("Error during checkout:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Hackathon Registration - $50</h2>
      <button
        onClick={handleCheckout}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Pay with Card
      </button>
    </div>
  );
};

export default StripeCheckout;
