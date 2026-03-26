import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

import authRoutes        from './routes/auth';
import issueRoutes       from './routes/issues';
import libraryRoutes     from './routes/library';
import aiRoutes          from './routes/ai';
import announcementRoutes from './routes/announcements';
import attendanceRoutes  from './routes/attendance';
import billingRoutes     from './routes/billing';

const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',          authRoutes);
app.use('/api/issues',        issueRoutes);
app.use('/api/library',       libraryRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/attendance',    attendanceRoutes);
app.use('/api/billing',       billingRoutes);

app.get('/api/health', (_, res) => res.json({ success: true, message: 'Campus Aid Buddy API running ✅' }));

app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
