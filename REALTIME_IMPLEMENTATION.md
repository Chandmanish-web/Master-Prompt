# WorkTrack Real-Time Enhancement - Implementation Guide

## ✅ Completed Features

### 1. Interactive Attendance Calendar (`/attendance`)
**Files Modified/Created:**
- [client/src/components/AttendanceCalendar.jsx](client/src/components/AttendanceCalendar.jsx) - Enhanced with full interactivity
- [client/src/pages/AttendancePage.jsx](client/src/pages/AttendancePage.jsx) - New dedicated page
- [client/src/components/ui/Modal.jsx](client/src/components/ui/Modal.jsx) - Updated with animation & isOpen prop
- [client/src/App.jsx](client/src/App.jsx) - Added /attendance route
- [client/src/components/Navbar.jsx](client/src/components/Navbar.jsx) - Updated to link to /attendance

**Features:**
- ✅ Month navigation (prev/next buttons)
- ✅ Click-to-view day details in modal
- ✅ Check-in/out times with duration calculation
- ✅ Today indicator with live check-in/check-out buttons
- ✅ Color-coded status badges (Present, Late, Absent, Half-day, On Leave)
- ✅ Team view toggle for managers/admins
- ✅ Monthly summary statistics
- ✅ Responsive design with Tailwind CSS

### 2. Socket.IO Real-Time Infrastructure
**Files Created:**
- [server/socket/index.js](server/socket/index.js) - Socket.IO initialization
- [client/src/socket/socket.js](client/src/socket/socket.js) - Socket.IO client setup
- [client/src/hooks/useSocket.js](client/src/hooks/useSocket.js) - Custom React hooks for Socket

**Files Modified:**
- [server/server.js](server/server.js) - Integrated Socket.IO with HTTP server
- [client/src/App.jsx](client/src/App.jsx) - Auto-init Socket on login, auto-disconnect on logout
- [client/src/redux/attendanceSlice.js](client/src/redux/attendanceSlice.js) - Emit socket events on check-in/out

**Features:**
- ✅ JWT authentication on Socket handshake
- ✅ User & role-based rooms (user:{userId}, role:{role})
- ✅ Events: attendance:checkin, attendance:checkout, task:*, leave:*, chat:*, notification:*
- ✅ useSocket hooks for components (useSocketEvent, useSocketEmit)
- ✅ Auto-reconnection with exponential backoff
- ✅ Global socket instance accessible as window.__socket

### 3. Real-Time Chat (Socket.IO Migration)
**Files Modified:**
- [client/src/pages/Chat.jsx](client/src/pages/Chat.jsx) - Replaced 5-second polling with Socket.IO
  
**Features:**
- ✅ Real-time message events via Socket.IO
- ✅ Typing indicators ("user is typing..." with animation)
- ✅ Stop typing notifications
- ✅ No more 5-second polling interval

---

## 📦 Required NPM Packages

### Install on Server:
```bash
cd server
npm install socket.io
```

### Install on Client:
```bash
cd client
npm install socket.io-client
```

---

## 🔧 Environment Setup

### Client (.env.local or .env)
```
VITE_SERVER_URL=http://localhost:5000
```

If deploying to production:
```
VITE_SERVER_URL=https://your-api.render.com  # or your production backend URL
```

### Server (.env)
Already requires: `JWT_SECRET`, `MONGODB_URI`, `PORT`, `CLIENT_URL`

No new env vars needed for Socket.IO - it uses the same server and CLIENT_URL for CORS.

---

## 🚀 How to Test

### 1. Start the Application
```bash
# Terminal 1: Server
cd server
npm run dev

# Terminal 2: Client
cd client
npm run dev
```

### 2. Test Attendance Calendar
- Login as any user
- Click "Attendance" in navbar → `/attendance`
- Try:
  - Click a day with attendance data → opens modal with check-in/out times
  - Click "Check In" button → records current time
  - Click "Check Out" button → records current time
  - Previous/Next month buttons → load different months
  - (Managers/Admins only) "View Team Attendance" checkbox

### 3. Test Real-Time Features
- Open 2 browser windows, login as different users
- Send chat message in one → should appear instantly in other
- Watch "typing..." indicator when user types
- (Managers/Admins) Watch another user check-in → should see real-time notification

---

## 📋 Architecture Overview

### Socket.IO Room Structure
```
Connected User
├── user:userId          (personal notifications)
├── role:admin          (broadcast to all admins)
├── role:manager        (broadcast to all managers)
└── role:employee       (broadcast to all employees)
```

### Event Flow Example - Check-In
```
Employee clicks "Check In" 
  → API POST /api/attendance/check-in 
  → Redux thunk dispatches attendance:checkin socket event
  → Server broadcasts to role:manager & role:admin rooms
  → Managers/Admins see real-time update (via Socket.IO event listener)
```

---

## 🎯 Next Phase: Complete Real-Time Features

### Phase 4A: Live Notifications System
**To Implement:**
1. Create NotificationSlice in Redux
2. Add notification:new listener in useSocket hook
3. Create Notification component with badge
4. Add unread count badge to navbar
5. Emit notification:new on leave request/approval/task assignment

**Estimated Effort:** ~30 mins

### Phase 4B: Live Task Updates
**To Implement:**
1. Enhance TaskSlice to emit task:created, task:updated, task:statusChanged
2. Add socket event listeners to ManagerDashboard
3. Update Kanban columns in real-time without refresh
4. Add real-time notification for task assignments

**Estimated Effort:** ~45 mins

### Phase 4C: Live Leave Updates
**To Implement:**
1. Enhance LeaveSlice to emit leave:requested, leave:approved, leave:rejected
2. Add socket event listeners to AdminDashboard
3. Update pending leave table in real-time
4. Notify employee when leave is approved/rejected

**Estimated Effort:** ~30 mins

---

## 🔍 Files Summary

### Server (Backend)
```
server/
├── server.js                    [MODIFIED] - HTTP server with Socket.IO
├── socket/
│   └── index.js                 [NEW] - Socket.IO initialization
├── routes/
│   ├── attendanceRoutes.js     [EXISTING] - Attendance endpoints
│   ├── taskRoutes.js           [EXISTING] - Task endpoints
│   ├── leaveRoutes.js          [EXISTING] - Leave endpoints
│   ├── chatRoutes.js           [EXISTING] - Chat endpoints
│   └── authRoutes.js           [EXISTING] - Auth endpoints
└── controllers/
    ├── attendanceController.js [EXISTING] - Attendance logic
    ├── taskController.js       [EXISTING] - Task logic
    ├── leaveController.js      [EXISTING] - Leave logic
    ├── chatController.js       [EXISTING] - Chat logic
    └── authController.js       [EXISTING] - Auth logic
```

### Client (Frontend)
```
client/src/
├── App.jsx                      [MODIFIED] - Socket init & routes
├── pages/
│   ├── AttendancePage.jsx      [NEW] - Attendance page
│   ├── Chat.jsx                [MODIFIED] - Socket.IO real-time chat
│   ├── EmployeeDashboard.jsx   [EXISTING]
│   ├── ManagerDashboard.jsx    [EXISTING]
│   └── AdminDashboard.jsx      [EXISTING]
├── components/
│   ├── AttendanceCalendar.jsx  [MODIFIED] - Interactive calendar
│   ├── Navbar.jsx              [MODIFIED] - Updated links
│   └── ui/
│       └── Modal.jsx           [MODIFIED] - Animation + isOpen
├── socket/
│   └── socket.js               [NEW] - Socket.IO client setup
├── hooks/
│   └── useSocket.js            [NEW] - Custom Socket hooks
├── redux/
│   ├── attendanceSlice.js      [MODIFIED] - Socket event emission
│   ├── chatSlice.js            [EXISTING]
│   ├── taskSlice.js            [EXISTING]
│   ├── leaveSlice.js           [EXISTING]
│   └── authSlice.js            [EXISTING]
└── routes/
    └── PrivateRoute.jsx        [EXISTING]
```

---

## 🛠️ Deployment Checklist

Before deploying to production:

- [ ] Set `VITE_SERVER_URL` in client deployment environment
- [ ] Ensure server has `socket.io` npm package installed
- [ ] Ensure client has `socket.io-client` npm package installed
- [ ] Update server CORS to allow production client URL
- [ ] Test Socket.IO connection with real-time events
- [ ] Monitor Socket.IO connections in server logs
- [ ] Set up error logging for Socket.IO disconnections

---

## 🐛 Troubleshooting

### Socket.IO Connection Issues
**Problem:** "Authentication error: No token provided"
**Solution:** Ensure user is logged in before viewing pages with real-time features. Token is passed during Socket.IO handshake.

**Problem:** Messages/events not appearing in real-time
**Solution:** Check browser DevTools → Network tab → filter by "WS" to verify WebSocket connection. Fallback to polling should still work.

**Problem:** Socket connection drops frequently
**Solution:** Check server logs for errors, increase `reconnectionAttempts` or `reconnectionDelayMax` in [socket.js](client/src/socket/socket.js)

### Attendance Calendar Not Loading
**Problem:** "Unable to fetch report"
**Solution:** Verify backend API is running and returning `/attendance/report` with proper month format (YYYY-MM)

---

## 📚 Key Files Reference

### Socket.IO Server Setup
👉 [server/socket/index.js](server/socket/index.js)
- JWT verification on handshake
- Room management (user/role based)
- All event handlers

### Socket.IO Client Setup
👉 [client/src/socket/socket.js](client/src/socket/socket.js)
- Socket initialization with token
- Global socket instance
- Connection/reconnection logic

### Socket Hooks
👉 [client/src/hooks/useSocket.js](client/src/hooks/useSocket.js)
- `useSocketEvent(eventName, handler, deps)` - Listen to events
- `useSocketEmit()` - Emit events
- `useSocket()` - Combined hook

### Attendance Calendar
👉 [client/src/components/AttendanceCalendar.jsx](client/src/components/AttendanceCalendar.jsx)
- Interactive month calendar
- Day details modal
- Check-in/out buttons

---

## ✨ Next Steps

1. **Install packages:**
   ```bash
   npm install socket.io                    # server
   npm install socket.io-client             # client
   ```

2. **Test the app:**
   - Run `npm run dev` in both directories
   - Login and navigate to `/attendance`
   - Open chat and verify real-time messaging

3. **Implement Phase 4 features** (notifications, tasks, leaves)
   - Each feature ~30-45 minutes to implement
   - Follow the same Socket.IO event pattern

4. **Deploy to production**
   - Set environment variables
   - Verify WebSocket support on hosting (Render, Vercel, Railway, etc.)
   - Monitor real-time events in production

---

**Questions or issues? Check the troubleshooting section or review the Socket.IO documentation:**
- Socket.IO Docs: https://socket.io/docs/
- Socket.IO Examples: https://github.com/socketio/socket.io/tree/main/examples
