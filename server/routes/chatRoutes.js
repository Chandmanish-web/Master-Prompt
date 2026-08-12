const express = require('express');
const { body, param, query } = require('express-validator');
const { getOrCreateChat, getMyChats, sendMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

router.post(
	'/',
	[
		body('otherUserId')
			.exists()
			.withMessage('otherUserId is required')
			.bail()
			.custom((value) => value === 'ai-assistant' || /^[0-9a-fA-F]{24}$/.test(value))
			.withMessage('otherUserId must be a valid user id or "ai-assistant"'),
	],
	validateRequest,
	getOrCreateChat
);

router.get('/', getMyChats);

router.post(
	'/:chatId/messages',
	[param('chatId').isMongoId().withMessage('Invalid chat id'), body('text').trim().isLength({ min: 1 }).withMessage('Message text is required')],
	validateRequest,
	sendMessage
);

router.get(
	'/:chatId',
	[
		param('chatId').isMongoId().withMessage('Invalid chat id'),
		query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
		query('cursor').optional().isISO8601().withMessage('Invalid cursor'),
	],
	validateRequest,
	getChatHistory
);

// Export validators for integration tests
const createChatValidators = [
  body('otherUserId')
    .exists()
    .withMessage('otherUserId is required')
    .bail()
    .custom((value) => value === 'ai-assistant' || /^[0-9a-fA-F]{24}$/.test(value))
    .withMessage('otherUserId must be a valid user id or "ai-assistant"'),
];

const messageValidators = [param('chatId').isMongoId().withMessage('Invalid chat id'), body('text').trim().isLength({ min: 1 }).withMessage('Message text is required')];

const chatHistoryValidators = [param('chatId').isMongoId().withMessage('Invalid chat id'), query('limit').optional().isInt({ min: 1, max: 200 }).toInt(), query('cursor').optional().isISO8601().withMessage('Invalid cursor')];

router.createChatValidators = createChatValidators;
router.messageValidators = messageValidators;
router.chatHistoryValidators = chatHistoryValidators;

module.exports = router;
