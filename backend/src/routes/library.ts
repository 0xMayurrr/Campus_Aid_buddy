import { Router } from 'express';
import multer from 'multer';
import { uploadLibraryItem, getLibraryItems, deleteLibraryItem } from '../controllers/libraryController';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const router = Router();
router.get('/', getLibraryItems);
router.post('/upload', protect, requireRole('faculty', 'hod', 'admin'), upload.single('file'), uploadLibraryItem);
router.delete('/:id', protect, requireRole('faculty', 'hod', 'admin'), deleteLibraryItem);
export default router;
