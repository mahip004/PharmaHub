# Run the app without MongoDB or Stripe (static data + mock payment)

Use this to try the app quickly with **in-memory data** and **dummy payment**. No MongoDB or Stripe keys needed.

---

## 1. Backend (Node)

In PowerShell:

```powershell
cd backend
```

Create a `.env` file (copy from example):

```powershell
copy .env.example .env
```

Edit `.env` and set:

- `USE_MEMORY_STORE=true` (use static in-memory data, no MongoDB)
- Leave `MONGO_URI` commented out or delete it
- `STRIPE_SECRET_KEY=mock` (dummy payment, no real Stripe)
- `JWT_SECRET=any_random_string`

Example `.env`:

```env
PORT=5000
USE_MEMORY_STORE=true
JWT_SECRET=my_secret_123
JWT_EXPIRATION=7d
FASTAPI_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=mock
```

Install and start:

```powershell
npm install
node app.js
```

You should see: **"Running with in-memory store (no MongoDB)"** and **"Server running on port 5000"**.

---

## 2. Frontend (React)

Open a **new** PowerShell window:

```powershell
cd frontend
copy .env.example .env
```

Edit `.env` and set:

```env
VITE_API_URL=http://localhost:5000
VITE_FASTAPI_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_mock
```

Then:

```powershell
npm install
npm run dev
```

Open **http://localhost:5173** in the browser.

---

## 3. Optional: FastAPI (OCR + chatbot)

For **prescription upload (OCR)** and **chatbot**, run the FastAPI backend in another terminal:

```powershell
cd fastapi_backend\app
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If you skip this, prescription upload can still work if you **paste prescription text** instead of uploading an image. Chatbot will use fallback replies without Gemini.

---

## What works with static/mock setup

- **Sign up / Log in** – users stored in memory
- **Shop** – 5 static medicines (Paracetamol, Amoxicillin, etc.)
- **Cart** – add, edit, remove
- **Checkout** – add address, place order
- **Payment** – “Pay with Card” redirects to order success (no real payment)
- **Orders** – order history in memory
- **Prescriptions** – upload text (or image if FastAPI is running); “Add all to cart”
- **Profile / Addresses** – saved in memory

Data is lost when you stop the Node server (in-memory only).
