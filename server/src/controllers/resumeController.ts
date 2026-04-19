import { Request, Response } from 'express';
import { resumeService } from '../services/resumeService.js';

export class ResumeController {
  async upload(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const resume = await resumeService.uploadResume(file);
      const preview = resume.content.slice(0, 500) + (resume.content.length > 500 ? '...' : '');
      res.status(201).json({ 
        success: true, 
        data: { 
          _id: resume._id,
          userId: resume.userId,
          fileName: resume.fileName,
          fileType: resume.fileType,
          content: resume.content,
          preview: preview,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const resumes = await resumeService.getResumes();
      res.json({ success: true, data: resumes });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const resume = await resumeService.getResumeById(req.params.id);
      if (!resume) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      res.json({ success: true, data: resume });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deleted = await resumeService.deleteResume(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  }
}

export const resumeController = new ResumeController();