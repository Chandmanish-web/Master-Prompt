# WorkTrack Real-Time Implementation - Quick Start

## ⚡ What Was Built

Your WorkTrack app now has **3 major real-time features**:

### 1️⃣ Interactive Attendance Calendar
- **Route:** `/attendance`
- **Features:** Month nav, click-to-view details, live check-in/out, team view
- **Files:** `AttendancePage.jsx`, enhanced `AttendanceCalendar.jsx`

### 2️⃣ Socket.IO Infrastructure  
- **Real-time events:** attendance, tasks, leaves, chat, notifications
- **JWT auth:** Secure WebSocket connections
- **Room system:** User & role-based broadcasts
- **Files:** `server/socket/index.js`, `client/src/socket/socket.js`, `useSocket` hooks

### 3️⃣ Real-Time Chat
- **Replaced:** 5-second polling → instant Socket.IO events
- **New features:** Typing indicators, real-time message updates
- **Files:** Updated `Chat.jsx` with Socket.IO listeners

---

## 🎯 Quick Setup (5 minutes)

### Step 1: Install Socket.IO
```bash
# In server directory
npm install socket.io

# In client directory  
npm install socket.io-client
```

### Step 2: Add Environment Variable
Create or update `.env.local` in **client** folder:
```
VITE_SERVER_URL=http://localhost:5000
```

### Step 3: Run Both Apps
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### Step 4: Test Real-Time Features
1. Login to http://localhost:5173
2. Click "Attendance" → `/attendance`
3. Click "Check In" button → See instant update
4. Go to "Chat" → Send message → See it instantly (no refresh needed!)

---

## 📂 Files Changed/Created

### Server (Backend)
- ✅ **NEW:** `server/socket/index.js` - Socket.IO server
- ✅ **MODIFIED:** `server/server.js` - HTTP + Socket.IO integration
- ✅ **MODIFIED:** `client/src/redux/attendanceSlice.js` - Socket event emission

### Client (Frontend)
- ✅ **NEW:** `client/src/pages/AttendancePage.jsx` - Calendar page
- ✅ **NEW:** `client/src/socket/socket.js` - Socket.IO client init
- ✅ **NEW:** `client/src/hooks/useSocket.js` - Custom hooks
- ✅ **MODIFIED:** `client/src/components/AttendanceCalendar.jsx` - Interactive calendar
- ✅ **MODIFIED:** `client/src/components/ui/Modal.jsx` - With animations
- ✅ **MODIFIED:** `client/src/pages/Chat.jsx` - Real-time via Socket.IO
- ✅ **MODIFIED:** `client/src/App.jsx` - Socket init on login
- ✅ **MODIFIED:** `client/src/components/Navbar.jsx` - Updated routes

---

## 🔄 Real-Time Event Flow

### Example: User Check-In
```
1. Employee clicks "Check In"
   ↓
2. API call: POST /api/attendance/check-in
   ↓
3. Redux action emits: socket.emit('attendance:checkin', {...})
   ↓
4. Server broadcasts to role:manager & role:admin rooms
   ↓
5. Managers/Admins instantly see update (no refresh!)
```

### Socket.IO Events Configured
- `attendance:checkin` - Employee checked in
- `attendance:checkout` - Employee checked out
- `task:created` - New task assigned
- `task:updated` - Task updated
- `task:statusChanged` - Task status changed
- `leave:requested` - Leave request submitted
- `leave:approved` - Leave approved
- `leave:rejected` - Leave rejected
- `chat:message` - Chat message sent
- `chat:typing` - User typing
- `notification:new` - New notification

---

## 🧪 Test Real-Time Features

### Test Attendance Calendar
- [ ] Navigate to `/attendance`
- [ ] Click "Check In" → Should record timestamp
- [ ] Click "Check Out" → Should record timestamp
- [ ] Click a date → Modal shows check-in/out times
- [ ] Navigate months → Data loads dynamically
- [ ] (Managers only) Toggle "View Team Attendance"

### Test Real-Time Chat
- [ ] Open 2 browser windows, login as different users
- [ ] Send message in one → Appears instantly in other
- [ ] Type in message box → Other user sees "is typing..."
- [ ] Stop typing → "is typing..." disappears

### Test Attendance Real-Time Updates (2 windows)
- [ ] Window 1: Employee checks in
- [ ] Window 2: Manager views attendance → See update instantly

---

## 📋 Environment Variables

### Client (`.env.local`)
```
VITE_SERVER_URL=http://localhost:5000  # Change for production
```

### Server (`.env`) - Already exists
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongo_uri
CLIENT_URL=http://localhost:5173  # For CORS
```

---

## 🚀 Production Deployment

### Before Deploying:
1. Update `VITE_SERVER_URL` in client build environment
2. Ensure server has Socket.IO package installed
3. Enable WebSocket on your hosting (works on Render, Railway, Heroku, etc.)
4. Update server `CLIENT_URL` to your production domain

### Render.com Example:
```
SERVER environment variables:
- CLIENT_URL=https://your-worktrack-client.vercel.app
- JWT_SECRET=your_secure_secret
- MONGODB_URI=your_mongo_uri

CLIENT environment variable (build settings):
- VITE_SERVER_URL=https://your-worktrack-server.render.com
```

---

## 🐛 Troubleshooting

### Problem: "Socket.IO not connecting"
**Check:**
- Is backend running? (`npm run dev` in server)
- Is `VITE_SERVER_URL` set correctly in client?
- Are packages installed? (`npm install socket.io socket.io-client`)

### Problem: "Real-time updates not working"
**Check:**
- Are you logged in? (Token required for Socket auth)
- Open DevTools → Network → WS tab → See WebSocket connection?
- Check server logs for socket connection messages

### Problem: "Attendance Calendar showing blank"
**Check:**
- Does backend `/api/attendance/report` endpoint return data?
- Try with different month format: `YYYY-MM` (e.g., `2025-01`)

---

## 📚 Architecture

```
MERN Stack + Socket.IO
├── React + Redux Toolkit (Client State)
├── Socket.IO (Real-Time Events)
├── Express + MongoDB (Backend)
└── JWT Auth (Secure WebSocket Connections)

Data Flow:
UI Event → Redux Action → API Call → Socket Emit → Server Broadcast → Connected Users
```

---

## ✨ What's Next?

### Option 1: Implement More Real-Time Features
- [ ] Live Notifications (badge with unread count)
- [ ] Live Task Updates (Kanban boards refresh instantly)
- [ ] Live Leave Updates (pending requests update in real-time)

**Estimated time:** ~2 hours total for all three

### Option 2: Enhance User Experience
- [ ] Add user online/offline indicators
- [ ] Notification sound alerts
- [ ] Desktop notifications
- [ ] Presence indicators in chat

**Estimated time:** ~1.5 hours

### Option 3: Performance Optimization
- [ ] Implement pagination for large chat histories
- [ ] Optimize Socket.IO message size
- [ ] Add message read receipts
- [ ] Cache attendance data

**Estimated time:** ~2 hours

---

## 📞 Need Help?

### Common Issues & Fixes:

1. **"Cannot find module 'socket.io'"**
   ```bash
   npm install socket.io socket.io-client
   ```

2. **Port 5000 already in use**
   ```bash
   # Change PORT in .env or terminal
   PORT=5001 npm run dev
   ```

3. **CORS errors with Socket.IO**
   - Verify `CLIENT_URL` in server `.env`
   - Check server Socket.IO CORS config in `socket/index.js`

4. **Token authentication failing**
   - Make sure user is logged in
   - Check JWT token is being passed in socket handshake
   - Verify `JWT_SECRET` is set in server `.env`

---

## 🎉 You're All Set!

Your WorkTrack app is now **fully real-time** with:
- ✅ Interactive attendance calendar
- ✅ Socket.IO infrastructure
- ✅ Real-time chat
- ✅ Real-time attendance updates (for managers/admins)

**Next steps:**
1. `npm install socket.io socket.io-client`
2. Add `VITE_SERVER_URL` to client `.env.local`
3. Run both servers: `npm run dev`
4. Test at http://localhost:5173

---

**For detailed implementation guide, see:** [REALTIME_IMPLEMENTATION.md](REALTIME_IMPLEMENTATION.md)
