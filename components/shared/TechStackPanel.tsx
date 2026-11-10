'use client';

import { Layers, Database, Cpu, Layout } from 'lucide-react';

const highLevelStack = [
  {
    layer: 'Frontend',
    desc: 'React + Three.js (React Three Fiber)',
    detail: 'Next.js 16 App Router · Drei · Tailwind CSS v4 · Canvas WebGL',
    icon: Layout,
    color: '#38bdf8',
  },
  {
    layer: 'Backend',
    desc: 'Python Django (API, Save, Gallery)',
    detail: 'REST Endpoints · Session Management · Architectural Schema Validation',
    icon: Layers,
    color: '#34d399',
  },
  {
    layer: 'Database',
    desc: 'PostgreSQL',
    detail: 'Relational Schema · JSONB Config Storage · Exhibition Museum Logs',
    icon: Database,
    color: '#60a5fa',
  },
  {
    layer: 'AI Layer',
    desc: 'GPT API (Design intent → configuration)',
    detail: 'Multi-modal Semantic Parser · Cultural Architectural Synthesizer',
    icon: Cpu,
    color: '#c084fc',
  },
];

export function TechStackPanel() {
  return (
    <div className="rounded-xl bg-[#0a0f1d] p-6 sm:p-8 border border-white/[0.08] shadow-xl">
      <div className="mb-6">
        <div className="text-[11px] font-mono text-blue-400 uppercase tracking-wider mb-1">
          System Overview
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          Technology Stack (High-Level)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Architectural software pipeline powering the real-time 3D viewport and AI generative synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highLevelStack.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.layer}
              className="p-4 rounded-xl bg-[#0e1424] border border-white/[0.08] hover:border-blue-500/30 transition-colors shadow-md"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}35`,
                    color: item.color,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-400">{item.layer}</div>
                  <div className="text-sm font-semibold text-white leading-tight">
                    {item.desc}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/[0.04] pt-2.5">
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
