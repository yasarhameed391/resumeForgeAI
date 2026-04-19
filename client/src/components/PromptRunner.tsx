import { useState, useRef } from 'react';
import { Sparkles, Loader2, X, Copy, Check, Upload, ChevronRight, FileCheck, Target, PenTool, Download } from 'lucide-react';

interface Props {
  onClose: () => void;
}

type Step = 'upload' | 'select' | 'jobdesc' | 'result';

export function PromptRunner({ onClose }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [results, setResults] = useState<{resume?: string; coverLetter?: string}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Please upload PDF, DOCX, or TXT file');
      return;
    }

    setResumeFile(file);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch('/api/resumes/upload', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (data.success && data.data?.content) {
        setResumeContent(data.data.content);
        setStep('select');
      } else {
        const text = await file.text();
        setResumeContent(text);
        setStep('select');
      }
    } catch {
      const text = await file.text();
      setResumeContent(text);
      setStep('select');
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription) {
      setError('Please enter job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const atsResponse = await fetch('/api/prompts/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'ATS_OPTIMIZE',
          vars: { resume: resumeContent, jobDescription },
        }),
      });

      const coverResponse = await fetch('/api/prompts/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'COVER_LETTER',
          vars: { resume: resumeContent, jobDescription },
        }),
      });

      const atsData = await atsResponse.json();
      const coverData = await coverResponse.json();

      if (atsData.success && coverData.success) {
        setResults({
          resume: atsData.data.result,
          coverLetter: coverData.data.result,
        });
        setStep('result');
      } else {
        setError('Failed to generate content');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (content: string, type: 'docx' | 'pdf', name: string) => {
    try {
      const response = await fetch('/api/download/' + type, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, filename: name }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const prompts = [
    { id: 'ATS_OPTIMIZE', name: 'ATS Resume + Cover Letter', icon: Target, desc: 'Optimize resume for ATS & generate cover letter' },
    { id: 'TAILOR_RESUME', name: 'Tailor Resume', icon: FileCheck, desc: 'Tailor resume to specific job' },
    { id: 'COVER_LETTER', name: 'Cover Letter Only', icon: PenTool, desc: 'Generate cover letter only' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">AI Resume Builder</h2>
        <button onClick={onClose} className="p-2 hover:bg-surface-700 rounded-lg">
          <X className="w-5 h-5 text-surface-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step === 'upload' ? 'bg-primary-500 text-white' : 'bg-green-500 text-white'}`}>
          <Upload className="w-4 h-4" /> Resume
        </div>
        <ChevronRight className="w-4 h-4 text-surface-500" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step === 'select' ? 'bg-primary-500 text-white' : step !== 'upload' ? 'bg-green-500 text-white' : 'bg-surface-700 text-surface-400'}`}>
          <Sparkles className="w-4 h-4" /> Select
        </div>
        <ChevronRight className="w-4 h-4 text-surface-500" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step === 'jobdesc' ? 'bg-primary-500 text-white' : step === 'result' ? 'bg-green-500 text-white' : 'bg-surface-700 text-surface-400'}`}>
          Job Desc
        </div>
        <ChevronRight className="w-4 h-4 text-surface-500" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step === 'result' ? 'bg-primary-500 text-white' : 'bg-surface-700 text-surface-400'}`}>
          Results
        </div>
      </div>

      {step === 'upload' && (
        <div className="bg-surface-800 rounded-2xl p-8 border border-surface-700 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
            <Upload className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Upload Your Master Resume</h3>
          <p className="text-surface-400 mb-6">Upload your current resume (PDF, DOCX, or TXT)</p>
          
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <button
            onClick={() => fileInput.current?.click()}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl font-medium text-white hover:opacity-90 transition-all"
          >
            Choose File
          </button>

          {resumeFile && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
              <FileCheck className="w-5 h-5" />
              <span>{resumeFile.name}</span>
            </div>
          )}
        </div>
      )}

      {step === 'select' && (
        <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
          <h3 className="text-lg font-semibold text-white mb-4">Select AI Action</h3>
          <p className="text-surface-400 mb-4 text-sm">Your resume is uploaded. What would you like to generate?</p>
          
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => setStep('jobdesc')}
                className="w-full p-4 bg-surface-700 hover:bg-surface-600 rounded-xl text-left flex items-center gap-4 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <prompt.icon className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <div className="font-medium text-white">{prompt.name}</div>
                  <div className="text-sm text-surface-400">{prompt.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-500 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'jobdesc' && (
        <div className="space-y-4">
          <button onClick={() => setStep('select')} className="text-sm text-primary-400">
            ← Back
          </button>
          
          <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
            <h3 className="text-lg font-semibold text-white mb-4">Paste Job Description</h3>
            <p className="text-surface-400 mb-4 text-sm">Paste the job description you want to apply for</p>
            
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg text-white placeholder-surface-500 focus:border-primary-500 focus:outline-none resize-none"
              placeholder="Paste job description here..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !jobDescription}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl font-medium text-white disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      )}

      {step === 'result' && (
        <div className="space-y-4">
          <button onClick={() => setStep('jobdesc')} className="text-sm text-primary-400">
            ← Generate More
          </button>

          {results.resume && (
            <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Tailored Resume</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(results.resume!, 'docx', 'tailored-resume')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-700 hover:bg-surface-600 rounded-lg text-sm text-surface-400"
                  >
                    <Download className="w-4 h-4" /> DOCX
                  </button>
                  <button
                    onClick={() => handleDownload(results.resume!, 'pdf', 'tailored-resume')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-700 hover:bg-surface-600 rounded-lg text-sm text-surface-400"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button
                    onClick={() => handleCopy(results.resume!)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-700 hover:bg-surface-600 rounded-lg text-sm text-surface-400"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-surface-300 text-sm max-h-96 overflow-auto bg-surface-700 p-4 rounded-lg">
                {results.resume}
              </pre>
            </div>
          )}

          {results.coverLetter && (
            <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Cover Letter</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(results.coverLetter!, 'docx', 'cover-letter')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-700 hover:bg-surface-600 rounded-lg text-sm text-surface-400"
                  >
                    <Download className="w-4 h-4" /> DOCX
                  </button>
                  <button
                    onClick={() => handleDownload(results.coverLetter!, 'pdf', 'cover-letter')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-700 hover:bg-surface-600 rounded-lg text-sm text-surface-400"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button
                    onClick={() => handleCopy(results.coverLetter!)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-700 hover:bg-surface-600 rounded-lg text-sm text-surface-400"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-surface-300 text-sm max-h-96 overflow-auto bg-surface-700 p-4 rounded-lg">
                {results.coverLetter}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}