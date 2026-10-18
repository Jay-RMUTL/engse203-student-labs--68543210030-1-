import { config } from './config.js';
import { createApp } from './app.js';
import { loadSeed } from './services/requestService.js';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

await loadSeed();
const app = createApp();

app.listen((config.port ?? 3001), (err) => {
  if (err) throw err;   // Express 5 ส่ง error (เช่น EADDRINUSE พอร์ตถูกใช้อยู่) มาที่นี่ — ไม่ throw จะขึ้นว่า "พร้อม" ทั้งที่เปิดไม่ได้
  console.log(`Campus Service API พร้อมที่ http://localhost:${(config.port ?? 3001)}`);
  console.log(`อนุญาตให้เรียกจาก: ${(config.corsOrigin ?? "http://localhost:5173")}`);
});
