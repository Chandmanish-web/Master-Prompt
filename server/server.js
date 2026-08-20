const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino-http')();
const http = require('http');

require('express-async-errors');

const connectDB = require('./config/db');
const createIndexes = require('./config/createIndexes');
const errorHandler = require('./middleware/errorHandler');
const initializeSocket = require('./socket');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const taskRoutes = require('./routes/taskRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const teamRoutes = require('./routes/teamRoutes');

const { startAbsentJob } = require('./cron/markAbsent');

dotenv.config();

const app = express();

// Render runs behind a reverse proxy.
// This allows express-rate-limit to correctly identify client IPs.
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Security: require JWT secret in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is required in production environment.');
  process.exit(1);
}

// Secure headers
app.use(helmet());

// Logging middleware
app.use(pino);

// Basic rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

// CORS
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// API rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Additional security headers
app.use(
  helmet.hsts({
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  })
);

app.use(
  helmet.referrerPolicy({
    policy: 'strict-origin-when-cross-origin',
  })
);

app.use(helmet.permittedCrossDomainPolicies());

// Limit payload sizes
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

// Root route
app.get('/', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return res.redirect(clientUrl);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/teams', teamRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    await createIndexes();

    startAbsentJob();

    // Create HTTP server for Socket.IO
    const httpServer = http.createServer(app);
    
    // Initialize Socket.IO
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket ready for real-time connections`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();