import { useState } from 'react';
import { atsApi } from '../services/api';
import type { Resume, JobDescription, ATSReport } from '../types';
import { Check, X, Lightbulb, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  resume: Resume;
  job: JobDescription;
  report: ATSReport;
  onTailor: (tailored: string, updatedReport: ATSReport) => void;
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-surface-400">{label}</span>
      </div>
    </div>
  );
}

export function Dashboard({ resume, job, report, onTailor }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmTailor, setConfirmTailor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTailor = async () => {
    if (!confirmTailor) {
      setConfirmTailor(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await atsApi.tailor(report._id);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to tailor resume');
      }

      onTailor(res.data.tailoredResume, res.data.report);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
      setConfirmTailor(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-800 rounded-2xl p-6 border border-surface-700">
          <h2 className="text-xl font-bold text-white mb-6">ATS Analysis</h2>
          
          <div className="flex items-center justify-center mb-8">
            <ScoreGauge score={report.score} label="Before" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider">
                Matched Keywords ({report.matchedKeywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.matchedKeywords.slice(0, 15).map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
                    <Check className="w-3 h-3" /> {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider">
                Missing Keywords ({report.missingKeywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.missingKeywords.slice(0, 15).map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1">
                    <X className="w-3 h-3" /> {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">Suggestions</h3>
            </div>
            <ul className="space-y-3">
              {report.suggestions.slice(0, 5).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                  <span className="text-amber-400">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-surface-400">Resume:</span>
              <span className="text-white font-medium truncate">{resume.fileName}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-surface-400">Position:</span>
              <span className="text-white font-medium">{job.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-400">Company:</span>
              <span className="text-white font-medium">{job.company || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {confirmTailor && !loading && (
        <div className="p-6 bg-surface-800 rounded-2xl border border-primary-500 animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Ready to Tailor</h3>
          </div>
          <p className="text-surface-300 mb-4">
            Our AI will rewrite your resume to better match the job requirements while keeping your experience authentic. 
            No new experience will be fabricated.
          </p>
          <p className="text-surface-400 text-sm">
            This uses your local Ollama model. May take a moment.
          </p>
        </div>
      )}

      <button
        onClick={handleTailor}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Tailoring in progress...
          </>
        ) : confirmTailor ? (
          <>
            <Sparkles className="w-5 h-5" />
            Confirm & Tailor Resume
            <ArrowRight className="w-5 h-5" />
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Tailor Resume with AI
          </>
        )}
      </button>
    </div>
  );
}