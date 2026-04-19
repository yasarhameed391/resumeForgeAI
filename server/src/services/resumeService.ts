import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { Resume, IResume } from '../models/Resume.js';

export class ResumeService {
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }

  async extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to extract text from DOCX: ${error}`);
    }
  }

  async extractText(file: Express.Multer.File): Promise<string> {
    const fileType = file.mimetype;
    
    if (fileType === 'application/pdf') {
      return this.extractTextFromPDF(file.buffer);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return this.extractTextFromDOCX(file.buffer);
    } else if (fileType === 'application/msword') {
      return this.extractTextFromDOCX(file.buffer);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  async uploadResume(file: Express.Multer.File, userId: string = 'default-user'): Promise<IResume> {
    const content = await this.extractText(file);
    const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';

    const resume = new Resume({
      userId,
      fileName: file.originalname,
      fileType,
      content
    });

    return resume.save();
  }

  async getResumes(userId: string = 'default-user'): Promise<IResume[]> {
    return Resume.find({ userId }).sort({ createdAt: -1 });
  }

  async getResumeById(id: string): Promise<IResume | null> {
    return Resume.findById(id);
  }

  async deleteResume(id: string): Promise<boolean> {
    const result = await Resume.findByIdAndDelete(id);
    return !!result;
  }
}

export const resumeService = new ResumeService();