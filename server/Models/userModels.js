import { randomUUID } from 'node:crypto';

const users = [];

export const UserModel = {
  async exists({ email }) {
    return users.some((user) => user.email === email);
  },
  async create({ name, email, passwordHash }) {
    const user = { id: randomUUID(), name, email, passwordHash, createdAt: new Date().toISOString() };
    users.push(user);
    return user;
  },
  async findByEmail(email) {
    return users.find((user) => user.email === email) || null;
  },
  async findById(id) {
    return users.find((user) => user.id === id) || null;
  }
};