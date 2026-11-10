'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import type { AppStep } from '@/types/stadium';
import { cn } from '@/lib/utils';
import {
  Compass,
  SlidersHorizontal,
  Box,
  Layers,
  ChevronRight,
  FolderOpen,
  Eye,
  Download,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const flowSteps: { key: AppStep; label: string; icon: React.ReactNode }[] = [
  { key: 'welcome', label: 'Welcome', icon: <Compass size={13} /> },
  { key: 'choose-mode', label: 'Choose Mode', icon: <Layers size={13} /> },
  { key: 'customize', label: 'Design (Step by Step)', icon: <SlidersHorizontal size={13} /> },
  { key: 'preview', label: 'Preview & Refine', icon: <Eye size={13} /> },
  { key: 'preview', label: 'Save', icon: <Download size={13} /> },
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
    <header className="sticky top-0 z-50 bg-[#060a14]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-[1700px] mx-auto px-5 h-15 flex items-center justify-between gap-4">
        {/* Brand Logo & Title matching Reference */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAppStep('welcome')}
            className="flex items-center gap-3 text-left group"
          >
            {/* Glowing 3D Stadium Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <div className="w-full h-full rounded-[10px] bg-[#070b16] flex items-center justify-center">
                <div className="w-5 h-3.5 rounded-full border-2 border-cyan-400 bg-gradient-to-b from-blue-500/30 to-purple-500/40 transform -rotate-12 flex items-center justify-center">
                  <div className="w-2.5 h-1.5 rounded-full bg-emerald-400/80" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-white tracking-tight leading-snug">
                Interactive Stadium Designer
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                User Interface Flow (AI + Interactive 3D)
              </div>
            </div>
          </button>
        </div>

        {/* Center: Flow Summary Box matching Reference Image */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b101e] border border-white/[0.08] shadow-inner">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 font-semibold border-r border-white/[0.08]">
            Flow Summary
          </span>

          <nav className="flex items-center gap-1.5">
            {flowSteps.map((step, idx) => {
              const isActive = idx === activeIdx;
              const isPast = idx < activeIdx;

              return (
                <div key={idx} className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (step.label === 'Save') setAppStep('preview');
                      else setAppStep(step.key);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all',
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                        : isPast
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                        : 'text-slate-500 hover:text-slate-400'
                    )}
                  >
                    {step.icon}
                    <span>{step.label}</span>
                  </button>

                  {idx < flowSteps.length - 1 && (
                    <ChevronRight size={11} className="text-slate-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Saved Projects & Status */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/saved-designs"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111728] hover:bg-[#161f36] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white transition-colors"
          >
            <FolderOpen size={13} className="text-blue-400" />
            <span className="hidden sm:inline">Saved Designs</span>
          </Link>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1424] border border-white/[0.08] text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>WebGL Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
