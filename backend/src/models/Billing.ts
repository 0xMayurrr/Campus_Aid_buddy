import mongoose, { Schema, Document } from 'mongoose';

export interface IBilling extends Document {
  studentId: mongoose.Types.ObjectId;
  feeType: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: Date;
  paidDate?: Date;
}

const BillingSchema = new Schema<IBilling>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  feeType:   { type: String, required: true },
  amount:    { type: Number, required: true },
  status:    { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  dueDate:   { type: Date, required: true },
  paidDate:  { type: Date },
}, { timestamps: true });

export default mongoose.model<IBilling>('Billing', BillingSchema);
