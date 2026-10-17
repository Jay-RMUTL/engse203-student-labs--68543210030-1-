import { describe, it, expect } from 'vitest';
const { validateCreatePrintJob } = require('../../src/print-job-validation');

const validJob = {
  customer_name: 'Test User',
  file_name: 'document.pdf',
  pages: 5,
  copies: 1,
  color_mode: 'bw',
  shop_id: 1
};

describe('Print job validation unit tests', () => {
  it('accepts valid job data', () => {
    expect(validateCreatePrintJob(validJob)).toBeNull();
  });

  it('rejects missing customer_name', () => {
    const { customer_name, ...data } = validJob;
    expect(validateCreatePrintJob(data)).toBe('Missing required fields');
  });

  it('rejects missing file_name', () => {
    const { file_name, ...data } = validJob;
    expect(validateCreatePrintJob(data)).toBe('Missing required fields');
  });

  it('rejects missing pages', () => {
    const { pages, ...data } = validJob;
    expect(validateCreatePrintJob(data)).toBe('Missing required fields');
  });

  it('rejects missing copies', () => {
    const { copies, ...data } = validJob;
    expect(validateCreatePrintJob(data)).toBe('Missing required fields');
  });

  it('rejects missing color_mode', () => {
    const { color_mode, ...data } = validJob;
    expect(validateCreatePrintJob(data)).toBe('Missing required fields');
  });

  it('rejects missing shop_id', () => {
    const { shop_id, ...data } = validJob;
    expect(validateCreatePrintJob(data)).toBe('Missing required fields');
  });

  it('accepts minimum pages value', () => {
    expect(validateCreatePrintJob({ ...validJob, pages: 1 })).toBeNull();
  });

  it('accepts maximum pages value', () => {
    expect(validateCreatePrintJob({ ...validJob, pages: 200 })).toBeNull();
  });

  it('rejects pages below minimum', () => {
    expect(validateCreatePrintJob({ ...validJob, pages: 0 }))
      .toBe('Invalid pages (1-200) or copies (1-20)');
  });

  it('rejects pages above maximum', () => {
    expect(validateCreatePrintJob({ ...validJob, pages: 201 }))
      .toBe('Invalid pages (1-200) or copies (1-20)');
  });

  it('rejects copies above maximum', () => {
    expect(validateCreatePrintJob({ ...validJob, copies: 21 }))
      .toBe('Invalid pages (1-200) or copies (1-20)');
  });

  it('accepts minimum copies value', () => {
    expect(validateCreatePrintJob({ ...validJob, copies: 1 })).toBeNull();
  });

  it('accepts maximum copies value', () => {
    expect(validateCreatePrintJob({ ...validJob, copies: 20 })).toBeNull();
  });

  it('rejects copies below minimum', () => {
    expect(validateCreatePrintJob({ ...validJob, copies: 0 }))
      .toBe('Invalid pages (1-200) or copies (1-20)');
  });

  it('rejects fractional copies', () => {
    expect(validateCreatePrintJob({ ...validJob, copies: 1.5 }))
      .toBe('Invalid pages (1-200) or copies (1-20)');
  });
});
