import mongoose, { Schema, Document } from 'mongoose';

export interface IATSReport extends Document {
  userId: string;
  resumeId: string;
  jobId: string;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  beforeTailoring: boolean;
  tailoredResume: string | null;
  tailoredScore: number | null;
  saved: boolean;
  createdAt: Date;
}

const ATSReportSchema = new Schema<IATSReport>({
  userId: { type: String, required: true, default: 'default-user' },
  resumeId: { type: String, required: true },
  jobId: { type: String, required: true },
  score: { type: Number, required: true },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  suggestions: [{ type: String }],
  beforeTailoring: { type: Boolean, default: true },
  tailoredResume: { type: String, default: null },
  tailoredScore: { type: Number, default: null },
  saved: { type: Boolean, default: false },
}, { timestamps: true });

export const ATSReport = mongoose.model<IATSReport>('ATSReport', ATSReportSchema);