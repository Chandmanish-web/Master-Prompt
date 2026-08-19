const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const express = require('express');

const attendanceRoutes = require('../../routes/attendanceRoutes');
const validateRequest = require('../../middleware/validateRequest');

test('attendance report validation: invalid month -> 400', async () => {
  const app = express();
  app.get('/report', attendanceRoutes.reportValidators, validateRequest, (req, res) => res.status(200).json({ ok: true }));

  const res = await request(app).get('/report').query({ month: '2026-13' });
  assert.equal(res.status, 400);
});
