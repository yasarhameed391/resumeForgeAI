export interface Resume {
  _id: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  content: string;
  preview?: string;
  createdAt: string;
}

export interface JobDescription {
  _id: string;
  title: string;
  company: string;
  content: string;
  extractedKeywords: string[];
  createdAt: string;
}

export interface ATSReport {
  _id: string;
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
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AnalyzeRequest {
  resumeId: string;
  jobId: string;
}

export interface TailorResponse {
  report: ATSReport;
  tailoredResume: string;
  beforeScore: number;
  afterScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}