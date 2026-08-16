import { BoardModel } from '../models/boardModel.js';
import { TaskModel } from '../models/taskModel.js';

const validStatuses = new Set(['todo', 'doing', 'done']);
const validPriorities = new Set(['low', 'medium', 'high']);

async function boardFor(userId, boardId) {
  return BoardModel.findAccessible(boardId, userId);
}

function cleanPayload(body) {
  return {
    title: String(body.title || '').trim().slice(0, 100),
    description: String(body.description || '').trim().slice(0, 500),
    status: String(body.status || 'todo'),
    priority: String(body.priority || 'medium'),
    assignee: String(body.assignee || '').trim().slice(0, 80)
  };
}

function validate(payload) {
  if (!payload.title) return 'Task title is required.';
  if (!validStatuses.has(payload.status)) return 'Invalid task status.';
  if (!validPriorities.has(payload.priority)) return 'Invalid task priority.';
  return null;
}

export async function listTasks(req, res) {
  if (!(await boardFor(req.user.id, req.params.boardId))) return res.status(404).json({ message: 'Board not found.' });
  return res.json(await TaskModel.listByBoard(req.params.boardId));
}

export async function createTask(req, res) {
  if (!(await boardFor(req.user.id, req.params.boardId))) return res.status(404).json({ message: 'Board not found.' });
  const payload = cleanPayload(req.body);
  const error = validate(payload);
  if (error) return res.status(400).json({ message: error });
  const task = await TaskModel.create({ boardId: req.params.boardId, ...payload, createdBy: req.user.id });
  return res.status(201).json(task);
}

export async function updateTask(req, res) {
  const existing = await TaskModel.findById(req.params.id);
  if (!existing || !(await boardFor(req.user.id, existing.boardId))) return res.status(404).json({ message: 'Task not found.' });
  const payload = cleanPayload(req.body);
  const error = validate(payload);
  if (error) return res.status(400).json({ message: error });
  return res.json(await TaskModel.update(existing.id, payload));
}

export async function moveTask(req, res) {
  const existing = await TaskModel.findById(req.params.id);
  if (!existing || !(await boardFor(req.user.id, existing.boardId))) return res.status(404).json({ message: 'Task not found.' });
  const status = String(req.body.status || '');
  if (!validStatuses.has(status)) return res.status(400).json({ message: 'Invalid task status.' });
  return res.json(await TaskModel.update(existing.id, { status }));
}

export async function deleteTask(req, res) {
  const existing = await TaskModel.findById(req.params.id);
  if (!existing || !(await boardFor(req.user.id, existing.boardId))) return res.status(404).json({ message: 'Task not found.' });
  await TaskModel.remove(existing.id);
  return res.status(204).send();
}