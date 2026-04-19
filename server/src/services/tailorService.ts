import { atsService } from './atsService.js';
import { Resume, IResume } from '../models/Resume.js';
import { JobDescription, IJobDescription } from '../models/JobDescription.js';

export interface TailorResult {
  tailoredResume: string;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export type PromptType = 
  | 'TAILOR_RESUME' 
  | 'PROFESSIONAL_SUMMARY' 
  | 'ACHIEVEMENTS_METRICS' 
  | 'IDENTIFY_SKILLS' 
  | 'CAREER_GAPS' 
  | 'REWRITE_EXPERIENCE' 
  | 'ATS_OPTIMIZE' 
  | 'PIVOT_ROLE' 
  | 'BULLET_POINTS' 
  | 'SKILLS_ENHANCEMENT'
  | 'COVER_LETTER';

interface PromptVars {
  jobTitle?: string;
  company?: string;
  experience?: string;
  jobDescription?: string;
  yearsExperience?: string;
  skills?: string;
  startDate?: string;
  endDate?: string;
  duringGap?: string;
  originalText?: string;
  resume?: string;
  currentTitle?: string;
  targetTitle?: string;
  responsibilities?: string;
  achievements?: string;
  industry?: string;
}

export const PromptTemplates: Record<PromptType, (vars: PromptVars) => string> = {
  TAILOR_RESUME: (vars) =>
    `Write a tailored resume for a ${vars.jobTitle || 'Job Title'} position at ${vars.company || 'Company'}. Use my past work experience: ${vars.experience || 'my experience'}, and include 3-5 bullet points per role that incorporate keywords from this job description: ${vars.jobDescription || 'job description'}.`,

  PROFESSIONAL_SUMMARY: (vars) =>
    `Create a professional summary for my resume under 100 words. Highlight my ${vars.yearsExperience || 'X'} years of experience, key skills in ${vars.skills || 'list skills'}, and achievements relevant to a ${vars.jobTitle || 'Job Title'} role.`,

  ACHIEVEMENTS_METRICS: (vars) =>
    `Write 3-5 bullet points for my role as ${vars.jobTitle || 'Job Title'} at ${vars.company || 'Company'} that showcase achievements using metrics. For example, include accomplishments like increasing revenue by X% or reducing costs by Y%.${vars.achievements ? ` Here are my achievements: ${vars.achievements}` : ''}`,

  IDENTIFY_SKILLS: (vars) =>
    `Based on my experience as a ${vars.jobTitle || 'Job Title'}, identify the top technical and soft skills I should emphasize for a role in ${vars.industry || 'Industry'}.`,

  CAREER_GAPS: (vars) =>
    `Help me explain a career gap from ${vars.startDate || 'start date'} to ${vars.endDate || 'end date'} on my resume in a way that highlights any skills, experiences, or personal growth gained during that time.${vars.duringGap ? ` During this time I: ${vars.duringGap}` : ''}`,

  REWRITE_EXPERIENCE: (vars) =>
    `Rewrite the experience section of my resume to make it more impactful and action-oriented. Here is the original text: ${vars.originalText || 'your experience text'}.`,

  ATS_OPTIMIZE: (vars) =>
    `You are a professional resume editor. Your ONLY task is to make my EXISTING resume ATS-friendly. 
Do NOT add, fabricate, or assume ANY new information. Simply rephrase my EXISTING content to include relevant keywords naturally.

MY COMPLETE RESUME (keep EVERYTHING exactly as-is, just rephrase):
${vars.resume || 'my complete resume'}

JOB DESCRIPTION (extract keywords only, do not summarize or change my experience):
${vars.jobDescription || 'job description'}

YOUR TASK:
1. KEEP ALL my experience, jobs, skills, and accomplishments - EVERYTHING exactly as written
2. KEEP all dates, company names, job titles exactly as I provided
3. Only add/replace a few relevant keywords where they naturally fit in existing bullet points
4. Do NOT change numbers, percentages, or achievements
5. Do NOT add new bullet points or experiences
6. Output the ENTIRE resume with all sections

If no keywords match, output the resume exactly as I wrote it with no changes.

FULL OUTPUT (my complete resume with minor keyword additions only):`,

  PIVOT_ROLE: (vars) =>
    `I want to transition from my current role as ${vars.currentTitle || 'Current Job Title'} to a new position as ${vars.targetTitle || 'Target Job Title'}. How should I rewrite my resume to emphasize transferable skills and relevant accomplishments? Here is my experience: ${vars.experience || 'my experience'}.`,

  BULLET_POINTS: (vars) =>
    `Write concise and impactful bullet points for my experience as ${vars.jobTitle || 'Job Title'} at ${vars.company || 'Company'}, focusing on achievements, responsibilities, and measurable outcomes.${vars.responsibilities ? ` My responsibilities: ${vars.responsibilities}` : ''}`,

  SKILLS_ENHANCEMENT: (vars) =>
    `Based on this job description: ${vars.jobDescription || 'job description'}, suggest the top 5 hard and soft skills I should include in the skills section of my resume.`,

  COVER_LETTER: (vars) =>
    `Write a professional cover letter (250-350 words) for a job position. Base it ONLY on my resume - do NOT make up any details.

MY RESUME (use ONLY these facts):
${vars.resume || 'my resume'}

JOB DESCRIPTION:
${vars.jobDescription || 'job description'}

Write a cover letter with:
1. Professional greeting (use "Dear Hiring Manager" if no name)
2. State the position I'm applying for
3. 2-3 paragraphs highlighting EXACTLY what is in my resume
4. Call to action
5. Professional closing

IMPORTANT RULES:
- Use ONLY facts from my resume
- Do NOT make up achievements, skills, or experiences
- If my resume doesn't mention something, don't add it
- Keep my actual job titles, companies, dates

COVER LETTER:`,
};

export const PromptDescriptions: Record<PromptType, string> = {
  TAILOR_RESUME: 'Tailor your resume to a specific job description',
  PROFESSIONAL_SUMMARY: 'Create a professional summary for your resume',
  ACHIEVEMENTS_METRICS: 'Write achievement bullet points with metrics',
  IDENTIFY_SKILLS: 'Identify key skills for your industry',
  CAREER_GAPS: 'Explain career gaps professionally',
  REWRITE_EXPERIENCE: 'Rewrite experience section to be impact-focused',
  ATS_OPTIMIZE: 'Optimize resume for ATS systems',
  PIVOT_ROLE: 'Pivot to a new career role',
  BULLET_POINTS: 'Write impactful bullet points',
  SKILLS_ENHANCEMENT: 'Enhance skills section based on job description',
  COVER_LETTER: 'Generate a cover letter for the job',
};

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export class TailorService {
  async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json() as { response: string };
      return data.response;
    } catch (error) {
      throw new Error(`Failed to call Ollama: ${error}`);
    }
  }

  buildTailorPrompt(resume: string, jobDescription: string, keywords: string[]): string {
    const keywordList = keywords.join(', ');
    
    return `You are a professional resume writer. Given the resume below and the job description, rewrite the resume to better match the job requirements by incorporating relevant keywords naturally.

IMPORTANT RULES:
1. Do NOT fabricate experience that doesn't exist
2. Do NOT lie about skills or qualifications
3. Keep the same structure and format
4. Only enhance and rephrase existing content
5. Add relevant keywords where appropriate to your actual experience

JOB DESCRIPTION KEYWORDS TO INCORPORATE (if applicable to your experience):
${keywordList}

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME:
${resume}

TAILORED RESUME:`;
  }

  async tailorResume(resumeId: string, jobId: string): Promise<TailorResult> {
    const resume = await Resume.findById(resumeId);
    const job = await JobDescription.findById(jobId);

    if (!resume) throw new Error('Resume not found');
    if (!job) throw new Error('Job description not found');

    const prompt = this.buildTailorPrompt(resume.content, job.content, job.extractedKeywords);
    const tailoredResume = await this.callOllama(prompt);

    const analysis = atsService.analyze(tailoredResume, job.extractedKeywords);

    return {
      tailoredResume,
      score: analysis.score,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions
    };
  }

  async runPrompt(promptType: PromptType, vars: PromptVars, keywords: string[] = []): Promise<{ result: string; score?: number }> {
    const template = PromptTemplates[promptType];
    const prompt = template(vars);
    
    const result = await this.callOllama(prompt);
    
    let score: number | undefined;
    if (keywords.length > 0) {
      const analysis = atsService.analyze(result, keywords);
      score = analysis.score;
    }
    
    return { result, score };
  }
}

export const tailorService = new TailorService();