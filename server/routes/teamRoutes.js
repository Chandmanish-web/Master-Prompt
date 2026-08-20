const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getTeams } = require('../controllers/teamController');

const router = express.Router();
router.get('/', protect, getTeams);
module.exports = router;
