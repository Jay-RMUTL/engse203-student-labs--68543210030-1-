import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { findUserByEmail } from './requestService.js';
import { verifyPassword } from '../utils/password.js';

export function login(email, password) {
  const user = findUserByEmail(email);

  if (!user || user.role !== 'staff' || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const token = jwt.sign(
    {
      sub: String(user.id),
      name: user.name,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}