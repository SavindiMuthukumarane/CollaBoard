import { BoardModel } from '../models/boardModel.js';
import { TaskModel } from '../models/taskModel.js';

export async function listBoards(req, res) {
  return res.json(await BoardModel.listForUser(req.user.id));
}

export async function getBoard(req, res) {
  const board = await BoardModel.findAccessible(req.params.id, req.user.id);
  if (!board) return res.status(404).json({ message: 'Board not found.' });
  return res.json(board);
}

export async function createBoard(req, res) {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  if (!name) return res.status(400).json({ message: 'Board name is required.' });
  const board = await BoardModel.create({
    name: name.slice(0, 100),
    description: description.slice(0, 300),
    ownerId: req.user.id
  });
  return res.status(201).json(board);
}

export async function updateBoard(req, res) {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  if (!name) return res.status(400).json({ message: 'Board name is required.' });
  const board = await BoardModel.update(req.params.id, req.user.id, {
    name: name.slice(0, 100),
    description: description.slice(0, 300)
  });
  if (!board) return res.status(404).json({ message: 'Board not found.' });
  return res.json(board);
}

export async function deleteBoard(req, res) {
  const board = await BoardModel.removeOwned(req.params.id, req.user.id);
  if (!board) return res.status(404).json({ message: 'Board not found or only the owner may delete it.' });
  await TaskModel.removeByBoard(board.id);
  return res.status(204).send();
}