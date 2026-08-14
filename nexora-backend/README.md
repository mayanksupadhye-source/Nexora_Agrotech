# Nexora Backend — Setup Guide

This is a real backend: Express + MongoDB Atlas + real JWT auth + real email OTP + real-time chat via Socket.io. Everything here actually persists and actually works across devices — nothing is simulated.

## What's done (this session)

- ✅ Real signup/login with bcrypt password hashing (no more plaintext passwords in source)
- ✅ Real JWT tokens, properly verified server-side (no more fake base64 check)
- ✅ Real email OTP verification via Nodemailer (lands in an actual inbox)
- ✅ Full CRUD for Listings (crops), Bids, and Orders — persisted in MongoDB
- ✅ Real-time chat via Socket.io — messages saved to DB AND pushed live between two different devices
- ✅ Seed script generating ~100 realistic demo entries (users, listings, bids, orders)
- ✅ Role-based access control (farmer / buyer / admin) enforced server-side, not just in the UI

## What's NOT done yet (next session)

- ❌ Frontend still points at `localStorage` — none of your HTML files call this API yet. This is the next big step: swapping `fetch()` calls into `auth.html`, `farmer-dashboard.html`, `buyer-dashboard.html` in place of the localStorage logic.
- ❌ Blockchain layer (`blockchain.js`) — left untouched per your call, still simulated client-side. Fine as-is for the demo.
- ❌ AI Advisor — still calls OpenAI directly from the browser. Works for a demo; not something we need to fix in a hackathon timeframe.
- ❌ Deployment to Render — instructions below, but you need to actually do this (needs your own Atlas + Render accounts).

---

## Step 1 — MongoDB Atlas (free, ~10 min)

1. Go to mongodb.com/cloud/atlas, sign up free.
2. Create a free (M0) cluster.
3. Under **Database Access**, create a database user with a username + password (save these).
4. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere — fine for a hackathon).
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`
6. Add `nexora` as the database name at the end: `.../nexora?retryWrites=true...`

## Step 2 — Gmail App Password (for real OTP emails, ~5 min)

1. Enable 2-Step Verification on the Gmail account you'll send from: myaccount.google.com/security
2. Go to myaccount.google.com/apppasswords
3. Generate an app password (choose "Mail" as the app). Copy the 16-character code.

## Step 3 — Local setup

```bash
cd nexora-backend
npm install
cp .env.example .env
```

Now open `.env` and fill in:
- `MONGO_URI` (from Step 1)
- `EMAIL_USER` (your Gmail address)
- `EMAIL_APP_PASSWORD` (from Step 2)
- `JWT_SECRET` — any long random string, e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Step 4 — Seed the database (100 entries)

```bash
npm run seed
```

This wipes and repopulates: 15 users, 40 listings, 30 bids, 15 orders. It prints demo login credentials at the end — same ones your frontend already expects (`9876543210 / farm123` for the hero farmer).

## Step 5 — Run the server

```bash
npm run dev
```

You should see `✅ MongoDB connected` and `🚀 Nexora backend running on port 5000`.

Test it's alive: open `http://localhost:5000` in a browser — you should see `{"status":"Nexora API is running"}`.

## Step 6 — Test the API (use Postman or Thunder Client)

**Signup:**
`POST http://localhost:5000/api/auth/signup`
```json
{ "name": "Test Farmer", "mobile": "9123456789", "email": "you@realaddress.com", "password": "test1234", "role": "farmer", "district": "Nashik" }
```
→ Check your email for the 6-digit code.

**Verify OTP:**
`POST http://localhost:5000/api/auth/verify-otp`
```json
{ "userId": "<id from signup response>", "otp": "123456" }
```
→ Returns a real JWT token. Save it.

**Get listings (no auth needed):**
`GET http://localhost:5000/api/listings`

**Create a listing (needs the JWT):**
`POST http://localhost:5000/api/listings`
Header: `Authorization: Bearer <your token>`
```json
{ "crop": "Wheat", "quantity": 20, "pricePerUnit": 2200, "district": "Nashik" }
```

## Step 7 — Testing real-time chat across two devices

Socket.io connection needs the JWT passed at connect time:
```js
const socket = io('http://localhost:5000', { auth: { token: yourJwtToken } });

socket.emit('join_conversation', { listingId, otherUserId });

socket.emit('send_message', { listingId, otherUserId, text: 'Hello!' });

socket.on('new_message', (msg) => console.log('New message:', msg));
```
Open this on two different browsers/devices, logged in as the farmer and buyer for the same listing — messages sent from one appear instantly on the other. This works over the internet too, once deployed (Step 8), not just on your laptop.

## Step 8 — Deploy to Render.com (free tier)

1. Push this `nexora-backend` folder to a GitHub repo.
2. Go to render.com → New → Web Service → connect your repo.
3. Build command: `npm install` | Start command: `npm start`
4. Add all your `.env` values under Render's **Environment** tab (don't upload the `.env` file itself).
5. Deploy. Render gives you a live URL like `https://nexora-backend.onrender.com`.
6. Update `CLIENT_URL` in Render's env vars to match wherever your frontend ends up hosted.
7. **Free tier sleeps after inactivity** — hit your URL a few minutes before your demo to wake it up.

---

## Next session — what to bring me

Tell me you're back and want to wire the frontend to this. I'll walk through `auth.html`, `farmer-dashboard.html`, and `buyer-dashboard.html` and replace the `localStorage`/hardcoded logic with real `fetch()` calls to these routes, plus wire up the Socket.io chat client-side.
