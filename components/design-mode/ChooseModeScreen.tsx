'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import { SlidersHorizontal, Sparkles, ArrowRight, Check } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 py-12 bg-[#090b10]">
      <div className="max-w-2xl w-full text-center mb-10">
        <div className="text-[11px] font-mono text-blue-400 mb-2">Step 2 of 7 · Mode Selection</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          How would you like to design?
        </h2>
        <p className="text-slate-400 text-sm">
          Select manual component customization or generate a complete starting concept with AI.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full">
        {/* Option A: Manual Design */}
        <button
          onClick={() => handleSelect('manual')}
          className="text-left p-6 rounded-2xl bg-[#0e1424] hover:bg-[#141c30] border border-white/[0.08] hover:border-blue-500/40 transition-all flex flex-col justify-between group shadow-xl hover:-translate-y-0.5"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 shadow-inner">
              <SlidersHorizontal size={20} />
            </div>

            <div className="text-[11px] font-mono text-slate-500 mb-1">Direct Customization</div>
            <h3 className="text-xl font-bold text-white mb-2">Manual Design</h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              Build your stadium step by step with interactive controls. Customize facades, roof structures, seating bowls, plaza landscape and materials.
            </p>

            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Check size={13} className="text-blue-400" />
                <span>8 architectural component categories</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={13} className="text-blue-400" />
                <span>Real-time 3D parametric viewport</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={13} className="text-blue-400" />
                <span>Complete undo and redo history</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-200 font-medium">
            <span>Start Manual Design</span>
            <ArrowRight size={14} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        {/* Option B: AI Assistant */}
        <button
          onClick={() => handleSelect('ai')}
          className="text-left p-6 rounded-2xl bg-gradient-to-b from-[#141b30] to-[#0f1526] hover:from-[#18213c] hover:to-[#12192e] border border-blue-500/40 hover:border-blue-400 transition-all flex flex-col justify-between group relative shadow-2xl hover:-translate-y-0.5 ring-1 ring-blue-500/20"
        >
          <div className="absolute top-5 right-5 text-[10px] font-mono font-semibold text-blue-300 bg-blue-600/30 border border-blue-400/40 px-2.5 py-0.5 rounded-full shadow-sm">
            Recommended
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/30">
              <Sparkles size={20} />
            </div>

            <div className="text-[11px] font-mono text-blue-400 mb-1">Generative Architecture</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Design Assistant</h3>
            <p className="text-slate-200 text-xs leading-relaxed mb-6">
              Describe your idea and let AI create a starting design for you. Continue customizing and refining the generated 3D concept freely.
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={13} className="text-blue-400" />
                <span>Natural language prompt synthesis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={13} className="text-blue-400" />
                <span>Generates complete structural configuration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={13} className="text-blue-400" />
                <span>Fully customizable in 3D workspace</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-blue-400 font-semibold">
            <span>Launch AI Assistant</span>
            <ArrowRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
