/**
 * password.js — เก็บรหัสผ่านอย่างปลอดภัยด้วย scrypt (มากับ Node ใน node:crypto)
 *
 * 🏫 TODO W13-HASH (CP49) — ทำให้ tests/unit/password.test.js ผ่านทุกข้อ
 *
 *   รูปแบบที่ต้องเก็บ:  scrypt$<salt>$<hash>
 *     salt = randomBytes(16) แปลงเป็น hex  (32 ตัวอักษร)
 *     hash = scryptSync(รหัสผ่าน, salt, 64) แปลงเป็น hex  (128 ตัวอักษร)
 *
 *   ⚠ รูปแบบต้องตรงเป๊ะ — schema.sql มี hash ของบัญชีเจ้าหน้าที่ (รหัสผ่าน staff1234)
 *     ที่สร้างด้วยรูปแบบนี้ ถ้าเขียนต่างไป จะเข้าสู่ระบบด้วยบัญชีนี้ไม่ได้
 */
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

/**
 * เข้ารหัสรหัสผ่านด้วย scrypt
 * รูปแบบผลลัพธ์: scrypt$${salt}$${hash}
 */
export function hashPassword(plain) {
  // สุ่ม salt ขนาด 16 ไบต์ แปลงเป็น hex
  const salt = randomBytes(16).toString('hex');
  // แฮชรหัสผ่านด้วย scryptSync (กำหนดความยาว 64 ไบต์)
  const hash = scryptSync(plain, salt, 64).toString('hex');
  // คืนค่าในรูปแบบที่กำหนด
  return `scrypt$${salt}$${hash}`;
}

/**
 * ตรวจสอบรหัสผ่านกับค่าที่จัดเก็บไว้
 */
export function verifyPassword(plain, stored) {
  try {
    // ตรวจสอบว่ารูปแบบของ stored ถูกต้องหรือไม่ (ต้องเป็นสตริงและมีเครื่องหมาย $)
    if (!stored || typeof stored !== 'string') {
      return false;
    }

    const parts = stored.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false;
    }

    const [, salt, originalHash] = parts;

    // คำนวณแฮชจากรหัสผ่านที่รับเข้ามา โดยใช้ salt เดิม
    const computedHash = scryptSync(plain, salt, 64);
    const originalBuffer = Buffer.from(originalHash, 'hex');

    // ตรวจสอบความยาวของ Buffer ให้เท่ากันก่อนใช้ timingSafeEqual ป้องกัน Error
    if (computedHash.length !== originalBuffer.length) {
      return false;
    }

    // เปรียบเทียบด้วย timingSafeEqual เพื่อป้องกัน Timing Attack
    return timingSafeEqual(computedHash, originalBuffer);
  } catch (error) {
    // หากเกิดข้อผิดพลาดหรือรูปแบบผิดพลาด ห้ามโยน Error ให้คืนค่า false
    return false;
  }
}