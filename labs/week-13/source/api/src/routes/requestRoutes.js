import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  findAll,
  findById,
  create,
  updateStatus,
  remove,
} from '../services/requestService.js';
// นำเข้า validator หากมี (เช่น validateRequest)
import { validateRequest } from '../middleware/validateRequest.js'; // ปรับตามไฟล์จริงถ้ามี

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const requests = findAll({ status });
    return res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const requestItem = findById(req.params.id);
    if (!requestItem) {
      return res.status(404).json({ error: 'ไม่พบคำร้อง' });
    }
    return res.status(200).json(requestItem);
  } catch (error) {
    next(error);
  }
});

// POST /api/requests — เพิ่ม validateRequest เพื่อป้องกันข้อมูลไม่ครบแล้วพังเป็น 500
router.post('/', validateRequest, async (req, res, next) => {
  try {
    const newRequest = create(req.body);
    return res.status(201).json(newRequest);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, requireRole('staff'), async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // ตรวจสอบว่าสถานะอยู่ในรายการที่อนุญาตหรือไม่
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const updated = updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'ไม่พบคำร้องที่ต้องการแก้ไข' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireRole('staff'), async (req, res, next) => {
  try {
    const deleted = remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'ไม่พบคำร้องที่ต้องการลบ' });
    }
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;