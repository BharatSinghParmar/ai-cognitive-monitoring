# 🧠 AI-Based Cognitive Monitoring

An AI-powered online exam proctoring and cognitive analytics platform. Monitors student stress, detects integrity violations, and grades answers using NLP — all in real-time.

## ✨ Features

- 🎥 **Face Biometrics** — Live face detection using face-api.js (TinyFaceDetector + 68 landmarks)
- 😰 **Stress Detection** — Visual (EAR), acoustic (FFT), and keystroke dynamics analysis
- 🛡️ **Proctoring** — Tab-switch detection, copy-paste blocking, fullscreen enforcement
- 🤖 **AI Grading** — TensorFlow.js Universal Sentence Encoder for semantic similarity scoring
- 🔍 **Plagiarism Detection** — Python FastAPI microservice + JS string-similarity fallback
- 📊 **Analytics Dashboards** — Per-student performance, integrity timeline, stress radar
- 🏋️ **Training Module** — Practice sessions with topic-based question banks

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Recharts |
| Face AI | face-api.js (TensorFlow.js) |
| NLP | @tensorflow-models/universal-sentence-encoder |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas |
| Plagiarism | Python FastAPI + difflib |

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.9+ (optional, for plagiarism microservice)

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI
npm install
npm start
# Runs on http://localhost:5001
```

### 2. Frontend
```bash
cd Frontend
cp .env.example .env.local
# Edit .env.local — set REACT_APP_API_URL=http://localhost:5001
npm install
npm start
# Runs on http://localhost:3000
```

## 🌐 Vercel Deployment

This project is pre-configured for [Vercel](https://vercel.com) with `vercel.json` in both `backend/` and `Frontend/`.

### Deploy Backend
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import this GitHub repo, set **Root Directory** → `backend`
3. Add Environment Variables:
   - `MONGO_URI` → your MongoDB Atlas connection string
4. Deploy ✅

### Deploy Frontend
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import this GitHub repo again, set **Root Directory** → `Frontend`
3. Add Environment Variables:
   - `REACT_APP_API_URL` → your deployed backend Vercel URL (e.g. `https://your-backend.vercel.app`)
4. Deploy ✅

### MongoDB Atlas (Free Database)
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a **Free M0** cluster
3. Whitelist all IPs: `0.0.0.0/0`
4. Copy the connection string → use as `MONGO_URI`

## 👤 Roles

| Role | Access |
|---|---|
| **Student** | Register (face scan), take exams, view results, training hub |
| **Admin** | Create exams, view all responses, manual review, dashboards |

## 📐 Scoring Formula

```
Final Score = (Accuracy × 60%) + (Productivity × 40%)
Productivity = 100 - stressPenalty - (warnings × 10)
```

## 📁 Project Structure

```
├── backend/
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express API routes
│   ├── utils/               # NLP similarity + plagiarism helpers
│   ├── questionBank/        # Training questions
│   ├── server.js            # Entry point (works local + Vercel serverless)
│   ├── vercel.json          # Vercel serverless config
│   └── plagiarism_service.py
└── Frontend/
    ├── public/models/       # face-api.js neural network weights
    ├── vercel.json          # Vercel SPA routing config
    └── src/
        ├── components/      # BehaviorMonitor, charts, nav
        ├── pages/           # 14 page components
        └── utils/           # IntegrityScoreEngine
```