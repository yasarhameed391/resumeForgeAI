import { Request, Response } from 'express';
import { jobService } from '../services/jobService.js';

export class JobController {
  async create(req: Request, res: Response) {
    try {
      const { content, title, company } = req.body;
      
      if (!content || !title) {
        return res.status(400).json({ 
          success: false, 
          error: 'Content and title are required' 
        });
      }

      const job = await jobService.createJob(content, title, company || '');
      res.status(201).json({ success: true, data: job });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const jobs = await jobService.getJobs();
      res.json({ success: true, data: jobs });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const job = await jobService.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job description not found' });
      }
      res.json({ success: true, data: job });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deleted = await jobService.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Job description not found' });
      }
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }
}

export const jobController = new JobController();