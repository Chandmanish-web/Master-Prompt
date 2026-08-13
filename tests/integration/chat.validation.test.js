const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const express = require('express');

const chatRoutes = require('../../routes/chatRoutes');
const validateRequest = require('../../middleware/validateRequest');

test('chat create validation: invalid otherUserId -> 400', async () => {
  const app = express();
  app.use(express.json());
  app.post('/chat', chatRoutes.createChatValidators, validateRequest, (req, res) => res.status(200).json({ ok: true }));

  const res = await request(app).post('/chat').send({ otherUserId: 'not-a-valid-id' });
  assert.equal(res.status, 400);
});
