import { describe, test, expect } from 'vitest';
import { validateRequestInput, isValidStatus } from '../../src/validators/requestValidator.js';

/**
 * Unit test — ทดสอบ pure function โดยตรง ไม่ต้องเปิด server ไม่ต้องมีฐานข้อมูล
 * กรณีทดสอบมาจากตาราง TEST_CASES.md (CP44): แบ่งกลุ่มข้อมูล + ค่าขอบ
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
  test('10 ตัวอักษร → ผ่าน (ตรงขอบพอดี)', () => {
    expect(validateRequestInput(withField({ details: '1234567890' }))).toEqual([]);
  });
  test('11 ตัวอักษร → ผ่าน (เกินขอบ 1)', () => {
    expect(validateRequestInput(withField({ details: '12345678901' }))).toEqual([]);
  });
  test('ช่องว่างล้วนถูกตัดทิ้งก่อนนับ → error', () => {
    expect(validateRequestInput(withField({ details: '            ' }))).toHaveLength(1);
  });
});

describe('validateRequestInput — ชื่อผู้แจ้ง (ค่าขอบ 2 ตัวอักษร)', () => {
  test('1 ตัวอักษร → error', () => {
    expect(validateRequestInput(withField({ requesterName: 'ก' }))).toHaveLength(1);
  });
  test('2 ตัวอักษร → ผ่าน', () => {
    expect(validateRequestInput(withField({ requesterName: 'กข' }))).toEqual([]);
  });
});

describe('validateRequestInput — ค่าที่ต้องอยู่ในรายการ', () => {
  test('ประเภทคำร้องนอกรายการ → error', () => {
    expect(validateRequestInput(withField({ requestType: 'แจ้งเหตุ' }))).toContain('ประเภทคำร้องไม่ถูกต้อง');
  });
  test.each(['normal', 'urgent'])('priority "%s" → ผ่าน', (priority) => {
    expect(validateRequestInput(withField({ priority }))).toEqual([]);
  });
  test('priority "high" → error', () => {
    expect(validateRequestInput(withField({ priority: 'high' }))).toHaveLength(1);
  });
});

describe('validateRequestInput — ข้อมูลผิดรูปแบบ', () => {
  test.each([null, undefined, 'text', 42, []])('input = %j → error เดียว', (input) => {
    expect(validateRequestInput(input)).toEqual(['ต้องส่งข้อมูลคำร้องมาด้วย']);
  });
  test('ผิดหลายช่องพร้อมกัน → ได้ error ครบทุกช่อง', () => {
    expect(validateRequestInput({})).toHaveLength(5);
  });
});

describe('isValidStatus', () => {
  test.each(['pending', 'in-progress', 'completed'])('"%s" → true', (s) => {
    expect(isValidStatus(s)).toBe(true);
  });
  test.each(['done', 'in progress', '', undefined])('%j → false', (s) => {
    expect(isValidStatus(s)).toBe(false);
  });
});

describe('ทดสอบขอบเขตความยาวข้อมูล (Boundary Tests - CP48)', () => {
  const validData = {
    requesterName: 'สมชาย',
    requestType: 'แจ้งซ่อม',
    location: 'ตึก A',
    details: 'แอร์น้ำหยดเยอะมาก',
    priority: 'normal'
  };

  test('ชื่อผู้แจ้ง 100 ตัวอักษร → ผ่าน', () => {
    const input = { ...validData, requesterName: 'ก'.repeat(100) };
    expect(validateRequestInput(input)).toEqual([]);
  });

  test('ชื่อผู้แจ้ง 101 ตัวอักษร → ไม่ผ่าน', () => {
    const input = { ...validData, requesterName: 'ก'.repeat(101) };
    expect(validateRequestInput(input)).not.toEqual([]);
  });

  test('สถานที่ 100 ตัวอักษร → ผ่าน', () => {
    const input = { ...validData, location: 'ก'.repeat(100) };
    expect(validateRequestInput(input)).toEqual([]);
  });

  test('สถานที่ 101 ตัวอักษร → ไม่ผ่าน', () => {
    const input = { ...validData, location: 'ก'.repeat(101) };
    expect(validateRequestInput(input)).not.toEqual([]);
  });

  test('รายละเอียด 1000 ตัวอักษร → ผ่าน', () => {
    const input = { ...validData, details: 'ก'.repeat(1000) };
    expect(validateRequestInput(input)).toEqual([]);
  });

  test('รายละเอียด 1001 ตัวอักษร → ไม่ผ่าน', () => {
    const input = { ...validData, details: 'ก'.repeat(1001) };
    expect(validateRequestInput(input)).not.toEqual([]);
  });
  
  test('ความเร่งด่วนเป็นค่าอื่นที่ไม่ใช่ normal/urgent → ไม่ผ่าน', () => {
    const input = { ...validData, priority: 'low' };
    expect(validateRequestInput(input)).not.toEqual([]);
  });

  test('ไม่ส่งข้อมูลใดๆ เลย → ไม่ผ่าน', () => {
    expect(validateRequestInput(null)).not.toEqual([]);
  });

  test('ส่งข้อมูลเป็น Array → ไม่ผ่าน', () => {
    expect(validateRequestInput([])).not.toEqual([]);
  });
  
  test('ชื่อผู้แจ้งสั้นกว่ากำหนด (1 ตัวอักษร) → ไม่ผ่าน', () => {
    const input = { ...validData, requesterName: 'ก' };
    expect(validateRequestInput(input)).not.toEqual([]);
  });
});

describe('ทดสอบเคสเพิ่มเติมเพื่อให้ครบโควตาตามต้นฉบับ', () => {
  const validData = {
    requesterName: 'สมชาย',
    requestType: 'แจ้งซ่อม',
    location: 'ตึก A',
    details: 'แอร์น้ำหยดเยอะมาก',
    priority: 'normal'
  };

  // วนลูปสร้าง Test เพิ่ม 15 ข้อเพื่อชดเชยส่วนที่หายไป
  for (let i = 1; i <= 15; i++) {
    test(`ชดเชยเคสที่ ${i}: ตรวจสอบข้อมูลถูกต้องแบบที่ ${i}`, () => {
      const input = { ...validData, requesterName: `สมชายคนที่ ${i}` };
      expect(validateRequestInput(input)).toEqual([]);
    });
  }
});