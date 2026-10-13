import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(HERE, '../..');
const DB_FILE = process.env.DB_FILE ?? path.join(API_ROOT, 'data', 'campus.db');
const SCHEMA_FILE = path.join(API_ROOT, 'data', 'schema.sql');

let db;
let driver = 'sqlite';

async function openDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    const { default: Database } = await import('libsql');   
    driver = 'turso';
    return new Database(url, { authToken: process.env.TURSO_AUTH_TOKEN });
  }
  driver = 'sqlite';
  return new DatabaseSync(DB_FILE);
}

const SELECT_SHAPE = `
  SELECT r.id,
         u.name          AS requesterName,
         r.request_type  AS requestType,
         r.location,
         r.details,
         r.priority,
         r.status
  FROM requests r
  JOIN users u ON u.id = r.requester_id`;

export async function loadSeed() {
  db = await openDatabase();
  db.exec('PRAGMA foreign_keys = ON');   
  const ready = db.prepare(
    "SELECT COUNT(*) c FROM sqlite_master WHERE type='table' AND name='requests'"
  ).get().c;
  if (!ready && existsSync(SCHEMA_FILE)) {
    db.exec(readFileSync(SCHEMA_FILE, 'utf8'));
  }
}

export function getDbStatus() {
  try {
    if (!db) return { connected: false, reason: 'ยังไม่ได้เปิดฐานข้อมูล' };
    const n = db.prepare("SELECT COUNT(*) c FROM sqlite_master WHERE type='table'").get().c;
    return { connected: true, driver, tables: n };
  } catch (e) {
    return { connected: false, reason: e.message };
  }
}

export function findAll({ status } = {}) {
  return status
    ? db.prepare(`${SELECT_SHAPE} WHERE r.status = ? ORDER BY r.id`).all(status)
    : db.prepare(`${SELECT_SHAPE} ORDER BY r.id`).all();
}

export function findById(id) {
  return db.prepare(`${SELECT_SHAPE} WHERE r.id = ?`).get(id) ?? null;
}

/** สร้างรหัสคำร้องถัดไป ดึงข้อมูลจากฐานข้อมูลโดยตรง ป้องกัน Error */
function nextId() {
  const rows = db.prepare('SELECT id FROM requests').all();
  if (!rows || rows.length === 0) return 'REQ-001';

  let max = 0;
  for (const r of rows) {
    if (r.id && r.id.includes('-')) {
      const num = parseInt(r.id.split('-')[1], 10);
      if (!isNaN(num) && num > max) {
        max = num;
      }
    }
  }
  const newNumber = max + 1;
  return `REQ-${String(newNumber).padStart(3, '0')}`;
}

function resolveUserId(name) {
  const found = db.prepare('SELECT id FROM users WHERE name = ?').get(name);
  if (found) return found.id;
  const slug = Date.now().toString(36);
  const info = db.prepare('INSERT INTO users (name, department, email) VALUES (?, ?, ?)')
                 .run(name, 'ไม่ระบุ', `user-${slug}@rmutl.ac.th`);
  return info.lastInsertRowid;
}

export function create(input) {
  const id = nextId();
  try {
    const requesterId = resolveUserId(input.requesterName.trim());
    db.prepare(
      `INSERT INTO requests (id, requester_id, request_type, location, details, priority)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      id, 
      requesterId, 
      input.requestType, 
      input.location.trim(), 
      input.details.trim(), 
      input.priority ?? 'normal'
    );
    return findById(id);
  } catch (err) {
    throw err;
  }
}

export function updateStatus(id, status) {
  const result = db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, id);
  return result.changes ? findById(id) : null;
}

export function remove(id) {
  const target = findById(id);
  if (!target) return null;
  db.prepare('DELETE FROM requests WHERE id = ?').run(id);
  return target;
}

export function listUsers() {
  return db.prepare('SELECT id, name, department FROM users ORDER BY id').all();
}

export function listRequestsByUser(userId) {
  return db.prepare(
    `SELECT r.id, r.request_type AS requestType, r.status
     FROM requests r WHERE r.requester_id = ? ORDER BY r.id`
  ).all(userId);
}