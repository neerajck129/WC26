# 🏆 World Cup Prediction Challenge 2026

A full-stack MERN web application for the FIFA World Cup Final Prediction Challenge. Users predict the winner and score, optionally register as blood donors, and compete on a leaderboard after the official result.

> **Not a gambling or betting platform. No real money involved.**

---

## 📁 Project Structure

```
worldcup2026/
├── frontend/          # React + Vite frontend
└── backend/           # Node.js + Express backend
```

---

## ✨ Features

- ⚽ World Cup Final score predictions with unique ticket IDs
- 🎫 Downloadable JPEG prediction tickets (html2canvas)
- 🩸 Optional blood donor registration with blood group
- 📱 Telegram bot notifications on every submission
- 🔒 JWT-protected admin dashboard
- 📊 Analytics with Recharts (team distribution, blood groups, daily trend)
- 🏆 Automatic scoring engine (up to 15 points)
- 📋 Paginated predictions table with search
- ⬇ Export to Excel (predictions, donors, leaderboard)
- 🎉 Animated leaderboard with confetti on publication
- ⏱ Live countdown timer to final kickoff
- 📅 Admin-configurable kickoff time and announcement date
- 🔐 Rate limiting and input sanitization

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Telegram Bot token (optional, for notifications)

---

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your API URL
```

---

### 2. Environment Variables

#### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/worldcup2026
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRES_IN=7d
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. MongoDB Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free account
2. Create a new cluster (free M0 tier is fine)
3. Under **Database Access**, create a user with read/write permissions
4. Under **Network Access**, add `0.0.0.0/0` (allow all IPs) for development
5. Click **Connect** → **Drivers** and copy the connection string
6. Replace `<password>` with your user's password in the connection string
7. Add the full string as `MONGODB_URI` in your `.env`

The app auto-creates the admin account on first login using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from your `.env`.

---

### 4. Telegram Bot Setup (Optional)

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow instructions
3. Copy the bot token → `TELEGRAM_BOT_TOKEN`
4. Start a conversation with your bot, then visit:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
5. Copy the `chat.id` value → `TELEGRAM_CHAT_ID`

---

### 5. Run Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open `http://localhost:5173` for the public site.  
Admin panel: `http://localhost:5173/admin`

---

## 🌐 Deployment

### Backend → Render

1. Push your `backend/` folder to a GitHub repository
2. Go to [Render](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: `Node`
5. Add all environment variables from `.env.example` under **Environment**
6. Deploy. Copy the live URL (e.g., `https://worldcup2026-backend.onrender.com`)

### Frontend → Vercel

1. Push your `frontend/` folder to a GitHub repository
2. Go to [Vercel](https://vercel.com) → **New Project**
3. Import your repo
4. Set the environment variable:
   ```
   VITE_API_URL=https://worldcup2026-backend.onrender.com/api
   ```
5. Deploy. Done!

> **Important:** Update `FRONTEND_URL` on Render to your Vercel URL to fix CORS.

---

## 🎮 Admin Guide

### First Login
Navigate to `/admin/login` and log in with your `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

### Workflow After the Final

1. **Admin → Results & Points**
2. Enter the official winner, winner's goals, opponent's goals
3. Click **Save Official Result**
4. Click **Calculate All Points** — scores all predictions automatically
5. Click **Publish Leaderboard** — makes `/leaderboard` visible to the public
6. The leaderboard page shows confetti + podium for top 3 winners

### Scoring System

| Correct Prediction | Points |
|---|---|
| Winner team | +5 |
| Winner's goals | +5 |
| Opponent's goals | +5 |
| **Maximum** | **15** |

**Tiebreak**: Earliest submission wins. Rank is shared for equal points.

---

## 📡 API Reference

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/predictions` | Submit a prediction |
| `GET` | `/api/predictions/stats` | Public stats (total, teams, settings) |
| `GET` | `/api/predictions/check/:phone` | Check if phone already submitted |
| `GET` | `/api/leaderboard` | Get published leaderboard |

### Admin (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Admin login |
| `GET` | `/api/auth/verify` | Verify token |
| `GET` | `/api/admin/stats` | Dashboard stats |
| `GET` | `/api/admin/predictions` | List predictions (paginated) |
| `DELETE` | `/api/admin/predictions/:id` | Delete prediction |
| `GET` | `/api/admin/donors` | Blood donors list |
| `POST` | `/api/admin/result` | Save official result |
| `POST` | `/api/admin/calculate` | Calculate all points |
| `POST` | `/api/admin/leaderboard/toggle` | Publish/hide leaderboard |
| `POST` | `/api/admin/submissions/toggle` | Open/close submissions |
| `POST` | `/api/admin/settings` | Update kickoff/announcement date |
| `POST` | `/api/admin/reset` | Reset entire competition |
| `GET` | `/api/admin/export/predictions` | Download predictions Excel |
| `GET` | `/api/admin/export/donors` | Download donors Excel |
| `GET` | `/api/admin/export/leaderboard` | Download leaderboard Excel |

---

## 🛡 Security Features

- JWT authentication for all admin routes
- Rate limiting: 100 req/15min globally, 3 prediction attempts/hour per IP
- Input sanitization and Mongoose schema validation
- One prediction per phone number (enforced at DB level)
- CORS restricted to frontend origin
- Environment variables for all secrets

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Charts | Recharts |
| Ticket Download | html2canvas |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JSON Web Tokens (JWT) |
| Notifications | Telegram Bot API |
| Export | xlsx (SheetJS) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📄 License

MIT — free to use and modify for non-commercial community events.
