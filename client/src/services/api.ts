import axios from 'axios';
import type { Resume, JobDescription, ATSReport, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const resumeApi = {
  upload: async (file: File): Promise<ApiResponse<Resume>> => {
    const formData = new FormData();
    formData.append('resume', file);
    const { data } = await api.post('/resumes/upload', formData);
    return data;
  },
  getAll: async (): Promise<ApiResponse<Resume[]>> => {
    const { data } = await api.get('/resumes');
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<Resume>> => {
    const { data } = await api.get(`/resumes/${id}`);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    const { data } = await api.delete(`/resumes/${id}`);
    return data;
  },
};

export const jobApi = {
  create: async (content: string, title: string, company?: string): Promise<ApiResponse<JobDescription>> => {
    const { data } = await api.post('/jobs', { content, title, company });
    return data;
  },
  getAll: async (): Promise<ApiResponse<JobDescription[]>> => {
    const { data } = await api.get('/jobs');
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<JobDescription>> => {
    const { data } = await api.get(`/jobs/${id}`);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    const { data } = await api.delete(`/jobs/${id}`);
    return data;
  },
};

export const atsApi = {
  analyze: async (resumeId: string, jobId: string): Promise<ApiResponse<ATSReport>> => {
    const { data } = await api.post('/ats/analyze', { resumeId, jobId });
    return data;
  },
  getReport: async (id: string): Promise<ApiResponse<ATSReport>> => {
    const { data } = await api.get(`/ats/${id}`);
    return data;
  },
  getHistory: async (limit?: number): Promise<ApiResponse<ATSReport[]>> => {
    const { data } = await api.get('/ats/history', { params: { limit } });
    return data;
  },
  tailor: async (reportId: string): Promise<ApiResponse<any>> => {
    const { data } = await api.post('/ats/tailor', { reportId });
    return data;
  },
  save: async (reportId: string): Promise<ApiResponse<ATSReport>> => {
    const { data } = await api.post('/ats/save', { reportId });
    return data;
  },
};

export default api;