import React, { useState, useEffect } from "react";
import "./PaymentModal.css";

// Generates a fake transaction ID for demo purposes
const fakeTxnId = () =>
    "TXN" + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString().slice(-4);

// Formats card number input with spaces every 4 digits
const formatCardNumber = (val) =>
    val
        .replace(/\D/g, "")
        .substring(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();

// Format expiry as MM/YY
const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").substring(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
};

const STATES = { FORM: "form", PROCESSING: "processing", SUCCESS: "success" };

const PaymentModal = ({ amount, onSuccess, onClose }) => {
    const [tab, setTab] = useState("card"); // "card" | "upi"
    const [state, setState] = useState(STATES.FORM);
    const [txnId, setTxnId] = useState("");

    // Card fields
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    // UPI field
    const [upiId, setUpiId] = useState("");

    // Derived card display for the visual card preview
    const displayNumber = cardNumber
        ? cardNumber.replace(/ /g, "").replace(/(.{4})/g, "$1 ").trim()
        : "•••• •••• •••• ••••";

    const handlePay = (e) => {
        e.preventDefault();

        // Basic validation
        if (tab === "card") {
            if (cardNumber.replace(/ /g, "").length < 16) return alert("Enter a valid 16-digit card number.");
            if (!cardName.trim()) return alert("Enter cardholder name.");
            if (expiry.length < 5) return alert("Enter a valid expiry date.");
            if (cvv.length < 3) return alert("Enter a valid CVV.");
        } else {
            if (!upiId.includes("@")) return alert("Enter a valid UPI ID (e.g. name@bank).");
        }

        // Simulate processing
        setState(STATES.PROCESSING);
        const id = fakeTxnId();

        setTimeout(() => {
            setTxnId(id);
            setState(STATES.SUCCESS);
            setTimeout(() => onSuccess(id), 1800);
        }, 2200);
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && state === STATES.FORM && onClose()}>
            <div className="pm-modal">
                {/* Close button */}
                {state === STATES.FORM && (
                    <button className="pm-close" onClick={onClose}>✕</button>
                )}

                {/* ── FORM STATE ────────────────────────────────────────── */}
                {state === STATES.FORM && (
                    <>
                        <div className="pm-title">
                            <span className="pm-lock-icon">🔒</span>
                            Secure Payment
                        </div>

                        {/* Visual Card Preview */}
                        <div className="pm-card-preview">
                            <div className="pm-card-chip" />
                            <div className="pm-card-number">{displayNumber}</div>
                            <div className="pm-card-bottom">
                                <div>
                                    <div className="pm-card-label">Card Holder</div>
                                    <div>{cardName || "YOUR NAME"}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div className="pm-card-label">Expires</div>
                                    <div>{expiry || "MM/YY"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Amount badge */}
                        <div style={{ textAlign: "center" }}>
                            <span className="pm-amount-badge">Amount: ₹{amount}</span>
                        </div>

                        {/* Payment Method Tabs */}
                        <div className="pm-tabs">
                            <button
                                className={`pm-tab ${tab === "card" ? "active" : ""}`}
                                onClick={() => setTab("card")}
                            >
                                💳 Card
                            </button>
                            <button
                                className={`pm-tab ${tab === "upi" ? "active" : ""}`}
                                onClick={() => setTab("upi")}
                            >
                                📱 UPI
                            </button>
                        </div>

                        <form onSubmit={handlePay}>
                            {tab === "card" ? (
                                <>
                                    <div className="pm-field">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNumber}
                                            inputMode="numeric"
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            maxLength={19}
                                            autoComplete="cc-number"
                                        />
                                    </div>
                                    <div className="pm-field">
                                        <label>Cardholder Name</label>
                                        <input
                                            type="text"
                                            placeholder="Name on card"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                            autoComplete="cc-name"
                                        />
                                    </div>
                                    <div className="pm-row">
                                        <div className="pm-field">
                                            <label>Expiry</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={expiry}
                                                inputMode="numeric"
                                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                                maxLength={5}
                                                autoComplete="cc-exp"
                                            />
                                        </div>
                                        <div className="pm-field">
                                            <label>CVV</label>
                                            <input
                                                type="password"
                                                placeholder="•••"
                                                value={cvv}
                                                inputMode="numeric"
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                                                maxLength={4}
                                                autoComplete="cc-csc"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="pm-upi-box">
                                    <p>Enter your UPI ID to pay</p>
                                    <input
                                        type="text"
                                        placeholder="yourname@upi"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                    />
                                </div>
                            )}

                            <button type="submit" className="pm-pay-btn">
                                <span>🔒</span>
                                Pay ₹{amount} Now
                            </button>
                        </form>

                        <div className="pm-secure-note">
                            🛡️ 256-bit SSL encrypted · Demo payment · No real charges
                        </div>
                    </>
                )}

                {/* ── PROCESSING STATE ──────────────────────────────────── */}
                {state === STATES.PROCESSING && (
                    <div className="pm-processing">
                        <div className="pm-spinner" />
                        <h3>Processing Payment…</h3>
                        <p>Please do not close this window.</p>
                        <p style={{ marginTop: 8 }}>Connecting to bank securely…</p>
                    </div>
                )}

                {/* ── SUCCESS STATE ─────────────────────────────────────── */}
                {state === STATES.SUCCESS && (
                    <div className="pm-success">
                        <div className="pm-check-circle">✓</div>
                        <h3>Payment Successful!</h3>
                        <p>Your order has been placed.</p>
                        <p>You will be redirected shortly…</p>
                        <div className="pm-txn-id">Transaction ID: {txnId}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
