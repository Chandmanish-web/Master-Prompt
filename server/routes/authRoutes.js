const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, getTeamMembers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const registerValidators = [
	body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
];

const loginValidators = [body('email').isEmail().withMessage('Valid email is required'), body('password').exists().withMessage('Password is required')];

router.post('/register', registerValidators, validateRequest, register);
router.post('/login', loginValidators, validateRequest, login);

router.get('/me', protect, getMe);
router.get('/team', protect, getTeamMembers);

// Export validators for integration tests
router.registerValidators = registerValidators;
router.loginValidators = loginValidators;

module.exports = router;
