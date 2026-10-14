import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import jwt from 'jsonwebtoken';

const port = 3217;
const secret = 'printjobs-test-secret';
const dbFile = path.join(tmpdir(), `printjobs-test-${process.pid}.sqlite`);
const baseUrl = `http://127.0.0.1:${port}`;

let serverProcess;

async function waitForApi() {
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('API did not start within 10 seconds');
}

async function getJson(url, options = {}) {
  const response = await fetch(`${baseUrl}${url}`, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
}

describe('PrintJobs API integration', () => {
  beforeAll(async () => {
    serverProcess = spawn(process.execPath, [path.resolve('src/server.js')], {
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
  }, 15000);

  afterAll(() => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
  });

  it('B3: health endpoint returns healthy status', async () => {
    const { response, body } = await getJson('/api/health');
    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('B3: lists print jobs', async () => {
    const { response, body } = await getJson('/api/print-jobs');
    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it('B3: returns an existing print job', async () => {
    const { response, body } = await getJson('/api/print-jobs/1');
    expect(response.status).toBe(200);
    expect(body).toHaveProperty('id', 1);
  });

  it('B3: rejects a print job with missing fields', async () => {
    const { response, body } = await getJson('/api/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: 'Test User' })
    });
    expect(response.status).toBe(400);
    expect(body).toHaveProperty('error');
  });

  it('B3: creates a valid print job', async () => {
    const { response, body } = await getJson('/api/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Integration Test',
        file_name: 'integration-test.pdf',
        pages: 2,
        copies: 1,
        color_mode: 'bw',
        shop_id: 1
      })
    });
    expect(response.status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('queued');
  });

  it('B4: rejects staff-only updates without a token (401)', async () => {
    const { response, body } = await getJson('/api/print-jobs/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'printing' })
    });
    expect(response.status).toBe(401);
    expect(body).toHaveProperty('error');
  });

  it('B4: rejects a customer token on staff-only updates (403)', async () => {
    const token = jwt.sign(
      { id: 1, role: 'customer' },
      secret,
      { expiresIn: '5m' }
    );

    const { response, body } = await getJson('/api/print-jobs/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'printing' })
    });
    expect(response.status).toBe(403);
    expect(body).toHaveProperty('error');
  });
});



