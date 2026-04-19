import { useState } from 'react';
import { atsApi } from '../services/api';
import type { ATSReport } from '../types';
import { Check, Save, ArrowLeft, Loader2, Trophy, Clock } from 'lucide-react';

interface Props {
  beforeResume: string;
  afterResume: string;
  beforeScore: number;
  afterScore: number;
  beforeKeywords: string[];
  afterKeywords: string[];
  report: ATSReport;
  onBack: () => void;
}

function ScoreCard({ score, label, keywords }: { score: number; label: string; keywords: string[] }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-surface-700/50 rounded-xl p-4">
      <div className={`text-4xl font-bold ${getColor(score)}`}>{score}%</div>
      <div className="text-sm text-surface-400 mt-1">{label}</div>
      <div className="mt-3 flex flex-wrap gap-1">
        {keywords.slice(0, 8).map((kw, i) => (
          <span key={i} className="px-2 py-0.5 bg-surface-600 text-surface-300 rounded text-xs">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResumePreview({ content, label }: { content: string; label: string }) {
  return (
    <div className="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
      <div className="px-4 py-2 bg-surface-700/50 border-b border-surface-700 flex items-center justify-between">
        <span className="text-sm font-medium text-surface-300">{label}</span>
      </div>
      <pre className="p-4 text-sm text-surface-300 whitespace-pre-wrap font-mono max-h-96 overflow-auto">
        {content}
      </pre>
    </div>
  );
}

export function Comparison({
  beforeResume,
  afterResume,
  beforeScore,
  afterScore,
  beforeKeywords,
  afterKeywords,
  report,
  onBack,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(report.saved);
  const [error, setError] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState(report);

  const canSave = afterScore >= 90 && !saved;
  const improvement = afterScore - beforeScore;

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await atsApi.save(currentReport._id);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to save');
      }
      setSaved(true);
      setCurrentReport(res.data);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </button>

        <div className="flex items-center gap-4">
          {improvement > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg">
              <Trophy className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">+{improvement}%</span>
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Saved</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ScoreCard score={beforeScore} label="Before" keywords={beforeKeywords} />
        <ScoreCard score={afterScore} label="After" keywords={afterKeywords} />
      </div>

      {canSave && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-green-400 text-center">
            Great! Your tailored resume achieved {afterScore}% which meets the save requirement (≥90%).
          </p>
        </div>
      )}

      {!canSave && !saved && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <p className="text-amber-400">
            Score too low to save. Need ≥90% to save. Current: {afterScore}%
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <ResumePreview content={beforeResume} label="Original Resume" />
        <ResumePreview content={afterResume} label="Tailored Resume" />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-surface-700 rounded-xl font-semibold text-white hover:bg-surface-600 transition-colors"
        >
          Discard & Retry
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave || saving || saved}
          className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
            canSave && !saved
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-surface-700 text-surface-500 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-5 h-5" />
              Already Saved
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Tailored Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
}