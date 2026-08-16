import { randomUUID } from 'node:crypto';

const boards = [];

function accessible(board, userId) {
  return board.ownerId === userId || board.memberIds.includes(userId);
}

export const BoardModel = {
  async listForUser(userId) {
    return boards.filter((board) => accessible(board, userId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async findAccessible(id, userId) {
    return boards.find((board) => board.id === id && accessible(board, userId)) || null;
  },
  async create({ name, description, ownerId }) {
    const now = new Date().toISOString();
    const board = { id: randomUUID(), name, description, ownerId, memberIds: [ownerId], createdAt: now, updatedAt: now };
    boards.push(board);
    return board;
  },
  async update(id, userId, changes) {
    const board = boards.find((item) => item.id === id && accessible(item, userId));
    if (!board) return null;
    Object.assign(board, changes, { updatedAt: new Date().toISOString() });
    return board;
  },
  async removeOwned(id, userId) {
    const index = boards.findIndex((board) => board.id === id && board.ownerId === userId);
    if (index === -1) return null;
    return boards.splice(index, 1)[0];
  }
};