import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const signToken = (id: string, role: string, email: string, name: string) =>
  jwt.sign({ id, role, email, name }, process.env.JWT_SECRET!, { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department, year, rollNumber, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, error: 'Email already registered' });

    const user = await User.create({ name, email, password, role, department, year, rollNumber, phone });
    const token = signToken(user.id, user.role, user.email, user.name);
    res.status(201).json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, year: user.year } },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const token = signToken(user.id, user.role, user.email, user.name);
    res.json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, year: user.year } },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
