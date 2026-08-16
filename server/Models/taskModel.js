import { randomUUID } from 'node:crypto';

const tasks = [];

export const TaskModel = {
  async listByBoard(boardId) {
    return tasks.filter((task) => task.boardId === boardId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async create(values) {
    const now = new Date().toISOString();
    const task = { id: randomUUID(), ...values, createdAt: now, updatedAt: now };
    tasks.push(task);
    return task;
  },
  async findById(id) {
    return tasks.find((task) => task.id === id) || null;
  },
  async update(id, changes) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return null;
    Object.assign(task, changes, { updatedAt: new Date().toISOString() });
    return task;
  },
  async remove(id) {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;
    return tasks.splice(index, 1)[0];
  },
  async removeByBoard(boardId) {
    for (let index = tasks.length - 1; index >= 0; index -= 1) {
      if (tasks[index].boardId === boardId) tasks.splice(index, 1);
    }
  }
};