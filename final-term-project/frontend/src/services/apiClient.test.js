import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  apiRequest,
  clearToken,
  createPrintJob,
  getPrintJobs,
  getToken,
  login,
  updatePrintJobStatus
} from './apiClient';

describe('PrintJobs frontend API client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('logs in and stores the token and role', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'test-token', role: 'staff' })
    }));

    const result = await login('staff@example.com', 'password123');

    expect(result.role).toBe('staff');
    expect(getToken()).toBe('test-token');
    expect(localStorage.getItem('printjobs_role')).toBe('staff');

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      email: 'staff@example.com',
      password: 'password123'
    });
  });

  it('requests the print jobs endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 1, status: 'queued' }]
    }));

    const jobs = await getPrintJobs();

    expect(jobs).toHaveLength(1);
    expect(fetch.mock.calls[0][0]).toBe('/api/print-jobs');
  });

  it('sends a Bearer token when updating a job', async () => {
    localStorage.setItem('printjobs_token', 'staff-token');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Updated successfully' })
    }));

    await updatePrintJobStatus(1, 'printing');

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('PUT');
    expect(options.headers.Authorization).toBe('Bearer staff-token');
    expect(JSON.parse(options.body)).toEqual({ status: 'printing' });
  });

  it('creates a print job with JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 7, status: 'queued' })
    }));

    const job = {
      customer_name: 'Test User',
      file_name: 'document.pdf',
      pages: 10,
      copies: 2,
      color_mode: 'bw',
      shop_id: 1
    };

    const result = await createPrintJob(job);

    expect(result.id).toBe(7);
    expect(fetch.mock.calls[0][0]).toBe('/api/print-jobs');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(job);
  });

  it('clears saved credentials and reports unauthorized responses', async () => {
    localStorage.setItem('printjobs_token', 'expired-token');
    localStorage.setItem('printjobs_role', 'staff');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    }));

    const handler = vi.fn();
    window.addEventListener('auth:unauthorized', handler);

    await expect(apiRequest('/api/print-jobs/1')).rejects.toThrow(/เข้าสู่ระบบใหม่/);

    expect(localStorage.getItem('printjobs_token')).toBeNull();
    expect(localStorage.getItem('printjobs_role')).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener('auth:unauthorized', handler);
  });

  it('clears credentials on logout', () => {
    localStorage.setItem('printjobs_token', 'token');
    localStorage.setItem('printjobs_role', 'staff');

    clearToken();

    expect(getToken()).toBeNull();
    expect(localStorage.getItem('printjobs_role')).toBeNull();
  });
});
