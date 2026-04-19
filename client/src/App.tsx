import { useState } from 'react';
import { PromptRunner } from './components/PromptRunner';
import { HistorySidebar } from './components/HistorySidebar';
import type { ATSReport } from './types';

function App() {
  const [showPrompts, setShowPrompts] = useState(false);
  const [history] = useState<ATSReport[]>([]);

  return (
    <div className="min-h-screen bg-surface-900">
      <header className="border-b border-surface-800 bg-surface-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">ResumeForge AI</h1>
              <p className="text-xs text-surface-400">AI-Powered Resume Builder</p>
            </div>
          </div>
          <button
            onClick={() => setShowPrompts(true)}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {showPrompts ? (
          <PromptRunner onClose={() => setShowPrompts(false)} />
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Build Your Perfect Resume</h2>
            <p className="text-surface-400 mb-8 max-w-md mx-auto">
              Upload your master resume, select an AI action, and paste a job description to generate an ATS-optimized resume and cover letter.
            </p>
            <button
              onClick={() => setShowPrompts(true)}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl font-medium text-white hover:opacity-90 transition-all"
            >
              Get Started
            </button>
          </div>
        )}
      </main>

      <HistorySidebar history={history} onSelect={() => {}} />
    </div>
  );
}

export default App;