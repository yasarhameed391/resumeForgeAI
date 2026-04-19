import mongoose, { Schema, Document } from 'mongoose';

export interface IJobDescription extends Document {
  userId: string;
  title: string;
  company: string;
  content: string;
  extractedKeywords: string[];
  createdAt: Date;
}

const JobDescriptionSchema = new Schema<IJobDescription>({
  userId: { type: String, required: true, default: 'default-user' },
  title: { type: String, required: true },
  company: { type: String, default: '' },
  content: { type: String, required: true },
  extractedKeywords: [{ type: String }],
}, { timestamps: true });

export const JobDescription = mongoose.model<IJobDescription>('JobDescription', JobDescriptionSchema);