import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: String, required: true, default: 'default-user' },
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);