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
      className={`h-[calc(100vh-56px)] flex overflow-hidden bg-[#090b10] ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Left Sidebar: 8 Component Categories */}
      {!isFullscreen && <CustomizationSidebar />}

      {/* Center 3D Viewport */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[#07090e]">
        {/* Top Viewport Header */}
        <div className="h-12 bg-[#0c0f16] border-b border-white/[0.08] flex items-center justify-between px-5 shrink-0 z-10">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-slate-500">
              0{stepIndex + 1} / 0{CUSTOMIZATION_STEPS.length}
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-semibold text-white">{stepLabel}</span>
            <span className="text-slate-500 hidden sm:inline">({config.name})</span>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-1.5 rounded hover:bg-[#161a24] text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Undo"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-1.5 rounded hover:bg-[#161a24] text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Redo"
            >
              <Redo2 size={13} />
            </button>

            <div className="w-px h-4 bg-white/[0.08] mx-1" />

            <button
              onClick={() => setAutoRotate3D(!autoRotate3D)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                autoRotate3D
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#161a24]'
              }`}
            >
              <RotateCw size={12} className={autoRotate3D ? 'animate-spin' : ''} />
              <span className="font-mono text-[11px]">Rotate</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded hover:bg-[#161a24] text-slate-400 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* 3D Canvas Stage */}
        <div className="flex-1 relative overflow-hidden">
          <StadiumPreview3D interactive={true} autoRotate={autoRotate3D} />

          {/* Live Telemetry Tag */}
          <div className="absolute top-3 left-4 bg-[#0d1017]/90 backdrop-blur px-3 py-2 rounded-md border border-white/[0.08] text-xs font-mono text-slate-400 pointer-events-none hidden sm:block">
            <div className="text-white font-medium mb-1">{config.name}</div>
            <div className="text-[11px] space-x-2 text-slate-400">
              <span>{config.seating.capacity.toLocaleString()} seats</span>
              <span>·</span>
              <span className="capitalize">{config.facade}</span>
              <span>·</span>
              <span className="capitalize">{config.roof}</span>
            </div>
          </div>

          {/* 3D Viewport Controls matching Step 5 of Reference: Rotate · Zoom · Pan · Fullscreen */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-full bg-[#0a0f1d]/90 backdrop-blur-md border border-white/[0.1] shadow-2xl z-20">
            <button
              onClick={() => setAutoRotate3D(!autoRotate3D)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                autoRotate3D
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Toggle automatic turntable rotation"
            >
              <RotateCw size={12} className={autoRotate3D ? 'animate-spin' : ''} />
              <span>Rotate</span>
            </button>

            <div className="w-px h-3.5 bg-white/[0.1]" />

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-300 font-medium hover:bg-white/[0.06] transition-colors cursor-default" title="Scroll mouse wheel or pinch to zoom">
              <span className="text-[11px] font-mono">🔍</span>
              <span>Zoom</span>
            </div>

            <div className="w-px h-3.5 bg-white/[0.1]" />

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-300 font-medium hover:bg-white/[0.06] transition-colors cursor-default" title="Right-click and drag or two-finger drag to pan">
              <span className="text-[11px] font-mono">✋</span>
              <span>Pan</span>
            </div>

            <div className="w-px h-3.5 bg-white/[0.1]" />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen 3D stage'}
            >
              <Maximize2 size={12} />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Bottom Step Navigation Bar */}
        <div className="h-14 bg-[#0c0f16] border-t border-white/[0.08] flex items-center justify-between px-6 shrink-0 z-10">
          <button
            onClick={prevCustomizationStep}
            disabled={stepIndex === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161a24] hover:bg-[#1e2330] border border-white/[0.08] text-slate-300 text-xs font-medium disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          {/* Stepper Dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {CUSTOMIZATION_STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-6 bg-blue-500'
                    : i < stepIndex
                    ? 'w-1.5 bg-slate-600'
                    : 'w-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {stepIndex < CUSTOMIZATION_STEPS.length - 1 ? (
            <button
              onClick={nextCustomizationStep}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm shadow-blue-500/20"
            >
              <span>Next: {STEP_LABELS[CUSTOMIZATION_STEPS[stepIndex + 1]]}</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => setAppStep('preview')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm shadow-blue-500/20"
            >
              <Eye size={14} />
              <span>Final Preview & Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Configuration Controls */}
      <div className="w-80 xl:w-88 bg-[#0c0f16] border-l border-white/[0.08] overflow-y-auto shrink-0">
        <CustomizationPanel step={customizationStep} />
      </div>
    </div>
  );
}
