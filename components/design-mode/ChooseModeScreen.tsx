'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import { ArrowRight, ArrowDown } from 'lucide-react';

export function ChooseModeScreen() {
  const { setDesignMode, setAppStep } = useStadiumStore();

  const handleSelect = (mode: 'manual' | 'ai') => {
    setDesignMode(mode);
    if (mode === 'ai') {
      setAppStep('ai-input');
    } else {
      setAppStep('customize');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-12 bg-paper">
      <div className="max-w-3xl w-full">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="annotation-brass mb-3">02 — Mode selection</div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight mb-3">
            How would you like to design?
          </h2>
          <p className="text-ink-muted text-sm max-w-md mx-auto">
            Configure every component by hand, or start from an AI-generated concept and refine it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 border border-ink divide-y md:divide-y-0 md:divide-x divide-ink">
          {/* A — Manual */}
          <button
            onClick={() => handleSelect('manual')}
            className="text-left p-8 bg-paper hover:bg-paper-raised transition-colors group flex flex-col min-h-[380px]"
          >
            <div className="flex items-start justify-between mb-8">
              <span className="annotation">Method A</span>
              <span className="font-mono text-[10px] text-ink-muted">/01</span>
            </div>

            <h3 className="text-2xl font-semibold text-ink mb-3">
              Manual design
            </h3>
            <p className="text-ink-soft text-[13px] leading-relaxed mb-8">
              Build the stadium step by step across eight component categories — facade, roof,
              seating bowl, landscape and materials — with live parametric 3D feedback.
            </p>

            <ul className="mt-auto space-y-0 border-t border-line pt-4 text-xs text-ink-muted font-mono">
              <li className="flex justify-between py-1">
                <span>Component categories</span>
                <span className="text-ink">08</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Viewport</span>
                <span className="text-ink">Parametric 3D</span>
              </li>
              <li className="flex justify-between py-1">
                <span>History</span>
                <span className="text-ink">Undo / redo</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide">
                Start manual design
              </span>
              <ArrowRight
                size={16}
                className="text-ink-muted group-hover:text-brass group-hover:translate-x-1 transition-all"
              />
            </div>
          </button>

          {/* B — AI */}
          <button
            onClick={() => handleSelect('ai')}
            className="text-left p-8 bg-ink text-paper hover:bg-ink-soft transition-colors group flex flex-col min-h-[380px] relative"
          >
            <div className="absolute top-0 right-8 bg-brass text-chip-ink text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 -translate-y-1/2">
              Recommended
            </div>

            <div className="flex items-start justify-between mb-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-paper/50">
                Method B
              </span>
              <span className="font-mono text-[10px] text-paper/50">/02</span>
            </div>

            <h3 className="text-2xl font-semibold mb-3">
              AI design assistant
            </h3>
            <p className="text-paper/70 text-[13px] leading-relaxed mb-8">
              Describe your concept in plain language and the assistant composes a complete
              structural configuration. Accept it as-is or keep refining in the 3D workspace.
            </p>

            <ul className="mt-auto space-y-0 border-t border-paper/20 pt-4 text-xs font-mono">
              <li className="flex justify-between py-1 text-paper/60">
                <span>Input</span>
                <span className="text-paper">Natural language</span>
              </li>
              <li className="flex justify-between py-1 text-paper/60">
                <span>Output</span>
                <span className="text-paper">Full configuration</span>
              </li>
              <li className="flex justify-between py-1 text-paper/60">
                <span>Editing</span>
                <span className="text-paper">3D workspace</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide">
                Launch AI assistant
              </span>
              <ArrowRight
                size={16}
                className="text-paper/60 group-hover:text-brass group-hover:translate-x-1 transition-all"
              />
            </div>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 annotation">
          <ArrowDown size={11} />
          <span>Both methods continue to the same 3D workspace</span>
        </div>
      </div>
    </div>
  );
}
