import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import { AuthRequest } from '../middleware/auth';

export const upsertAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, subject, department, year, present, total } = req.body;
    if (!studentId || !subject) return res.status(400).json({ success: false, error: 'studentId and subject required' });

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, subject },
      { studentId, subject, department, year, present, total },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, data: attendance });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const records = await Attendance.find({ studentId: req.params.id });
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDeptAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { dept, year } = req.query;
    const filter: any = {};
    if (dept) filter.department = dept;
    if (year) filter.year = Number(year);
    const records = await Attendance.find(filter).populate('studentId', 'name email rollNumber');
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
