import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const { spawn } = require('node:child_process');
const { tmpdir } = require('node:os');
const path = require('node:path');
const jwt = require('jsonwebtoken');

const port = 3218;
const secret = 'dev-secret-key';
const dbFile = path.join(tmpdir(), `printjobs-integration-${process.pid}.sqlite`);
const baseUrl = `http://127.0.0.1:${port}`;
let serverProcess;

async function waitForApi() {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('API did not start within 15 seconds');
}

async function request(url, options = {}) {
  const response = await fetch(`${baseUrl}${url}`, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
}

const validJob = {
  customer_name: 'Integration User',
  file_name: 'integration.pdf',
  pages: 5,
  copies: 1,
  color_mode: 'bw',
  shop_id: 1
};

const staffToken = jwt.sign(
  { id: 999, email: 'staff@test.local', role: 'staff' },
  secret,
  { expiresIn: '1h' }
);

const customerToken = jwt.sign(
  { id: 1000, email: 'customer@test.local', role: 'customer' },
  secret,
  { expiresIn: '1h' }
);

describe('PrintJobs API integration tests', () => {
  beforeAll(async () => {
    serverProcess = spawn(process.execPath, ['src/server.js'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: String(port),
        JWT_SECRET: secret,
        DB_FILE: dbFile
      },
      stdio: 'inherit'
    });

    await waitForApi();
  }, 20000);

  afterAll(() => {
    if (serverProcess && !serverProcess.killed) serverProcess.kill();
  });

  it('returns healthy status', async () => {
    const { response, body } = await request('/api/health');
    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('lists print shops', async () => {
    const { response, body } = await request('/api/print-shops');
    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it('lists print jobs', async () => {
    const { response, body } = await request('/api/print-jobs');
    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it('filters print jobs by status', async () => {
    const { response, body } = await request('/api/print-jobs?status=queued');
    expect(response.status).toBe(200);
    expect(body.every(job => job.status === 'queued')).toBe(true);
  });

  it('returns a print job by ID', async () => {
    const { response, body } = await request('/api/print-jobs/1');
    expect(response.status).toBe(200);
    expect(body.id).toBe(1);
  });

  it('returns 404 for a missing print job', async () => {
    const { response } = await request('/api/print-jobs/999999');
    expect(response.status).toBe(404);
  });

  it('rejects a job with missing fields', async () => {
    const { response } = await request('/api/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: 'Missing fields' })
    });
    expect(response.status).toBe(400);
  });

  it('rejects pages above 200', async () => {
    const { response } = await request('/api/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validJob, pages: 201 })
    });
    expect(response.status).toBe(400);
  });
  it('rejects decimal pages', async () => {
    const { response } = await request('/api/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validJob, pages: 1.5 })
    });
    expect(response.status).toBe(400);
  });

  it('rejects copies above 20', async () => {
    const { response } = await request('/api/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validJob, copies: 21 })
    });
    expect(response.status).toBe(400);
  });

  it('creates a valid print job', async () => {
    const { response, body } = await request('/api/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validJob)
    });
    expect(response.status).toBe(201);
    expect(body.status).toBe('queued');
  });

  it('rejects invalid login credentials with 401', async () => {
    const { response } = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid@test.local', password: 'wrong-password' })
    });
    expect(response.status).toBe(401);
  });

  it('rejects status update without token with 401', async () => {
    const { response } = await request('/api/print-jobs/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'printing' })
    });
    expect(response.status).toBe(401);
  });

  it('rejects customer status update with 403', async () => {
    const { response } = await request('/api/print-jobs/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ status: 'printing' })
    });
    expect(response.status).toBe(403);
  });

  it('allows staff to update a print job', async () => {
    const { response } = await request('/api/print-jobs/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ status: 'printing' })
    });
    expect(response.status).toBe(200);
  });

  it('rejects empty status and preserves the existing status', async () => {
    const before = await request('/api/print-jobs/1');
    const { response } = await request('/api/print-jobs/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ status: '' })
    });
    const after = await request('/api/print-jobs/1');

    expect(response.status).toBe(400);
    expect(after.body.status).toBe(before.body.status);
  });
});



