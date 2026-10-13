import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from './config.js';
import requestRoutes from './routes/requestRoutes.js';
import userRoutes from './routes/userRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js'; // นำเข้า authRoutes สำหรับ CP50
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // ① CORS — dev ใช้ (frontend 5173 เรียก API 3001 ข้ามพอร์ต)
  app.use(cors({ origin: config.corsOrigin }));

  // ② logging
  if (config.env !== 'test') app.use(morgan(config.isProd ? 'combined' : 'dev'));

  // ③ อ่าน JSON body (จำกัดขนาด body ไม่เกิน 10kb ตามโจทย์ CP48)
  app.use(express.json({ limit: '10kb' }));

  // ④ route ของ API — ทุกอย่างอยู่ใต้ /api
  app.get('/api', (req, res) => {
    res.json({ message: 'Campus Service API is running', version: '3.0.0' });
  });
  app.use('/api/health', healthRoutes);
  
  // ผูก authRoutes ที่ /api/auth (CP50)
  app.use('/api/auth', authRoutes);
  
  app.use('/api/requests', requestRoutes);
  app.use('/api/users', userRoutes);

  // ⑤ หน้าแรก / — ขึ้นกับสภาพแวดล้อม (CP39)
  if (config.isProd && existsSync(config.staticDir)) {
    app.use(express.static(config.staticDir));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(config.staticDir, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.json({ message: 'Campus Service API (dev) — หน้าเว็บอยู่ที่ Vite พอร์ต 5173', api: '/api' });
    });
  }

  // ⑥ ปิดท้าย — ต้องอยู่หลังสุดเสมอ
  app.use(notFound);
  app.use(errorHandler);

  return app;
}