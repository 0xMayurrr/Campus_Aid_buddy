import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'hod' | 'admin';
  department?: string;
  year?: number;
  phone?: string;
  rollNumber?: string;
  profilePic?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true, minlength: 6 },
  role:        { type: String, enum: ['student', 'faculty', 'hod', 'admin'], default: 'student' },
  department:  { type: String },
  year:        { type: Number },
  phone:       { type: String },
  rollNumber:  { type: String },
  profilePic:  { type: String },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
