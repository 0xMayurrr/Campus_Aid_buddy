import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  subject: string;
  department: string;
  year: number;
  present: number;
  total: number;
  percentage: number;
}

const AttendanceSchema = new Schema<IAttendance>({
  studentId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject:    { type: String, required: true },
  department: { type: String, required: true },
  year:       { type: Number, required: true },
  present:    { type: Number, default: 0 },
  total:      { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
}, { timestamps: true });

AttendanceSchema.pre('save', function (next) {
  this.percentage = this.total > 0 ? Math.round((this.present / this.total) * 100) : 0;
  next();
});

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
