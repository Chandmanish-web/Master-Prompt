const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');

const router = express.Router();

router.use(protect);
router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/pending', authorize('admin', 'manager'), getPendingLeaves);
router.patch('/:leaveId/status', authorize('admin', 'manager'), updateLeaveStatus);

module.exports = router;
