const { v4: uuidv4 } = require('uuid');
let Sentry;
try {
  Sentry = require('@sentry/node');
} catch (e) {
  Sentry = null;
}

const errorHandler = (err, req, res, next) => {
  const errorId = uuidv4();
  if (req.log) {
    req.log.error({ err, errorId }, 'Unhandled error');
  } else {
    console.error('Unhandled error', errorId, err);
  }

  if (Sentry && process.env.SENTRY_DSN) {
    try {
      Sentry.captureException(err, { extra: { errorId } });
    } catch (e) {
      // ignore Sentry errors
    }
  }

  const status = err.status || 500;
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : err.message, errorId });
};

module.exports = errorHandler;
