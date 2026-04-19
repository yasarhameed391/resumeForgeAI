import { JobDescription, IJobDescription } from '../models/JobDescription.js';

export class JobService {
  extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
      'used', 'get', 'make', 'made', 'come', 'came', 'go', 'went', 'gone',
      'become', 'became', 'seem', 'seemed', 'leave', 'left', 'put', 'kept',
      'keep', 'let', 'begin', 'began', 'begun', 'show', 'showed', 'shown',
      'hear', 'heard', 'play', 'ran', 'run', 'move', 'lived', 'believe',
      'held', 'bring', 'brought', 'write', 'wrote', 'written', 'sit', 'sat',
      'stand', 'stood', 'lose', 'lost', 'pay', 'met', 'include', 'included',
      'continue', 'set', 'learn', 'learned', 'change', 'lead', 'understand',
      'watch', 'follow', 'stop', 'create', 'spoke', 'speak', 'read', 'allow',
      'add', 'spend', 'grow', 'grew', 'opened', 'walk', 'won', 'offer', 'remember',
      'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect',
      'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remained', 'like', 'someone',
      'point', 'job', 'work', 'year', 'years', 'way', 'people', 'day', 'days',
      'company', 'time', 'team', 'role', 'position', 'experience', 'skills',
      'ability', 'working', 'work', 'strong', 'knowledge', 'good', 'great', 'new',
      'first', 'last', 'long', 'little', 'own', 'old', 'right', 'big', 'high',
      'different', 'small', 'large', 'next', 'early', 'young', 'important',
      'public', 'need', 'looking', 'join', 'opportunity', 'join', 'team'
    ]);

    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    const keywords = Array.from(wordFreq.entries())
      .filter(([_, freq]) => freq >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word]) => word);

    return keywords;
  }

  async createJob(
    content: string,
    title: string,
    company: string,
    userId: string = 'default-user'
  ): Promise<IJobDescription> {
    const extractedKeywords = this.extractKeywords(content);

    const job = new JobDescription({
      userId,
      title,
      company,
      content,
      extractedKeywords
    });

    return job.save();
  }

  async getJobs(userId: string = 'default-user'): Promise<IJobDescription[]> {
    return JobDescription.find({ userId }).sort({ createdAt: -1 });
  }

  async getJobById(id: string): Promise<IJobDescription | null> {
    return JobDescription.findById(id);
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await JobDescription.findByIdAndDelete(id);
    return !!result;
  }
}

export const jobService = new JobService();