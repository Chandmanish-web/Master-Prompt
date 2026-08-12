const { v4: uuidv4 } = require('uuid');
const errorHandler = (err, req, res, next) => {
  const errorId = uuidv4();
  if (req.log) {
    req.log.error({ err, errorId }, 'Unhandled error');
  } else {
    console.error('Unhandled error', errorId, err);
  }

  const status = err.status || 500;
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : err.message, errorId });
};

module.exports = errorHandler;
