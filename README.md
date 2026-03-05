# Hackbyte 3.0 – AI-Powered Medicine Platform

Full-stack application where users upload a prescription, get medicines extracted via OCR + AI, understand them via a chatbot, and order medicines with cart, checkout, and payment.

---

## Architecture

```
frontend/          React 19 + Vite + React Router
backend/           Node.js + Express + MongoDB (auth, cart, orders, prescriptions, Stripe)
fastapi_backend/   FastAPI + Tesseract OCR + Gemini (prescription extraction, chatbot)
```

### Folder structure

| Area | Path | Purpose |
|------|------|---------|
| Frontend | `frontend/src/` | Pages, components, CartContext |
| Backend API | `backend/` | Express server, models, routes, controllers |
| OCR + AI | `fastapi_backend/app/` | Prescription OCR, medicine extraction, chatbot (Gemini) |

---

## Database schema (MongoDB)

- **Users** – email, password (hashed), name, phone, etc.
- **Medicines** – med_name, med_desc, usage, dosage, side_effects, med_price, med_quantity
- **Prescriptions** – userId, extractedText, medicines[{ name, dosage, frequency }]
- **Cart** – userId, items[{ medicineId, quantity, name, price }]
- **Orders** – userId, items[], totalAmount, status, paymentMethod, shippingAddress
- **Addresses** – userId, street, city, state, pincode, phone, isDefault

---

## API endpoints (Node backend, base: `http://localhost:5000`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Sign up |
| POST | `/auth/login` | No | Login (returns token, userId) |
| GET | `/api/medicines` | No | List medicines |
| GET | `/api/medicines/search?name=` | No | Search medicine by name |
| POST | `/api/upload-prescription` | JWT | Upload image/text → OCR + save; returns extracted medicines |
| GET | `/api/prescriptions` | JWT | List current user’s prescriptions |
| GET | `/api/cart` | JWT | Get cart |
| POST | `/api/cart` | JWT | Add item `{ medicineId, quantity }` |
| PUT | `/api/cart` | JWT | Update/remove item `{ medicineId, quantity }` (0 = remove) |
| POST | `/api/cart/add-from-prescription` | JWT | Add list `{ medicines: [{ medicineId or name, quantity }] }` |
| POST | `/api/orders` | JWT | Create order from cart `{ shippingAddress, paymentMethod }` |
| GET | `/api/orders` | JWT | List my orders |
| GET | `/api/orders/:id` | JWT | Get order by id |
| PATCH | `/api/orders/:id/status` | JWT | Update status (e.g. `{ status: "paid" }`) |
| GET | `/api/addresses` | JWT | List addresses |
| POST | `/api/addresses` | JWT | Add address |
| PUT | `/api/addresses/:id` | JWT | Update address |
| POST | `/api/stripe/create-checkout-session` | No | Create Stripe session; body: `{ items[], orderId?, success_url?, cancel_url? }` |

---

## FastAPI endpoints (base: `http://localhost:8000`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat` | Chatbot; body `{ user_input }` |
| POST | `/extract_text/` | OCR from image (multipart `file`) |
| POST | `/validate_prescription/` | Extract medicine names + info; body `{ text }` |
| POST | `/extract_medicines/` | Structured list; body `{ text }` → `{ medicines: [{ name, dosage, frequency }] }` |
| POST | `/medicine_info/` | Medicine info for list; body `{ medicines: ["Name1", ...] }` |

---

## Setup

### 1. Backend (Node)

```bash
cd backend
cp .env.example .env   # edit MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, FASTAPI_URL
npm install
node app.js            # or: npx nodemon app.js
# Runs on http://localhost:5000
```

### 2. FastAPI (OCR + chatbot)

```bash
cd fastapi_backend/app
# Optional: set GEMINI_API_KEY for full AI (otherwise fallback responses)
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL, VITE_FASTAPI_URL, VITE_STRIPE_PUBLISHABLE_KEY
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. MongoDB

Have MongoDB running locally (or set `MONGO_URI` in `backend/.env`). Create some medicines in the `Medicines` collection for shop and prescription matching.

---

## End-to-end flow

1. **Sign up / Log in** – JWT stored in `localStorage`; used for cart, orders, prescriptions.
2. **Upload prescription** – User uploads image or pastes text → Node calls FastAPI OCR → medicines extracted and saved → user sees list with “Add all to cart”.
3. **Chatbot** – User can ask about medicines; optional prescription upload in chat uses FastAPI OCR + Gemini.
4. **Shop** – Browse/search medicines; “Add to Cart” uses cart API (logged-in only).
5. **Cart** – View/edit quantities, remove items, “Proceed to Checkout”.
6. **Checkout** – Select or add address, choose payment (Card / UPI mock / COD) → place order → if Card, redirect to Stripe → success → Order success page; order status can be set to “paid” when returning with `session_id`.
7. **Orders** – Order history and details available via `/api/orders` (e.g. from profile or order-success page).

---

## Env summary

- **Backend:** `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRATION`, `FASTAPI_URL`, `FRONTEND_URL`, `STRIPE_SECRET_KEY`
- **Frontend:** `VITE_API_URL`, `VITE_FASTAPI_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`
- **FastAPI:** `GEMINI_API_KEY` (optional; enables full Gemini responses)
