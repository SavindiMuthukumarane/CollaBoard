import request from 'supertest';
import app from '../app.js';

export async function registerUser(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: `user-${Date.now()}-${Math.random()}@example.com`,
    password: 'Password123',
    ...overrides
  };
  const response = await request(app).post('/api/auth/register').send(payload);
  return { response, payload, token: response.body.token, user: response.body.user };
}

export function authorised(token) {
  return { Authorization: `Bearer ${token}` };
}