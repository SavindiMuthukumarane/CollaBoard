import mongoose from 'mongoose';
import { BoardModel } from '../models/boardModel.js';
import { TaskModel } from '../models/taskModel.js';

function accessFilter(id, userId) { return { _id: id, $or: [{ ownerId: userId }, { memberIds: userId }] }; }

export async function listBoards(req, res) {
  const boards = await BoardModel.find({ $or: [{ ownerId: req.user.id }, { memberIds: req.user.id }] }).sort({ updatedAt: -1 });
  return res.json(boards);
}
export async function getBoard(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Board not found.' });
  const board = await BoardModel.findOne(accessFilter(req.params.id, req.user.id));
  if (!board) return res.status(404).json({ message: 'Board not found.' });
  return res.json(board);
}
export async function createBoard(req, res) {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  if (!name) return res.status(400).json({ message: 'Board name is required.' });
  const board = await BoardModel.create({ name: name.slice(0, 100), description: description.slice(0, 300), ownerId: req.user.id, memberIds: [req.user.id] });
  return res.status(201).json(board);
}
export async function updateBoard(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Board not found.' });
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  if (!name) return res.status(400).json({ message: 'Board name is required.' });
  const board = await BoardModel.findOneAndUpdate(accessFilter(req.params.id, req.user.id), { name: name.slice(0, 100), description: description.slice(0, 300) }, { new: true, runValidators: true });
  if (!board) return res.status(404).json({ message: 'Board not found.' });
  return res.json(board);
}
export async function deleteBoard(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Board not found.' });
  const board = await BoardModel.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!board) return res.status(404).json({ message: 'Board not found or only the owner may delete it.' });
  await TaskModel.deleteMany({ boardId: board._id });
  return res.status(204).send();
}
