const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const express = require('express');

const authRoutes = require('../../routes/authRoutes');
const validateRequest = require('../../middleware/validateRequest');

test('auth register validation: missing fields -> 400', async () => {
  const app = express();
  app.use(express.json());
  app.post('/register', authRoutes.registerValidators, validateRequest, (req, res) => res.status(201).json({ ok: true }));

  const res = await request(app).post('/register').send({ email: 'bad' });
  assert.equal(res.status, 400);
});

test('auth login validation: invalid email -> 400', async () => {
  const app = express();
  app.use(express.json());
  app.post('/login', authRoutes.loginValidators, validateRequest, (req, res) => res.status(200).json({ ok: true }));

  const res = await request(app).post('/login').send({ email: 'not-an-email', password: 'x' });
  assert.equal(res.status, 400);
});
