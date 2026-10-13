import { describe, test, expect } from 'vitest';
import { summarizeRequests } from './requestSummary.js';

describe('summarizeRequests', () => {
  test('รายการว่าง → ทุกค่าเป็น 0', () => {
    expect(summarizeRequests([])).toEqual({
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
    });
  });

  test('นับสถานะ in-progress ได้ถูกต้องตาม BUG #2', () => {
    const mockData = [
      { status: 'in-progress' },
      { status: 'in-progress' },
      { status: 'pending' },
      { status: 'completed' },
    ];
    const summary = summarizeRequests(mockData);
    expect(summary.inProgress).toBe(2);
    expect(summary.total).toBe(4);
  });
});