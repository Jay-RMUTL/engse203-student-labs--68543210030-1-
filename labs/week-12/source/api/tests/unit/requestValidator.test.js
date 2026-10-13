import { describe, test, expect } from 'vitest';
import { validateRequestInput, isValidStatus } from '../../src/validators/requestValidator.js';

/**
 * Unit test — ทดสอบ pure function โดยตรง ไม่ต้องเปิด server ไม่ต้องมีฐานข้อมูล
 * กรณีทดสอบมาจากตาราง TEST_CASES.md (CP44)
 *
 * รัน:  npm test            (ครั้งเดียว)
 *       npm run test:watch  (รันใหม่ทุกครั้งที่บันทึกไฟล์)
 */

// ข้อมูลที่ถูกต้องทุกช่อง — แต่ละ test เปลี่ยนทีละช่องเพื่อให้รู้ว่าพังเพราะอะไร
const valid = {
  requesterName: 'สมชาย ใจดี',
  requestType: 'แจ้งซ่อม',
  location: 'ห้อง 301',
  details: 'แอร์ไม่เย็นตั้งแต่เช้า',
  priority: 'normal',
};
const withField = (patch) => ({ ...valid, ...patch });

describe('validateRequestInput — ข้อมูลถูกต้อง', () => {
  test('ทุกช่องถูกต้อง → ไม่มี error', () => {
    expect(validateRequestInput(valid)).toEqual([]);
  });
});

describe('validateRequestInput — รายละเอียด (ค่าขอบ 10 ตัวอักษร)', () => {
  test('9 ตัวอักษร → error (ต่ำกว่าขอบ 1)', () => {
    expect(validateRequestInput(withField({ details: '123456789' }))).toHaveLength(1);
  });

  // 🏫 TODO W12-UNIT (CP45): เพิ่มกรณีจากตาราง TEST_CASES.md ให้ครบ
  //   - 10 ตัวอักษรพอดี → ผ่าน          ← ค่าขอบ
  //   - 11 ตัวอักษร → ผ่าน
  //   - ช่องว่างล้วน → error
  //   ⚠ ถ้า test ข้อไหน fail อย่าเพิ่งแก้ test — อ่านโค้ดใน validator ก่อน
});

// 🏫 TODO W12-UNIT (CP45): เพิ่ม describe อื่น ๆ
//   - ชื่อผู้แจ้ง 1 ตัว / 2 ตัว
//   - ประเภทคำร้องนอกรายการ · priority "high"
//   - input ผิดรูปแบบ (null · array · ตัวเลข)  ← ลองใช้ test.each([...])
//   - isValidStatus('pending') / isValidStatus('done')

// TC-03: ค่าขอบ รายละเอียด 10 ตัวอักษรพอดี
test('รายละเอียด 10 ตัวอักษร -> ผ่าน (ตรงขอบพอดี)', () => {
  expect(validateRequestInput(withField({ details: '1234567890' }))).toEqual([]);
});

// TC-04: ค่าขอบ รายละเอียด 11 ตัวอักษร
test('รายละเอียด 11 ตัวอักษร -> ผ่าน', () => {
  expect(validateRequestInput(withField({ details: '12345678901' }))).toEqual([]);
});

// TC-02: ค่าขอบ รายละเอียด 9 ตัวอักษร
test('รายละเอียด 9 ตัวอักษร -> มี error 1 ข้อ', () => {
  const result = validateRequestInput(withField({ details: '123456789' }));
  expect(result).toHaveLength(1);
});

// TC-06: ค่าขอบ ชื่อผู้แจ้ง 2 ตัวอักษรพอดี
test('ชื่อผู้แจ้ง 2 ตัวอักษร -> ผ่าน', () => {
  expect(validateRequestInput(withField({ requesterName: 'AB' }))).toEqual([]);
});

// TC-05: ค่าขอบ ชื่อผู้แจ้ง 1 ตัวอักษร
test('ชื่อผู้แจ้ง 1 ตัวอักษร -> มี error 1 ข้อ', () => {
  const result = validateRequestInput(withField({ requesterName: 'A' }));
  expect(result).toHaveLength(1);
});

// TC-07, TC-08: ข้อมูลผิดรูปแบบ
test.each([null, undefined, 'text', 42, [], {}])('input = %j -> error แจ้งเตือนรูปแบบข้อมูล', (input) => {
  const result = validateRequestInput(input);
  expect(result.length).toBeGreaterThan(0);
});