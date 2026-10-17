const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validateCreatePrintJob } = require('./print-job-validation');

const app = express();

// 1. ตั้งค่าจำกัดขนาด JSON body ไว้ที่ 10kb เพื่อรองรับการตรวจสอบข้อ 413 (Payload Too Large)
app.use(express.json({ limit: '10kb' }));

// ตั้งค่าความลับของ JWT
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET is required'); })() : 'dev-secret-key');

// เชื่อมต่อฐานข้อมูล SQLite (รองรับ DB_FILE จากตัวเช็คโปรเจกต์)
const dbFile = process.env.DB_FILE || './database.sqlite';
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to SQLite database.');
});

// สร้างตารางเริ่มต้นและใส่ Seed ข้อมูลเริ่มต้น (อย่างน้อย 5 รายการ)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS print_shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    building TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS print_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    pages INTEGER NOT NULL CHECK (pages BETWEEN 1 AND 200),
    copies INTEGER NOT NULL CHECK (copies BETWEEN 1 AND 20),
    color_mode TEXT NOT NULL,
    shop_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'printing', 'ready', 'picked-up')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES print_shops(id)
  )`, () => {
    db.get("SELECT COUNT(*) as count FROM print_shops", (err, row) => {
      if (row && row.count === 0) {
        db.run("INSERT INTO print_shops (id, name, location, building) VALUES (1, 'Central Print', 'Floor 1', 'IT Building')");
      }
    });

    db.get("SELECT COUNT(*) as count FROM print_jobs", (err, row) => {
      if (row && row.count < 5) {
        const sampleJobs = [
          ['User One', 'doc1.pdf', 5, 1, 'bw', 1, 'queued'],
          ['User Two', 'doc2.pdf', 10, 2, 'color', 1, 'printing'],
          ['User Three', 'doc3.pdf', 3, 1, 'bw', 1, 'ready'],
          ['User Four', 'doc4.pdf', 15, 3, 'color', 1, 'queued'],
          ['User Five', 'doc5.pdf', 8, 1, 'bw', 1, 'queued']
        ];
        const stmt = db.prepare("INSERT INTO print_jobs (customer_name, file_name, pages, copies, color_mode, shop_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        sampleJobs.forEach(job => stmt.run(job));
        stmt.finalize();
      }
    });
  });
});

// Middleware: ตรวจสอบ Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    req.user = user;
    next();
  });
}

// Middleware: ตรวจสอบสิทธิ์ Staff
function requireStaff(req, res, next) {
  if (!req.user || req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Forbidden: Staff access required' });
  }
  next();
}

// 1. Health Check
app.get('/api/health', (req, res) => {
  db.get('SELECT 1', (err) => {
    if (err) return res.status(500).json({ status: 'error', database: 'disconnected' });
    res.json({ status: 'ok', database: 'connected' });
  });
});

// 2. Auth Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const invalidMsg = 'Invalid email or password';

  const staffEmail = process.env.STAFF_EMAIL || (process.env.NODE_ENV !== 'production' ? 'staff@printshop.local' : '');
  const staffPassword = process.env.STAFF_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'password123' : '');

  if (staffEmail && staffPassword && email === staffEmail && password === staffPassword) {
    const token = jwt.sign({ id: 999, email, role: 'staff' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, role: 'staff' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: invalidMsg });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: invalidMsg });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  });
});

// 3. Print Shops API (GET)
app.get('/api/print-shops', (req, res) => {
  db.all('SELECT * FROM print_shops', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 4. Print Jobs API (GET - List & Filter by status)
app.get('/api/print-jobs', (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT print_jobs.*,
           print_shops.name AS shop_name,
           print_shops.location AS shop_location,
           print_shops.building AS shop_building
    FROM print_jobs
    JOIN print_shops ON print_jobs.shop_id = print_shops.id
  `;
  const params = [];

  if (status) {
    query += ' WHERE print_jobs.status = ?';
    params.push(status);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 5. Print Jobs API (GET - One by ID)
app.get('/api/print-jobs/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT print_jobs.*,
           print_shops.name AS shop_name,
           print_shops.location AS shop_location,
           print_shops.building AS shop_building
    FROM print_jobs
    JOIN print_shops ON print_jobs.shop_id = print_shops.id
    WHERE print_jobs.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Print job not found' });
    res.json(row);
  });
});

// 6. Print Jobs API (POST - Create with validation rules)
app.post('/api/print-jobs', (req, res) => {
  const validationError = validateCreatePrintJob(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { customer_name, file_name, pages, copies, color_mode, shop_id } = req.body;

  const query = `INSERT INTO print_jobs (customer_name, file_name, pages, copies, color_mode, shop_id, status) VALUES (?, ?, ?, ?, ?, ?, 'queued')`;
  db.run(query, [customer_name, file_name, pages, copies, color_mode, shop_id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID, customer_name, file_name, pages, copies, color_mode, shop_id, status: 'queued' });
  });
});

// 7. Print Jobs API (PUT - Update status, Staff only)
app.put('/api/print-jobs/:id', authenticateToken, requireStaff, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['queued', 'printing', 'ready', 'picked-up'];
  if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.get('SELECT * FROM print_jobs WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Print job not found' });

    db.run('UPDATE print_jobs SET status = ? WHERE id = ?', [status, id], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Updated successfully' });
    });
  });
});

// 8. Print Jobs API (DELETE - Staff only)
app.delete('/api/print-jobs/:id', authenticateToken, requireStaff, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM print_jobs WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Print job not found' });

    db.run('DELETE FROM print_jobs WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(204).send();
    });
  });
});

// Error Handler สำหรับ Payload ใหญ่เกิน 10kb (413 Payload Too Large)
app.use((err, req, res, next) => {
  if (err.status === 413 || err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  next(err);
});

const PORT = process.env.PORT || 3000;
let server = null;

// เริ่มต้น Server ทันที เพื่อรองรับการทดสอบของตัวเช็คโปรเจกต์
server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// รองรับฟังก์ชัน close สำหรับตัวเช็คโปรเจกต์
app.close = (callback) => {
  if (server) {
    server.close((err) => {
      if (typeof callback === 'function') callback(err);
    });
  } else if (typeof callback === 'function') {
    callback();
  }
};

module.exports = app;
