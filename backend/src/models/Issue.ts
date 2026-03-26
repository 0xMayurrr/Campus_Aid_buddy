import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  aiSummary?: string;
  department?: string;
  category: 'academic' | 'facility' | 'complaint' | 'service_request' | 'hostel' | 'transport' | 'other';
  status: 'submitted' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  raisedByName: string;
  raisedByEmail: string;
  location?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

const IssueSchema = new Schema<IIssue>({
  studentId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  aiSummary:    { type: String },
  department:   { type: String },
  category:     { type: String, enum: ['academic', 'facility', 'complaint', 'service_request', 'hostel', 'transport', 'other'], default: 'other' },
  status:       { type: String, enum: ['submitted', 'in_progress', 'resolved', 'closed'], default: 'submitted' },
  priority:     { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  raisedByName: { type: String, required: true },
  raisedByEmail:{ type: String, required: true },
  location:     { type: String },
  resolvedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt:   { type: Date },
}, { timestamps: true });

export default mongoose.model<IIssue>('Issue', IssueSchema);
