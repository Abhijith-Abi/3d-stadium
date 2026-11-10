'use client';

import { useState } from 'react';
import { useStadiumStore } from '@/stores/stadiumStore';
import { generateAiDesign } from '@/services/stadiumApi';
import { AI_QUICK_IDEAS, EXAMPLE_PROMPT } from '@/constants/stadium';
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-12 bg-paper">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => setAppStep('choose-mode')}
          className="flex items-center gap-1.5 text-ink-muted hover:text-ink text-xs mb-8 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to mode selection</span>
        </button>

        <div className="mb-8">
          <div className="annotation-brass mb-3">03 — AI mode</div>
          <h2 className="text-3xl font-semibold text-ink tracking-tight mb-3">
            Describe your stadium
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed">
            Mention capacity, cultural inspirations, facade architecture or the surrounding
            landscape. The assistant turns your description into a complete configuration.
          </p>
        </div>

        <div className="border border-ink bg-paper">
          {/* Quick ideas */}
          <div className="px-5 pt-5 mb-4">
            <div className="annotation mb-2.5">Quick suggestions</div>
            <div className="flex flex-wrap gap-1.5">
              {AI_QUICK_IDEAS.map((idea) => (
                <button
                  key={idea}
                  onClick={() => handleChip(idea)}
                  className="px-2.5 py-1 border border-line text-xs text-ink-soft hover:border-ink hover:text-ink transition-colors"
                >
                  + {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Brief */}
          <div className="px-5">
            <div className="annotation mb-2.5">Design brief</div>
            <div className="relative border border-line focus-within:border-ink transition-colors">
              <textarea
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value.slice(0, MAX_CHARS))}
                placeholder={EXAMPLE_PROMPT}
                rows={4}
                className="w-full bg-paper-raised/50 p-3 text-ink placeholder-ink-muted/70 text-sm resize-none outline-none"
              />
              <div className="absolute bottom-2 right-3 text-[10px] font-mono text-ink-muted">
                {localInput.length}/{MAX_CHARS}
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="px-5 mt-4">
            <button
              onClick={() => setLocalInput(EXAMPLE_PROMPT)}
              className="w-full text-left border-l-2 border-brass bg-paper-raised/50 px-3 py-2.5 text-xs text-ink-muted hover:text-ink-soft transition-colors"
            >
              <span className="annotation block mb-0.5">Example — click to use</span>
              &ldquo;{EXAMPLE_PROMPT}&rdquo;
            </button>
          </div>

          <div className="p-5 mt-2">
            <button
              onClick={handleGenerate}
              disabled={isAiLoading || !localInput.trim()}
              className="btn-ink w-full py-3 text-sm font-semibold"
            >
              {isAiLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Composing configuration…</span>
                </>
              ) : (
                <>
                  <span>Generate design</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
