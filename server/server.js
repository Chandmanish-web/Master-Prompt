const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Sentry = require('@sentry/node');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino-http')();
require('express-async-errors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const taskRoutes = require('./routes/taskRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const { startAbsentJob } = require('./cron/markAbsent');

dotenv.config();

// Initialize Sentry if DSN provided
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'development' });
}

const app = express();
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

// Sentry request handler (must be before routes)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

// Basic rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:4173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Tighten Helmet defaults: explicit CSP, HSTS, referrer and permissions policies
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", allowedOrigin],
      imgSrc: ["'self'", 'data:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

app.use(
  helmet.hsts({
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  })
);

app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use(helmet.permittedCrossDomainPolicies());

// CSP nonce middleware: generate nonce per request and set CSP header including nonce
app.use((req, res, next) => {
  const nonce = Buffer.from(String(Date.now() + Math.random())).toString('base64').slice(0, 16);
  res.locals.nonce = nonce;

  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `connect-src 'self' ${allowedOrigin}`,
    `img-src 'self' data:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `frame-ancestors 'none'`,
  ];

  if (process.env.NODE_ENV === 'production') {
    cspDirectives.push("upgrade-insecure-requests");
    // set report-uri (legacy) and report-to
    cspDirectives.push("report-uri /api/csp-report");
  } else {
    // In development, allow unsafe-inline to avoid breaking HMR scripts
    cspDirectives.push("script-src 'self' 'unsafe-inline'");
  }

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  next();
});

// CSP report endpoint
app.post('/api/csp-report', express.json({ type: ['application/csp-report', 'application/json'] }), (req, res) => {
  req.log && req.log.warn({ cspReport: req.body }, 'CSP violation reported');
  res.status(204).send();
});

// Limit payload sizes to mitigate large payload attacks
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);

const startServer = async () => {
  try {
    await connectDB();
    startAbsentJob();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
