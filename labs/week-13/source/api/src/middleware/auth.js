import { verifyToken } from '../services/authService.js';

/**
 * 🏫 TODO W13-AUTH (CP51) — ป้องกัน route ด้วย JWT
 */
export function authenticate(req, res, next) {
  const authHeader = req.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ต้องเข้าสู่ระบบก่อน' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'ต้องเข้าสู่ระบบก่อน' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ทำรายการนี้' });
    }
    next();
  };
}