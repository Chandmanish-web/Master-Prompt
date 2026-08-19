const express = require('express');
const { query } = require('express-validator');
const { checkIn, checkOut, getToday, getReport } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getToday);

router.get(
	'/report',
	authorize('manager', 'admin'),
	[
		query('userId').optional().isMongoId().withMessage('Invalid userId'),
		query('month')
			.optional()
			.custom((value) => {
				const m = /^([0-9]{4})-([0-9]{2})$/.exec(value);
				if (!m) throw new Error('Month must be in YYYY-MM format');
				const year = Number(m[1]);
				const month = Number(m[2]);
				if (year < 2000 || year > 2100) throw new Error('Year must be between 2000 and 2100');
				if (month < 1 || month > 12) throw new Error('Month must be between 01 and 12');
				return true;
			})
			.withMessage('Month must be in YYYY-MM format with valid month and year'),
	],
	validateRequest,
	getReport
	);

// Export validators for testing
const reportValidators = [
	query('userId').optional().isMongoId().withMessage('Invalid userId'),
	query('month')
		.optional()
		.custom((value) => {
			const m = /^([0-9]{4})-([0-9]{2})$/.exec(value);
			if (!m) throw new Error('Month must be in YYYY-MM format');
			const year = Number(m[1]);
			const month = Number(m[2]);
			if (year < 2000 || year > 2100) throw new Error('Year must be between 2000 and 2100');
			if (month < 1 || month > 12) throw new Error('Month must be between 01 and 12');
			return true;
		})
		.withMessage('Month must be in YYYY-MM format with valid month and year'),
];

router.reportValidators = reportValidators;

module.exports = router;
