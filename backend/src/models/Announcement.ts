import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  body: string;
  targetRole: 'all' | 'student' | 'faculty' | 'hod';
  postedBy: mongoose.Types.ObjectId;
  postedByName: string;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title:        { type: String, required: true },
  body:         { type: String, required: true },
  targetRole:   { type: String, enum: ['all', 'student', 'faculty', 'hod'], default: 'all' },
  postedBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  postedByName: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
