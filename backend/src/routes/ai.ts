import { Router } from 'express';
import { askAI, summarizeIssue } from '../controllers/aiController';

const router = Router();
router.post('/ask', askAI);
router.post('/summarize', summarizeIssue);
export default router;
