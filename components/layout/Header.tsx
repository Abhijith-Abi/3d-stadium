'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import type { AppStep } from '@/types/stadium';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const flowSteps: { key: AppStep; label: string; index: string }[] = [
  { key: 'welcome', label: 'Welcome', index: '01' },
  { key: 'choose-mode', label: 'Mode', index: '02' },
  { key: 'customize', label: 'Design', index: '03' },
  { key: 'preview', label: 'Preview', index: '04' },
];

export function Header() {
  const appStep = useStadiumStore((s) => s.appStep);
  const setAppStep = useStadiumStore((s) => s.setAppStep);

  const getActiveIndex = () => {
    switch (appStep) {
      case 'welcome':
        return 0;
      case 'choose-mode':
      case 'ai-input':
        return 1;
      case 'ai-result':
      case 'customize':
        return 2;
      case 'preview':
        return 3;
      default:
        return 0;
    }
  };

  const activeIdx = getActiveIndex();

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-line">
      <div className="max-w-[1700px] mx-auto px-5 h-16 flex items-center justify-between gap-6">
        {/* Wordmark */}
        <button
          onClick={() => setAppStep('welcome')}
          className="flex items-center gap-3 text-left shrink-0"
        >
          <div className="w-8 h-8 border border-ink flex items-center justify-center">
            <div className="w-4 h-2.5 border border-ink rounded-[50%] bg-paper-raised" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-ink tracking-tight leading-tight">
              Interactive Stadium Designer
            </div>
            <div className="annotation mt-0.5">
              Architectural configuration studio
            </div>
          </div>
        </button>

        {/* Center: numbered process rail */}
        <nav className="hidden lg:flex items-center border-x border-line divide-x divide-line">
          {flowSteps.map((step, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={step.label}
                onClick={() => setAppStep(step.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-xs transition-colors',
                  isActive
                    ? 'text-ink font-semibold bg-paper-raised'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[10px] tabular-nums',
                    isActive ? 'text-brass' : 'text-ink-muted/60'
                  )}
                >
                  {step.index}
                </span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/saved-designs"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-line-strong text-xs font-medium text-ink hover:border-ink transition-colors"
          >
            <span>Archive</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 border border-line text-[11px] font-mono text-ink-muted">
            <span className="w-1.5 h-1.5 bg-brass" />
            <span>WebGL</span>
          </div>
        </div>
      </div>
    </header>
  );
}
