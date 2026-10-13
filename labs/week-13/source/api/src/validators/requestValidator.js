/**
 * requestValidator.js — กฎตรวจข้อมูลคำร้อง เป็น "pure function"
 *
 * 🏫 TODO W13-VALID (CP48) — ทำให้เข้มขึ้น
 *   ① ชนิดข้อมูล: requesterName · location · details ต้องเป็น string ไม่งั้นบอกว่า "...ต้องเป็นข้อความ"
 *   ② ความยาวสูงสุด: ชื่อ ≤ 100 · สถานที่ ≤ 100 · รายละเอียด ≤ 1000 ตัวอักษร
 *   ③ เขียน unit test ค่าขอบของค่าสูงสุดด้วย (100 ผ่าน · 101 ไม่ผ่าน)
 *
 * Week 12 · CP45 — ทำไมต้องแยกออกจาก middleware
 *   middleware ผูกกับ req / res / next → จะทดสอบต้องเปิด server หรือจำลอง req/res
 *   pure function รับข้อมูลเข้า คืนผลลัพธ์ ไม่แตะอะไรภายนอก → เขียน unit test ได้ทันที
 *
 *   validateRequestInput(input) → [] ถ้าผ่าน · ['ข้อความ error', ...] ถ้าไม่ผ่าน
 */

export const REQUEST_TYPES = ['แจ้งซ่อม', 'บริการบัญชีผู้ใช้', 'ขอใช้อุปกรณ์', 'อื่น ๆ'];
export const PRIORITIES = ['normal', 'urgent'];
export const STATUSES = ['pending', 'in-progress', 'completed'];

export const MIN_NAME = 2;
export const MIN_DETAILS = 10;

function readText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateRequestInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return ['ต้องส่งข้อมูลคำร้องมาด้วย'];
  }

  const errors = [];
  if (readText(input.requesterName).length < MIN_NAME) {
    errors.push(`ชื่อผู้แจ้งต้องมีอย่างน้อย ${MIN_NAME} ตัวอักษร`);
  }
  if (!REQUEST_TYPES.includes(input.requestType)) {
    errors.push('ประเภทคำร้องไม่ถูกต้อง');
  }
  if (!readText(input.location)) {
    errors.push('กรุณาระบุสถานที่');
  }
  if (readText(input.details).length < MIN_DETAILS) {
    errors.push(`รายละเอียดต้องมีอย่างน้อย ${MIN_DETAILS} ตัวอักษร`);
  }
  if (!PRIORITIES.includes(input.priority)) {
    errors.push('ความเร่งด่วนต้องเป็น normal หรือ urgent');
  }
  return errors;
}

/** สถานะที่ PUT /api/requests/:id รับได้ */
export function isValidStatus(status) {
  return STATUSES.includes(status);
}

const { body, validationResult } = require('express-validator');

// ตัวอย่าง Validator สำหรับคำขอที่มีการกำหนดค่าขอบ (Boundary) เช่น จำนวนหรือความยาว
const validateRequestData = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title length must be between 1 and 100 characters'),
  
  body('amount')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Amount must be an integer between 1 and 1000'),

  // ฟังก์ชันสำหรับตรวจสอบผลลัพธ์การ Validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateRequestData
};


/** Week 13 — ข้อมูลเข้าสู่ระบบ ตรวจแค่รูปแบบ ส่วนถูกหรือผิดให้ authService ตัดสิน (ให้มาแล้ว) */
export function validateLoginInput(input) {
  if (!input || typeof input !== 'object') return ['ต้องส่งอีเมลและรหัสผ่าน'];
  const errors = [];
  if (typeof input.email !== 'string' || !input.email.includes('@') || input.email.length > 254) {
    errors.push('รูปแบบอีเมลไม่ถูกต้อง');
  }
  if (typeof input.password !== 'string' || input.password.length === 0 || input.password.length > 200) {
    errors.push('กรุณาระบุรหัสผ่าน');
  }
  return errors;
}