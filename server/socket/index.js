const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware: Verify JWT on connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} (${socket.userRole}) connected: ${socket.id}`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join user to their role room
    socket.join(`role:${socket.userRole}`);

    // Broadcast user online status
    io.emit('user:online', {
      userId: socket.userId,
      role: socket.userRole,
      timestamp: new Date(),
    });

    // ============== ATTENDANCE EVENTS ==============
    
    // Handle check-in event from client
    socket.on('attendance:checkin', (data) => {
      // Broadcast to managers/admins who can view this user's attendance
      io.to(`role:manager`).to(`role:admin`).emit('attendance:checkin', {
        userId: socket.userId,
        userName: data.userName,
        checkInTime: data.checkInTime,
        status: data.status,
        timestamp: new Date(),
      });
    });

    // Handle check-out event from client
    socket.on('attendance:checkout', (data) => {
      // Broadcast to managers/admins who can view this user's attendance
      io.to(`role:manager`).to(`role:admin`).emit('attendance:checkout', {
        userId: socket.userId,
        userName: data.userName,
        checkOutTime: data.checkOutTime,
        timestamp: new Date(),
      });
    });

    // ============== TASK EVENTS ==============
    
    socket.on('task:created', (data) => {
      // Broadcast to assignee
      io.to(`user:${data.assignedTo}`).emit('task:created', data);
      // Broadcast to admins/managers
      io.to(`role:admin`).to(`role:manager`).emit('task:created', data);
    });

    socket.on('task:updated', (data) => {
      // Broadcast to relevant users
      io.to(`user:${data.assignedTo}`).emit('task:updated', data);
      io.to(`role:admin`).to(`role:manager`).emit('task:updated', data);
    });

    socket.on('task:statusChanged', (data) => {
      // Broadcast status change
      io.to(`role:admin`).to(`role:manager`).emit('task:statusChanged', {
        taskId: data.taskId,
        status: data.status,
        assignedTo: data.assignedTo,
        changedBy: socket.userId,
        timestamp: new Date(),
      });
    });

    // ============== LEAVE EVENTS ==============
    
    socket.on('leave:requested', (data) => {
      // Notify managers and admins
      io.to(`role:manager`).to(`role:admin`).emit('leave:requested', {
        leaveId: data.leaveId,
        userId: socket.userId,
        userName: data.userName,
        type: data.type,
        fromDate: data.fromDate,
        toDate: data.toDate,
        reason: data.reason,
        timestamp: new Date(),
      });
    });

    socket.on('leave:approved', (data) => {
      // Notify the employee
      io.to(`user:${data.userId}`).emit('leave:approved', {
        leaveId: data.leaveId,
        approvedBy: socket.userId,
        timestamp: new Date(),
      });
      // Broadcast to admins
      io.to(`role:admin`).emit('leave:approved', data);
    });

    socket.on('leave:rejected', (data) => {
      // Notify the employee
      io.to(`user:${data.userId}`).emit('leave:rejected', {
        leaveId: data.leaveId,
        rejectedBy: socket.userId,
        reason: data.reason,
        timestamp: new Date(),
      });
      // Broadcast to admins
      io.to(`role:admin`).emit('leave:rejected', data);
    });

    // ============== CHAT EVENTS ==============
    
    socket.on('chat:message', (data) => {
      // Broadcast message to all connected users
      io.emit('chat:message', {
        messageId: data.messageId,
        userId: socket.userId,
        userName: data.userName,
        message: data.message,
        timestamp: new Date(),
      });
    });

    socket.on('chat:typing', (data) => {
      // Broadcast typing indicator
      socket.broadcast.emit('chat:typing', {
        userId: socket.userId,
        userName: data.userName,
      });
    });

    socket.on('chat:stopTyping', (data) => {
      // Broadcast stop typing
      socket.broadcast.emit('chat:stopTyping', {
        userId: socket.userId,
      });
    });

    // ============== NOTIFICATION EVENTS ==============
    
    socket.on('notification:create', (data) => {
      // Send notification to specific user
      io.to(`user:${data.recipientId}`).emit('notification:new', {
        notificationId: data.notificationId,
        title: data.title,
        message: data.message,
        type: data.type,
        read: false,
        timestamp: new Date(),
      });
    });

    socket.on('notification:read', (data) => {
      // Only emit to the specific user
      io.to(`user:${socket.userId}`).emit('notification:marked_read', {
        notificationId: data.notificationId,
      });
    });

    // ============== DISCONNECT HANDLER ==============

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Broadcast user offline status
      io.emit('user:offline', {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

module.exports = initializeSocket;
