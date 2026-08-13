const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const express = require('express');

const taskRoutes = require('../../routes/taskRoutes');
const validateRequest = require('../../middleware/validateRequest');

test('task create validation: missing title -> 400', async () => {
  const app = express();
  app.use(express.json());
  app.post('/tasks', taskRoutes.createTaskValidators, validateRequest, (req, res) => res.status(201).json({ ok: true }));

  const res = await request(app).post('/tasks').send({ assignedTo: 'invalid' });
  assert.equal(res.status, 400);
});
