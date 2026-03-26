import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import Announcement from '../models/Announcement';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.user!;
    const filter = role === 'admin' ? {} : { targetRole: { $in: ['all', role] } };
    const items = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', protect, requireRole('admin', 'hod', 'faculty'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, targetRole } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, error: 'title and body required' });
    const item = await Announcement.create({ title, body, targetRole: targetRole || 'all', postedBy: req.user!.id, postedByName: req.user!.name });
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', protect, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
