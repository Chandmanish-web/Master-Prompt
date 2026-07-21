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

## Notes

This project is still evolving, and future phases will add the full attendance, task, leave, report, and notification modules.
