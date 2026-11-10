'use client';

import { Layers, Database, Cpu, Layout } from 'lucide-react';

const highLevelStack = [
  {
    layer: 'Frontend',
    desc: 'React + Three.js (React Three Fiber)',
    detail: 'Next.js 16 App Router · Drei · Tailwind CSS v4 · Canvas WebGL',
    icon: Layout,
  },
  {
    layer: 'Backend',
    desc: 'Python Django (API, Save, Gallery)',
    detail: 'REST endpoints · Session management · Architectural schema validation',
    icon: Layers,
  },
  {
    layer: 'Database',
    desc: 'PostgreSQL',
    detail: 'Relational schema · JSONB config storage · Exhibition museum logs',
    icon: Database,
  },
  {
    layer: 'AI Layer',
    desc: 'GPT API (Design intent → configuration)',
    detail: 'Multi-modal semantic parser · Cultural architectural synthesizer',
    icon: Cpu,
  },
];

export function TechStackPanel() {
  return (
    <div>
      <div className="mb-8">
        <div className="annotation-brass mb-2">System overview</div>
        <h3 className="text-2xl font-semibold text-ink tracking-tight">Technology stack</h3>
        <p className="text-xs text-ink-muted mt-2 max-w-lg">
          The software pipeline powering the real-time 3D viewport and AI generative synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-line divide-y lg:divide-y-0 sm:divide-y-0 sm:grid-cols-2 lg:divide-x divide-line">
        {highLevelStack.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.layer} className="p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-line">
                <div className="w-8 h-8 border border-line-strong flex items-center justify-center text-ink shrink-0">
                  <Icon size={15} strokeWidth={1.75} />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-brass">
                  {item.layer}
                </div>
              </div>

              <div className="text-sm font-semibold text-ink leading-snug mb-2">
                {item.desc}
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
