import { Router } from 'express';
import { upsertAttendance, getStudentAttendance, getDeptAttendance } from '../controllers/attendanceController';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();
router.use(protect);
router.post('/', requireRole('faculty', 'hod', 'admin'), upsertAttendance);
router.get('/student/:id', getStudentAttendance);
router.get('/department', requireRole('hod', 'admin'), getDeptAttendance);
export default router;
