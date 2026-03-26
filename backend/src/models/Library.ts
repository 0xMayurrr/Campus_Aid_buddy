import mongoose, { Schema, Document } from 'mongoose';

export interface ILibrary extends Document {
  displayId: string;
  title: string;
  type: 'pdf' | 'video' | 'doc';
  fileUrl: string;
  department: string;
  year: number;
  subject: string;
  topic?: string;
  description?: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedByName: string;
}

const LibrarySchema = new Schema<ILibrary>({
  displayId:      { type: String },
  title:          { type: String, required: true },
  type:           { type: String, enum: ['pdf', 'video', 'doc'], required: true },
  fileUrl:        { type: String, required: true },
  department:     { type: String, required: true },
  year:           { type: Number, required: true },
  subject:        { type: String, required: true },
  topic:          { type: String },
  description:    { type: String },
  uploadedBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedByName: { type: String, required: true },
}, { timestamps: true });

LibrarySchema.pre('save', function (next) {
  if (!this.displayId) {
    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.displayId = `#SVCE-${this.type.toUpperCase()}-${shortId}`;
  }
  next();
});

export default mongoose.model<ILibrary>('Library', LibrarySchema);
