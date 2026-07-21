const test = require('node:test');
const assert = require('node:assert/strict');
const taskController = require('../controllers/taskController');

test('task controller exports the expected handlers', () => {
  assert.equal(typeof taskController.createTask, 'function');
  assert.equal(typeof taskController.getMyTasks, 'function');
  assert.equal(typeof taskController.getTeamTasks, 'function');
  assert.equal(typeof taskController.updateStatus, 'function');
  assert.equal(typeof taskController.submitTask, 'function');
  assert.equal(typeof taskController.reviewTask, 'function');
});
