import { Request, Response } from 'express';
import { atsService } from '../services/atsService.js';
import { tailorService } from '../services/tailorService.js';
import { jobService } from '../services/jobService.js';
import { ATSReport } from '../models/ATSReport.js';

export class ATSController {
  async analyze(req: Request, res: Response) {
    try {
      const { resumeId, jobId } = req.body;

      if (!resumeId || !jobId) {
        return res.status(400).json({
          success: false,
          error: 'resumeId and jobId are required'
        });
      }

      const report = await atsService.analyzeResumeVsJob(resumeId, jobId);
      res.status(201).json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async getReport(req: Request, res: Response) {
    try {
      const report = await atsService.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await atsService.getHistory(undefined, limit);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async tailor(req: Request, res: Response) {
    try {
      const { reportId } = req.body;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          error: 'reportId is required'
        });
      }

      const report = await atsService.getReport(reportId);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      const job = await jobService.getJobById(report.jobId);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      const result = await tailorService.tailorResume(report.resumeId, report.jobId);

      const updatedReport = await atsService.updateTailoredResume(
        reportId,
        result.tailoredResume,
        job.extractedKeywords
      );

      res.json({
        success: true,
        data: {
          report: updatedReport,
          tailoredResume: result.tailoredResume,
          beforeScore: report.score,
          afterScore: result.score,
          matchedKeywords: result.matchedKeywords,
          missingKeywords: result.missingKeywords
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async save(req: Request, res: Response) {
    try {
      const { reportId } = req.body;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          error: 'reportId is required'
        });
      }

      const report = await atsService.getReport(reportId);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      if (!report.tailoredResume || !report.tailoredScore || report.tailoredScore < 90) {
        return res.status(400).json({
          success: false,
          error: 'Cannot save: tailored score must be at least 90'
        });
      }

      const saved = await atsService.saveReport(reportId);
      res.json({ success: true, data: saved });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }
}

export const atsController = new ATSController();