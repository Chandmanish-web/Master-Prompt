const express = require('express');
const {
  createTask,
  getMyTasks,
  getTeamTasks,
  updateStatus,
  submitTask,
  reviewTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', createTask);
router.get('/mine', getMyTasks);
router.get('/team', getTeamTasks);
router.put('/:id/start', updateStatus);
router.put('/:id/submit', submitTask);
router.put('/:id/review', reviewTask);

module.exports = router;
