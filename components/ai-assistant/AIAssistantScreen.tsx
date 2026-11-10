'use client';

import { useState } from 'react';
import { useStadiumStore } from '@/stores/stadiumStore';
import { generateAiDesign } from '@/services/stadiumApi';
import { AI_QUICK_IDEAS, EXAMPLE_PROMPT } from '@/constants/stadium';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const MAX_CHARS = 300;

export function AIAssistantScreen() {
  const {
    aiInput,
    setAiInput,
    setAiGeneratedDesign,
    setAiLoading,
    setAiError,
    setAppStep,
    isAiLoading,
  } = useStadiumStore();
  const [localInput, setLocalInput] = useState(aiInput);

  const handleGenerate = async () => {
    if (!localInput.trim()) {
      toast.error('Please describe your stadium concept');
      return;
    }
    setAiInput(localInput);
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await generateAiDesign(localInput);
      setAiGeneratedDesign(result);
      setAppStep('ai-result');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setAiError(msg);
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleChip = (idea: string) => {
    const append = localInput ? `${localInput}, ${idea.toLowerCase()}` : idea;
    setLocalInput(append.slice(0, MAX_CHARS));
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 py-12 bg-[#090b10]">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => setAppStep('choose-mode')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to mode selection</span>
        </button>

        <div className="mb-6">
          <div className="text-[11px] font-mono text-blue-400 mb-1">Step 3 of 7 · AI Mode</div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            Describe your stadium
          </h2>
          <p className="text-slate-400 text-sm">
            Describe your dream stadium in natural language. Mention capacity, cultural inspirations, facade architecture, or landscape surroundings.
          </p>
        </div>

        <div className="rounded-xl bg-[#0f121a] p-6 border border-white/[0.08]">
          {/* Quick Idea Chips */}
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-2">Quick suggestions:</div>
            <div className="flex flex-wrap gap-1.5">
              {AI_QUICK_IDEAS.map((idea) => (
                <button
                  key={idea}
                  onClick={() => handleChip(idea)}
                  className="px-2.5 py-1 rounded bg-[#161a24] hover:bg-[#1e2433] border border-white/[0.06] text-xs text-slate-300 hover:text-white transition-colors"
                >
                  + {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative mb-3">
            <textarea
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value.slice(0, MAX_CHARS))}
              placeholder={EXAMPLE_PROMPT}
              rows={4}
              className="w-full bg-[#121620] border border-white/[0.08] focus:border-blue-500 rounded-lg p-3 text-white placeholder-slate-500 text-sm resize-none outline-none transition-colors"
            />
            <div className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-500">
              {localInput.length}/{MAX_CHARS}
            </div>
          </div>

          {/* Example prompt */}
          <div className="p-3 rounded bg-[#121620] border border-white/[0.04] text-xs mb-5">
            <span className="text-slate-500 mr-1.5">Example:</span>
            <span
              onClick={() => setLocalInput(EXAMPLE_PROMPT)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            >
              &ldquo;{EXAMPLE_PROMPT}&rdquo;
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isAiLoading || !localInput.trim()}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-blue-600/30 active:scale-[0.99]"
          >
            {isAiLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Generating stadium concept…</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Generate Design</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
