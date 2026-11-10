'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import { CUSTOMIZATION_STEPS } from '@/types/stadium';
import { STEP_LABELS } from '@/constants/stadium';
import type { CustomizationStep } from '@/types/stadium';
import { cn } from '@/lib/utils';

const STEP_INDEX: Record<CustomizationStep, string> = {
  'stadium-type': '01',
  facade: '02',
  roof: '03',
  seating: '04',
  interior: '05',
  entry: '06',
  materials: '07',
  addons: '08',
};

export function CustomizationSidebar() {
  const { customizationStep, setCustomizationStep } = useStadiumStore();
  const stepIndex = CUSTOMIZATION_STEPS.indexOf(customizationStep);

  return (
    <div className="w-60 xl:w-64 bg-paper border-r border-line py-5 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div>
        <div className="px-5 mb-4">
          <div className="annotation">Component groups</div>
        </div>

        <nav className="flex flex-col">
          {CUSTOMIZATION_STEPS.map((step, i) => {
            const isActive = step === customizationStep;
            const isDone = i < stepIndex;

            return (
              <button
                key={step}
                onClick={() => setCustomizationStep(step)}
                className={cn(
                  'flex items-center gap-3 px-5 py-2.5 text-xs text-left border-l-2 transition-colors',
                  isActive
                    ? 'border-brass bg-paper-raised text-ink font-semibold'
                    : isDone
                    ? 'border-transparent text-ink-soft hover:text-ink hover:bg-paper-raised/60'
                    : 'border-transparent text-ink-muted/70 hover:text-ink-muted hover:bg-paper-raised/40'
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[10px] tabular-nums w-5 shrink-0',
                    isActive ? 'text-brass' : 'text-ink-muted/60'
                  )}
                >
                  {STEP_INDEX[step]}
                </span>

                <span className="truncate">{STEP_LABELS[step]}</span>

                {isDone && (
                  <span className="ml-auto w-1.5 h-1.5 bg-brass/60 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-5">
        <div className="border-t border-line pt-3 text-[10px] font-mono text-ink-muted leading-relaxed">
          Changes apply live to the 3D model.
        </div>
      </div>
    </div>
  );
}
