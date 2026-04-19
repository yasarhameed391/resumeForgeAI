export interface Resume {
  _id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobDescription {
  _id: string;
  userId: string;
  title: string;
  company: string;
  content: string;
  extractedKeywords: string[];
  createdAt: Date;
}

export interface ATSReport {
  _id: string;
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

export interface AnalyzeRequest {
  resumeId: string;
  jobId: string;
}

export interface TailorRequest {
  reportId: string;
}

export interface SaveRequest {
  reportId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}