import { useState, useEffect } from 'react';
import { atsApi } from '../services/api';
import type { ATSReport } from '../types';
import { History, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  history: ATSReport[];
  onSelect: (report: ATSReport) => void;
}

export function HistorySidebar({ history, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [reports, setReports] = useState<ATSReport[]>(history);

  useEffect(() => {
    atsApi.getHistory(10).then((res) => {
      if (res.success && res.data) {
        setReports(res.data);
      }
    });
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-surface-800 border-l border-surface-700 transform transition-transform z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-20 bg-surface-800 border border-surface-700 border-r-0 rounded-l-lg flex items-center justify-center hover:bg-surface-700 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-surface-400" />
        ) : (
          <ChevronUp className="w-5 h-5 text-surface-400" />
        )}
      </button>

      <div className="p-4 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-surface-400" />
          <h2 className="font-semibold text-white">History</h2>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-auto max-h-[calc(100vh-80px)]">
        {reports.length === 0 ? (
          <p className="text-surface-500 text-sm text-center py-8">
            No analysis history yet.
          </p>
        ) : (
          reports.map((report) => (
            <button
              key={report._id}
              onClick={() => onSelect(report)}
              className="w-full p-3 bg-surface-700/50 rounded-lg text-left hover:bg-surface-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-surface-400">
                  {formatDate(report.createdAt)}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getScoreColor(report.score)}`}>
                  {report.score}%
                </span>
              </div>
              <div className="text-xs text-surface-500">
                Matched: {report.matchedKeywords.length} | Missing: {report.missingKeywords.length}
              </div>
              {report.tailoredScore && (
                <div className="mt-1 text-xs text-primary-400">
                  Tailored: {report.tailoredScore}%
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}