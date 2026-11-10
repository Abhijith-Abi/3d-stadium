'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import { CUSTOMIZATION_STEPS } from '@/types/stadium';
import { STEP_LABELS } from '@/constants/stadium';
import type { CustomizationStep } from '@/types/stadium';
import { cn } from '@/lib/utils';
import {
  Box,
  Layers,
  Compass,
  Users,
  Lightbulb,
  DoorOpen,
  Palette,
  Zap,
} from 'lucide-react';

const STEP_ICONS: Record<CustomizationStep, React.ReactNode> = {
  'stadium-type': <Box size={14} />,
  facade: <Layers size={14} />,
  roof: <Compass size={14} />,
  seating: <Users size={14} />,
  interior: <Lightbulb size={14} />,
  entry: <DoorOpen size={14} />,
  materials: <Palette size={14} />,
  addons: <Zap size={14} />,
};

export function CustomizationSidebar() {
  const { customizationStep, setCustomizationStep } = useStadiumStore();
  const stepIndex = CUSTOMIZATION_STEPS.indexOf(customizationStep);

  return (
    <div className="w-60 xl:w-64 bg-[#0c0f16] border-r border-white/[0.08] py-4 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div>
        <div className="px-4 mb-3">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            Categories
          </div>
        </div>

        <nav className="space-y-0.5 px-2">
          {CUSTOMIZATION_STEPS.map((step, i) => {
            const isActive = step === customizationStep;
            const isDone = i < stepIndex;

            return (
              <button
                key={step}
                onClick={() => setCustomizationStep(step)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors text-left',
                  isActive
                    ? 'bg-[#1b2232] text-white font-medium'
                    : isDone
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                    : 'text-slate-500 hover:text-slate-400 hover:bg-white/[0.02]'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center shrink-0',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-[#151d2c] text-blue-400'
                      : 'text-slate-500'
                  )}
                >
                  {STEP_ICONS[step]}
                </div>

                <span className="truncate">{STEP_LABELS[step]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 py-3 mx-2 rounded bg-[#10141e] border border-white/[0.06] text-[11px] text-slate-500 font-mono">
        Changes apply live to the 3D model.
      </div>
    </div>
  );
}
