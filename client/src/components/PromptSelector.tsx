import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface PromptTemplate {
  name: string;
  description: string;
}

interface Props {
  onSelect: (promptType: string) => void;
}

export function PromptSelector({ onSelect }: Props) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prompts/templates')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemplates(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Prompts</h2>
          <p className="text-sm text-surface-400">Select a prompt to customize your resume</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.name}
            onClick={() => onSelect(template.name)}
            className="p-4 bg-surface-700 hover:bg-surface-600 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400 group-hover:text-violet-300 transition-colors" />
              <span className="font-medium text-white">{template.name.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-sm text-surface-400 mt-1">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}