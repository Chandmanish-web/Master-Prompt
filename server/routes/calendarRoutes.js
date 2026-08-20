const express = require('express');
const { query } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { getEvents } = require('../controllers/calendarController');

const router = express.Router();
router.use(protect);
router.get('/', [query('start').isISO8601(), query('end').isISO8601()], validateRequest, getEvents);
module.exports = router;
