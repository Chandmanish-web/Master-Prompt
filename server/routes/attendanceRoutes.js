const express = require('express');
const { checkIn, checkOut, getToday, getReport } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getToday);
router.get('/report', authorize('manager', 'admin'), getReport);

module.exports = router;
