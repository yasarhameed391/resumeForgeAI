import { ATSReport, IATSReport } from '../models/ATSReport.js';
import { Resume, IResume } from '../models/Resume.js';
import { JobDescription, IJobDescription } from '../models/JobDescription.js';

export interface AnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export class ATSService {
  analyze(resumeContent: string, keywords: string[]): AnalysisResult {
    const resumeLower = resumeContent.toLowerCase();
    
    const matchedKeywords = keywords.filter(keyword => 
      resumeLower.includes(keyword.toLowerCase())
    );
    
    const missingKeywords = keywords.filter(keyword => 
      !resumeLower.includes(keyword.toLowerCase())
    );
    
    const score = keywords.length > 0 
      ? Math.round((matchedKeywords.length / keywords.length) * 100)
      : 0;
    
    const suggestions = missingKeywords.slice(0, 10).map(keyword => {
      return `Add "${keyword}" to your resume if applicable to your experience`;
    });

    return {
      score,
      matchedKeywords,
      missingKeywords,
      suggestions
    };
  }

  async analyzeResumeVsJob(
    resumeId: string,
    jobId: string,
    userId: string = 'default-user'
  ): Promise<IATSReport> {
    const resume = await Resume.findById(resumeId);
    const job = await JobDescription.findById(jobId);

    if (!resume) throw new Error('Resume not found');
    if (!job) throw new Error('Job description not found');

    const analysis = this.analyze(resume.content, job.extractedKeywords);

    const report = new ATSReport({
      userId,
      resumeId,
      jobId,
      score: analysis.score,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions,
      beforeTailoring: true,
      tailoredResume: null,
      tailoredScore: null,
      saved: false
    });

    return report.save();
  }

  async getReport(id: string): Promise<IATSReport | null> {
    return ATSReport.findById(id);
  }

  async getHistory(userId: string = 'default-user', limit: number = 20): Promise<IATSReport[]> {
    return ATSReport.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  async updateTailoredResume(
    reportId: string,
    tailoredResume: string,
    jobKeywords: string[]
  ): Promise<IATSReport | null> {
    const analysis = this.analyze(tailoredResume, jobKeywords);

    return ATSReport.findByIdAndUpdate(
      reportId,
      {
        tailoredResume,
        tailoredScore: analysis.score,
        matchedKeywords: analysis.matchedKeywords,
        missingKeywords: analysis.missingKeywords,
        suggestions: analysis.suggestions,
        beforeTailoring: false
      },
      { new: true }
    );
  }

  async saveReport(reportId: string): Promise<IATSReport | null> {
    return ATSReport.findByIdAndUpdate(
      reportId,
      { saved: true },
      { new: true }
    );
  }
}

export const atsService = new ATSService();