import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModels.js';
import { getJwtSecret } from '../config/auth.js';

export async function protect(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await UserModel.findById(decoded.sub);
    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    req.user = { id: user.id, name: user.name, email: user.email };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}