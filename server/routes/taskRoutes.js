const express = require('express');
const { body, param } = require('express-validator');
const {
  createTask,
  getMyTasks,
  getTeamTasks,
  updateStatus,
  submitTask,
  reviewTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title is required (min 3 chars)'),
    body('assignedTo').isMongoId().withMessage('Valid assignee id is required'),
    body('deadline').isISO8601().toDate().withMessage('Valid deadline is required'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    body('description').optional().trim().escape(),
  ],
  validateRequest,
  createTask
);

router.get('/mine', getMyTasks);
router.get('/team', getTeamTasks);

router.put('/:id/start', [param('id').isMongoId().withMessage('Invalid task id')], validateRequest, updateStatus);
router.put('/:id/submit', [param('id').isMongoId().withMessage('Invalid task id'), body('text').trim().isLength({ min: 1 }).withMessage('Submission text is required')], validateRequest, submitTask);
router.put('/:id/review', [param('id').isMongoId().withMessage('Invalid task id')], validateRequest, reviewTask);
// Export validators for integration tests
const createTaskValidators = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title is required (min 3 chars)'),
  body('assignedTo').isMongoId().withMessage('Valid assignee id is required'),
  body('deadline').isISO8601().toDate().withMessage('Valid deadline is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('description').optional().trim().escape(),
];

const idParamValidator = [param('id').isMongoId().withMessage('Invalid task id')];
const submitValidators = [param('id').isMongoId().withMessage('Invalid task id'), body('text').trim().isLength({ min: 1 }).withMessage('Submission text is required')];

router.createTaskValidators = createTaskValidators;
router.idParamValidator = idParamValidator;
router.submitValidators = submitValidators;

module.exports = router;
