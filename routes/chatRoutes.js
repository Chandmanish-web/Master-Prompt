const express = require('express');
const { getOrCreateChat, getMyChats, sendMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', getOrCreateChat);
router.get('/', getMyChats);
router.post('/:chatId/messages', sendMessage);
router.get('/:chatId', getChatHistory);

module.exports = router;
