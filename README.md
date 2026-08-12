# WorkTrack

WorkTrack is a full-stack MERN application for company attendance and work management. It supports three user roles — Admin, Manager, and Employee — and includes authentication, attendance tracking, task workflows, leave management, analytics, notifications, and real-time-style chat.

## Overview

WorkTrack is designed to help organizations manage day-to-day operations in a single platform. The system includes role-based access control and a modular architecture so each team can work within a shared workflow.

## Features

- Authentication with JWT
- Role-based access for Admin, Manager, and Employee
- Attendance check-in/check-out flow
- Task assignment, submission, and review workflow
- Leave management
- Reports and analytics foundation
- Notifications and in-app chat
- Persistent chat history stored in MongoDB

## Tech Stack

### Frontend
- React
- Vite
- Redux Toolkit
- Tailwind CSS
- React Router
- Axios
- React Hook Form

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```text
worktrack/
  client/       # React frontend
  server/       # Express backend
```

## Getting Started

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Set the required environment variables in the server `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

Then verify Atlas connectivity:

```bash
cd server
npm run check-mongo
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` by default, and the backend API uses `http://localhost:5000`.

## Current Status

The project currently includes:
- complete frontend and backend scaffolding
- authentication and JWT-based user session handling
- role-based dashboards
- protected chat module with MongoDB persistence
- Render deployment manifest in `render.yaml`

## Notes

This project is still evolving, and future phases will add the full attendance, task, leave, report, and notification modules.

## Progress Log (automated)

- Date: 2026-07-21
- Server tests: ran `npm test` in `server` — 3 tests passed (see `server/tests/`).
- Git: performed initial local commit (`first commit`) with 24 files added/changed.
- Remote push: attempted push to `https://github.com/Chandmanish-web/Master-Prompt.git` but failed with HTTP 403 (permission denied). The repository accepts pushes only from authorized GitHub accounts or via authenticated methods (PAT or SSH key).

Next steps to finish push:

- Option A (recommended): Create a GitHub Personal Access Token (PAT) and use HTTPS push. Then run:

```powershell
cd "C:\Users\Lenovo\OneDrive\Desktop\Master Prompt"
git push -u origin main
```

- Option B: Configure SSH keys and switch remote to SSH, then push:

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-agent -s
ssh-add $env:USERPROFILE\\.ssh\\id_ed25519
# copy id_ed25519.pub to GitHub > Settings > SSH and GPG keys
git remote set-url origin git@github.com:Chandmanish-web/Master-Prompt.git
git push -u origin main
```

If you want, I can help generate the SSH key, configure it on GitHub, or retry the push after you provide credentials.
