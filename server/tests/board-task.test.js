import request from 'supertest';
import app from '../app.js';
import { TaskModel } from '../models/taskModel.js';
import { authorised, registerUser } from './helpers.js';

describe('Board and task integration', () => {
  async function createBoardAndTask() {
    const { token } = await registerUser();
    const boardResponse = await request(app).post('/api/boards').set(authorised(token)).send({ name: 'Launch Board' });
    const taskResponse = await request(app).post(`/api/boards/${boardResponse.body.id}/tasks`).set(authorised(token)).send({
      title: 'Prepare demo', status: 'todo', priority: 'high'
    });
    return { token, board: boardResponse.body, task: taskResponse.body };
  }

  test('creates a persistent board and task for an authenticated user', async () => {
    const { board, task } = await createBoardAndTask();
    expect(board.name).toBe('Launch Board');
    expect(task).toMatchObject({ title: 'Prepare demo', status: 'todo', version: 0 });
  });

  test('moves a task and rejects a stale version with HTTP 409', async () => {
    const { token, task } = await createBoardAndTask();
    const first = await request(app).patch(`/api/tasks/${task.id}/status`).set(authorised(token)).send({ status: 'doing', version: task.version });
    const stale = await request(app).patch(`/api/tasks/${task.id}/status`).set(authorised(token)).send({ status: 'done', version: task.version });
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ status: 'doing', version: 1 });
    expect(stale.status).toBe(409);
    expect(stale.body.latestTask).toMatchObject({ status: 'doing', version: 1 });
  });

  test('deleting a board also removes its tasks', async () => {
    const { token, board, task } = await createBoardAndTask();
    const deleted = await request(app).delete(`/api/boards/${board.id}`).set(authorised(token));
    expect(deleted.status).toBe(204);
    expect(await TaskModel.findById(task.id)).toBeNull();
  });
});