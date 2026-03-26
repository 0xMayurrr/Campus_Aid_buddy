import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import Billing from '../models/Billing';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();
router.use(protect);

router.get('/student/:id', async (req: AuthRequest, res: Response) => {
  try {
    const records = await Billing.find({ studentId: req.params.id });
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, feeType, amount, dueDate } = req.body;
    if (!studentId || !feeType || !amount || !dueDate) {
      return res.status(400).json({ success: false, error: 'studentId, feeType, amount, dueDate required' });
    }
    const record = await Billing.create({ studentId, feeType, amount, dueDate });
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id/pay', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const record = await Billing.findByIdAndUpdate(req.params.id, { status: 'paid', paidDate: new Date() }, { new: true });
    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
