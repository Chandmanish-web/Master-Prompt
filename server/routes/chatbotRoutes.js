const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { getHistory, sendMessage } = require('../controllers/chatbotController');

const router = express.Router();
router.use(protect);
router.get('/history', getHistory);
router.post(
  '/message',
  [body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')],
  validateRequest,
  sendMessage
);

module.exports = router;
