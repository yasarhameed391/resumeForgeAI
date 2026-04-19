import { useState, useRef } from 'react';
import { resumeApi, jobApi, atsApi } from '../services/api';
import type { Resume, JobDescription, ATSReport } from '../types';
import { Upload, FileText, Briefcase, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onAnalyze: (resume: Resume, job: JobDescription, report: ATSReport) => void;
}

export function UploadSection({ onAnalyze }: Props) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobContent, setJobContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      setError('Please upload PDF or DOCX file');
      return;
    }

    setResumeFile(file);
    setError(null);
    setResumePreview('Extracting text... Wait for upload to complete.');
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobContent || !jobTitle) {
      setError('Please upload resume and fill job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resumeRes = await resumeApi.upload(resumeFile);
      if (!resumeRes.success || !resumeRes.data) {
        throw new Error(resumeRes.error || 'Failed to upload resume');
      }

      const preview = resumeRes.data.preview || (resumeRes.data.content || '').slice(0, 500);
      setResumePreview(preview);

      const jobRes = await jobApi.create(jobContent, jobTitle, jobCompany);
      if (!jobRes.success || !jobRes.data) {
        throw new Error(jobRes.error || 'Failed to create job');
      }

      const analyzeRes = await atsApi.analyze(resumeRes.data._id, jobRes.data._id);
      if (!analyzeRes.success || !analyzeRes.data) {
        throw new Error(analyzeRes.error || 'Failed to analyze');
      }

      onAnalyze(resumeRes.data, jobRes.data, analyzeRes.data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-fadeIn">
      <div className="space-y-6">
        <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Upload Resume</h2>
              <p className="text-sm text-surface-400">PDF or DOCX format</p>
            </div>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {!resumeFile ? (
            <button
              onClick={() => fileInput.current?.click()}
              className="w-full py-12 border-2 border-dashed border-surface-600 rounded-xl hover:border-primary-500 hover:bg-primary-500/5 transition-all group"
            >
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-10 h-10 text-surface-500 group-hover:text-primary-400 transition-colors" />
                <span className="text-surface-400 group-hover:text-white transition-colors">
                  Click to upload resume
                </span>
                <span className="text-xs text-surface-500">PDF or DOCX, max 10MB</span>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface-700 rounded-lg">
                <FileText className="w-6 h-6 text-primary-400" />
                <span className="text-white flex-1 truncate">{resumeFile.name}</span>
                <button
                  onClick={() => {
                    setResumeFile(null);
                    setResumePreview(null);
                  }}
                  className="text-surface-400 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
              {resumePreview && (
                <div className="p-3 bg-surface-700/50 rounded-lg">
                  <p className="text-xs text-surface-400 mb-2">Preview:</p>
                  <pre className="text-xs text-surface-300 whitespace-pre-wrap font-mono max-h-32 overflow-auto">
                    {resumePreview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Job Description</h2>
              <p className="text-sm text-surface-400">Paste the JD here</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full px-4 py-2.5 bg-surface-700 border border-surface-600 rounded-lg text-white placeholder-surface-500 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Company</label>
                <input
                  type="text"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  placeholder="Tech Corp"
                  className="w-full px-4 py-2.5 bg-surface-700 border border-surface-600 rounded-lg text-white placeholder-surface-500 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-surface-400 mb-1">Job Description</label>
              <textarea
                value={jobContent}
                onChange={(e) => setJobContent(e.target.value)}
                placeholder="Paste job description here..."
                rows={8}
                className="w-full px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg text-white placeholder-surface-500 focus:border-primary-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {jobContent && (
              <div className="p-3 bg-surface-700/50 rounded-lg">
                <p className="text-xs text-surface-400 mb-2">_keywords: {jobContent.split(/\s+/).filter(w => w.length > 4).slice(0, 15).join(', ')}...</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !resumeFile || !jobContent || !jobTitle}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze Resume
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}