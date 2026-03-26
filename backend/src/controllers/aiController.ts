import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const CAMPUS_CONTEXT = `You are Campus Aid Buddy for Sri Venkateswara College of Engineering (SVCE).
Campus timings: 8AM-5PM Mon-Sat. Library: 9AM-8PM. Canteen: 8AM-7PM.
Departments: CSE, ECE, EEE, MECH, CIVIL, IT.
Attendance: minimum 75% required. CGPA: 10-point scale. Exams: Anna University.
Be friendly, helpful and concise.`;

export const askAI = async (req: Request, res: Response) => {
  try {
    const { question, documentText, mode } = req.body;
    if (!question) return res.status(400).json({ success: false, error: 'Question is required' });

    let prompt = '';
    if (mode === 'pdf' && documentText) {
      prompt = `You are Campus Aid Buddy. Answer strictly based on the document below. If the answer is not in the document, say "This information is not available in the uploaded document."\n\nDocument:\n${documentText.substring(0, 15000)}\n\nQuestion: ${question}`;
    } else {
      prompt = `${CAMPUS_CONTEXT}\n\nStudent Question: ${question}`;
    }

    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'AI service is currently unavailable. Please try again.' });
  }
};

export const summarizeIssue = async (req: Request, res: Response) => {
  try {
    const { complaintText } = req.body;
    if (!complaintText) return res.status(400).json({ success: false, error: 'complaintText is required' });

    const result = await model.generateContent(
      `Summarize this student complaint in exactly 2 clear sentences for admin review. Focus on what the problem is and what action is needed. Be neutral and professional.\n\nComplaint: ${complaintText}`
    );
    const summary = result.response.text();
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'AI service is currently unavailable. Please try again.' });
  }
};
