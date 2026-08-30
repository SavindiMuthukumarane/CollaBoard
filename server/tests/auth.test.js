import request from 'supertest';
import app from '../app.js';
import { registerUser } from './helpers.js';

describe('Authentication API', () => {
  test('registers a user and returns a JWT session', async () => {
    const { response } = await registerUser({ email: 'new@example.com' });
    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({ name: 'Test User', email: 'new@example.com' });
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test('logs in with valid credentials and rejects a wrong password', async () => {
    await registerUser({ email: 'login@example.com', password: 'Correct123' });
    const valid = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'Correct123' });
    const invalid = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'Wrong123' });
    expect(valid.status).toBe(200);
    expect(valid.body.token).toEqual(expect.any(String));
    expect(invalid.status).toBe(401);
  });

  test('blocks protected routes without a bearer token', async () => {
    const response = await request(app).get('/api/boards');
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/authentication required/i);
  });
});