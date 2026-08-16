import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { getJwtSecret } from '../config/auth.js';

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function issueToken(user) {
  return jwt.sign({}, getJwtSecret(), {
    subject: user.id,
    expiresIn: process.env.JWT_EXPIRES_IN || '2h'
  });
}

export async function register(req, res) {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must contain at least six characters.' });
  if (await UserModel.exists({ email })) return res.status(409).json({ message: 'An account already exists for this email.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name: name.slice(0, 80), email: email.slice(0, 160), passwordHash });
  return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await UserModel.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  return res.json({ token: issueToken(user), user: publicUser(user) });
}

export function me(req, res) {
  return res.json(req.user);
}