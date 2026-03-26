import { Router } from 'express';
import { createIssue, getIssues, updateIssueStatus, deleteIssue } from '../controllers/issueController';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();
router.use(protect);
router.post('/', createIssue);
router.get('/', getIssues);
router.put('/:id/status', requireRole('faculty', 'hod', 'admin'), updateIssueStatus);
router.delete('/:id', requireRole('admin'), deleteIssue);
export default router;
