import mongoose from 'mongoose';
import { BoardModel } from '../models/boardModel.js';
import { TaskModel } from '../models/taskModel.js';

const validStatuses = new Set(['todo', 'doing', 'done']);
const validPriorities = new Set(['low', 'medium', 'high']);
async function boardFor(userId, boardId) {
  if (!mongoose.isValidObjectId(boardId)) return null;
  return BoardModel.findOne({ _id: boardId, $or: [{ ownerId: userId }, { memberIds: userId }] });
}
function cleanPayload(body) {
  return { title: String(body.title || '').trim().slice(0, 100), description: String(body.description || '').trim().slice(0, 500), status: String(body.status || 'todo'), priority: String(body.priority || 'medium'), assignee: String(body.assignee || '').trim().slice(0, 80) };
}
function validate(payload) {
  if (!payload.title) return 'Task title is required.';
  if (!validStatuses.has(payload.status)) return 'Invalid task status.';
  if (!validPriorities.has(payload.priority)) return 'Invalid task priority.';
  return null;
}
async function conflictResponse(res, taskId) {
  const latestTask = await TaskModel.findById(taskId);
  if (!latestTask) return res.status(404).json({ message: 'Task not found.' });
  return res.status(409).json({ message: 'Conflict detected. This task was updated by another user.', latestTask });
}
export async function listTasks(req, res) {
  if (!(await boardFor(req.user.id, req.params.boardId))) return res.status(404).json({ message: 'Board not found.' });
  return res.json(await TaskModel.find({ boardId: req.params.boardId }).sort({ createdAt: 1 }));
}
export async function createTask(req, res) {
  if (!(await boardFor(req.user.id, req.params.boardId))) return res.status(404).json({ message: 'Board not found.' });
  const payload = cleanPayload(req.body); const error = validate(payload);
  if (error) return res.status(400).json({ message: error });
  const task = await TaskModel.create({ boardId: req.params.boardId, ...payload, createdBy: req.user.id });
  return res.status(201).json(task);
}
export async function updateTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const existing = await TaskModel.findById(req.params.id);
  if (!existing || !(await boardFor(req.user.id, existing.boardId))) return res.status(404).json({ message: 'Task not found.' });
  const version = Number(req.body.version); const payload = cleanPayload(req.body); const error = validate(payload);
  if (!Number.isInteger(version) || version < 0) return res.status(400).json({ message: 'A valid task version is required.' });
  if (error) return res.status(400).json({ message: error });
  const task = await TaskModel.findOneAndUpdate({ _id: existing._id, __v: version }, { $set: payload, $inc: { __v: 1 } }, { new: true, runValidators: true });
  if (!task) return conflictResponse(res, existing._id);
  return res.json(task);
}
export async function moveTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const existing = await TaskModel.findById(req.params.id);
  if (!existing || !(await boardFor(req.user.id, existing.boardId))) return res.status(404).json({ message: 'Task not found.' });
  const status = String(req.body.status || ''); const version = Number(req.body.version);
  if (!validStatuses.has(status)) return res.status(400).json({ message: 'Invalid task status.' });
  if (!Number.isInteger(version) || version < 0) return res.status(400).json({ message: 'A valid task version is required.' });
  const task = await TaskModel.findOneAndUpdate({ _id: existing._id, __v: version }, { $set: { status }, $inc: { __v: 1 } }, { new: true, runValidators: true });
  if (!task) return conflictResponse(res, existing._id);
  return res.json(task);
}
export async function deleteTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const existing = await TaskModel.findById(req.params.id);
  if (!existing || !(await boardFor(req.user.id, existing.boardId))) return res.status(404).json({ message: 'Task not found.' });
  await existing.deleteOne();
  return res.status(204).send();
}
