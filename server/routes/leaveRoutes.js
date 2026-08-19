const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('type').isIn(['Sick', 'Casual', 'Paid']).withMessage('Invalid leave type'),
    body('fromDate').isISO8601().withMessage('Valid fromDate is required'),
    body('toDate').isISO8601().withMessage('Valid toDate is required'),
    body('reason').optional().trim().escape(),
  ],
  validateRequest,
  applyLeave
);

router.get('/my', getMyLeaves);
router.get('/pending', authorize('admin', 'manager'), getPendingLeaves);

router.patch(
  '/:leaveId/status',
  authorize('admin', 'manager'),
  [param('leaveId').isMongoId().withMessage('Invalid leave id'), body('status').isIn(['Approved', 'Rejected']).withMessage('Invalid status')],
  validateRequest,
  updateLeaveStatus
);

// Export validators for integration tests
const applyLeaveValidators = [
  body('type').isIn(['Sick', 'Casual', 'Paid']).withMessage('Invalid leave type'),
  body('fromDate').isISO8601().withMessage('Valid fromDate is required'),
  body('toDate').isISO8601().withMessage('Valid toDate is required'),
  body('reason').optional().trim().escape(),
];

const leaveStatusValidators = [param('leaveId').isMongoId().withMessage('Invalid leave id'), body('status').isIn(['Approved', 'Rejected']).withMessage('Invalid status')];

router.applyLeaveValidators = applyLeaveValidators;
router.leaveStatusValidators = leaveStatusValidators;

module.exports = router;
