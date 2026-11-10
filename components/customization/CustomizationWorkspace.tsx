'use client';

import { useState } from 'react';
import { useStadiumStore } from '@/stores/stadiumStore';
import { StadiumPreview3D } from '@/components/stadium-viewer/StadiumPreview3D';
import { CustomizationSidebar } from './CustomizationSidebar';
import { CustomizationPanel } from './CustomizationPanel';
import { CUSTOMIZATION_STEPS } from '@/types/stadium';
import { STEP_LABELS } from '@/constants/stadium';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Maximize2,
  Undo2,
  Redo2,
  RotateCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CustomizationWorkspace() {
  const {
    customizationStep,
    nextCustomizationStep,
    prevCustomizationStep,
    setAppStep,
    canUndo,
    canRedo,
    undo,
    redo,
    config,
  } = useStadiumStore();

  const [autoRotate3D, setAutoRotate3D] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stepIndex = CUSTOMIZATION_STEPS.indexOf(customizationStep);
  const stepLabel = STEP_LABELS[customizationStep];

  return (
    <div
      className={`h-[calc(100vh-64px)] flex overflow-hidden bg-paper ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Left sidebar */}
      {!isFullscreen && <CustomizationSidebar />}

      {/* Center 3D viewport */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-viewport">
        {/* Top toolbar */}
        <div className="h-12 bg-paper border-b border-line flex items-center justify-between px-5 shrink-0 z-10">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-ink-muted tabular-nums">
              {String(stepIndex + 1).padStart(2, '0')} / {String(CUSTOMIZATION_STEPS.length).padStart(2, '0')}
            </span>
            <span className="text-line-strong">·</span>
            <span className="font-semibold text-ink">{stepLabel}</span>
            <span className="text-ink-muted hidden sm:inline">({config.name})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-1.5 border border-transparent hover:border-line text-ink-muted hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Undo"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-1.5 border border-transparent hover:border-line text-ink-muted hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Redo"
            >
              <Redo2 size={13} />
            </button>

            <div className="w-px h-4 bg-line mx-1" />

            <button
              onClick={() => setAutoRotate3D(!autoRotate3D)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-xs transition-colors border',
                autoRotate3D
                  ? 'border-brass text-brass'
                  : 'border-transparent text-ink-muted hover:text-ink hover:border-line'
              )}
            >
              <RotateCw size={12} className={autoRotate3D ? 'animate-spin' : ''} />
              <span className="font-mono text-[11px]">Rotate</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 border border-transparent hover:border-line text-ink-muted hover:text-ink transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* 3D stage */}
        <div className="flex-1 relative overflow-hidden">
          <StadiumPreview3D interactive={true} autoRotate={autoRotate3D} />

          {/* Telemetry tag */}
          <div className="absolute top-3 left-4 vp-chip px-3 py-2 text-xs font-mono pointer-events-none hidden sm:block">
            <div className="text-chip/90 font-medium mb-1">{config.name}</div>
            <div className="text-[11px] space-x-2 text-chip/50">
              <span>{config.seating.capacity.toLocaleString()} seats</span>
              <span>·</span>
              <span className="capitalize">{config.facade}</span>
              <span>·</span>
              <span className="capitalize">{config.roof}</span>
            </div>
          </div>

          {/* Bottom control bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 vp-chip z-20">
            <button
              onClick={() => setAutoRotate3D(!autoRotate3D)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                autoRotate3D
                  ? 'bg-brass text-chip-ink'
                  : 'text-chip/70 hover:text-chip hover:bg-white/[0.06]'
              )}
              title="Toggle automatic turntable rotation"
            >
              <RotateCw size={12} className={autoRotate3D ? 'animate-spin' : ''} />
              <span>Rotate</span>
            </button>

            <div className="w-px h-3.5 bg-white/10" />

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-chip/70 font-medium"
              title="Scroll mouse wheel or pinch to zoom"
            >
              <span className="text-[11px] font-mono">Zoom</span>
            </div>

            <div className="w-px h-3.5 bg-white/10" />

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-chip/70 font-medium"
              title="Right-click and drag or two-finger drag to pan"
            >
              <span className="text-[11px] font-mono">Pan</span>
            </div>

            <div className="w-px h-3.5 bg-white/10" />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-chip/70 hover:text-chip hover:bg-white/[0.06] transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen 3D stage'}
            >
              <Maximize2 size={12} />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Bottom step navigation */}
        <div className="h-14 bg-paper border-t border-line flex items-center justify-between px-6 shrink-0 z-10">
          <button
            onClick={prevCustomizationStep}
            disabled={stepIndex === 0}
            className="btn-outline px-3 py-1.5 text-xs font-medium"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          {/* Stepper */}
          <div className="hidden sm:flex items-center gap-1.5">
            {CUSTOMIZATION_STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-1 transition-all',
                  i === stepIndex
                    ? 'w-6 bg-brass'
                    : i < stepIndex
                    ? 'w-1.5 bg-line-strong'
                    : 'w-1.5 bg-line'
                )}
              />
            ))}
          </div>

          {stepIndex < CUSTOMIZATION_STEPS.length - 1 ? (
            <button
              onClick={nextCustomizationStep}
              className="btn-ink px-4 py-1.5 text-xs font-medium"
            >
              <span>Next: {STEP_LABELS[CUSTOMIZATION_STEPS[stepIndex + 1]]}</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => setAppStep('preview')}
              className="btn-ink px-4 py-1.5 text-xs font-medium"
            >
              <Eye size={14} />
              <span>Final preview & save</span>
            </button>
          )}
        </div>
      </div>

      {/* Right config column */}
      <div className="w-80 xl:w-96 bg-paper border-l border-line overflow-y-auto shrink-0">
        <CustomizationPanel step={customizationStep} />
      </div>
    </div>
  );
}
