const test = require('node:test');
const assert = require('node:assert/strict');
const attendanceController = require('../controllers/attendanceController');

test('attendance controller exports the expected handlers', () => {
  assert.equal(typeof attendanceController.checkIn, 'function');
  assert.equal(typeof attendanceController.checkOut, 'function');
  assert.equal(typeof attendanceController.getToday, 'function');
  assert.equal(typeof attendanceController.getReport, 'function');
});
