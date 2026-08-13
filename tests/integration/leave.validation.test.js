const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const express = require('express');

const leaveRoutes = require('../../routes/leaveRoutes');
const validateRequest = require('../../middleware/validateRequest');

test('leave apply validation: invalid dates -> 400', async () => {
  const app = express();
  app.use(express.json());
  app.post('/leave', leaveRoutes.applyLeaveValidators, validateRequest, (req, res) => res.status(201).json({ ok: true }));

  const res = await request(app).post('/leave').send({ type: 'Sick', fromDate: 'not-a-date', toDate: 'also-bad' });
  assert.equal(res.status, 400);
});
