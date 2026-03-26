import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Issue from '../models/Issue';
import { AuthRequest } from '../middleware/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function summarizeWithAI(text: string): Promise<string> {
  try {
    const result = await model.generateContent(
      `Summarize this student complaint in 2 sentences for admin review: ${text}`
    );
    return result.response.text();
  } catch {
    return '';
  }
}

export const createIssue = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, department, priority, location } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, error: 'Title and description required' });

    const aiSummary = await summarizeWithAI(`${title}. ${description}`);

    const issue = await Issue.create({
      studentId: req.user!.id,
      title, description, aiSummary,
      category: category || 'other',
      department: department || req.user!.role,
      priority: priority || 'medium',
      location,
      raisedByName: req.user!.name,
      raisedByEmail: req.user!.email,
    });
    res.status(201).json({ success: true, data: issue });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getIssues = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user!;
    let issues;
    if (role === 'admin' || role === 'hod') {
      issues = await Issue.find().sort({ createdAt: -1 });
    } else if (role === 'faculty') {
      issues = await Issue.find({ department: (req as any).query.dept }).sort({ createdAt: -1 });
    } else {
      issues = await Issue.find({ studentId: id }).sort({ createdAt: -1 });
    }
    res.json({ success: true, data: issues });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateIssueStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'resolved' ? { resolvedBy: req.user!.id, resolvedAt: new Date() } : {}) },
      { new: true }
    );
    if (!issue) return res.status(404).json({ success: false, error: 'Issue not found' });
    res.json({ success: true, data: issue });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteIssue = async (req: AuthRequest, res: Response) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
