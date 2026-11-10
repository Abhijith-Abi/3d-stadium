'use client';

import { User, Layers, Sliders, Eye, Download, ArrowRight } from 'lucide-react';

const workflowNodes = [
  {
    title: 'Start',
    subtitle: 'Visitor welcome',
    icon: User,
  },
  {
    title: 'Choose Mode',
    subtitle: 'Manual or AI',
    icon: Layers,
  },
  {
    title: 'Design',
    badge: '(Configure)',
    subtitle: '8 Categories',
    icon: Sliders,
  },
  {
    title: 'Preview',
    badge: '(Live 3D)',
    subtitle: 'Interactive 3D',
    icon: Eye,
  },
  {
    title: 'Save',
    badge: '(Store / Print)',
    subtitle: 'PDF & DB export',
    icon: Download,
  },
];

export function WorkflowDiagram() {
  return (
    <div className="rounded-xl bg-[#0a0f1d] p-6 sm:p-8 border border-white/[0.08] shadow-xl">
      <div className="mb-6">
        <div className="text-[11px] font-mono text-blue-400 uppercase tracking-wider mb-1">
          Interactive Pipeline
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          Overall Flow
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          End-to-end user journey across the museum and design experience.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {workflowNodes.map((node, i) => {
          const IconComp = node.icon;
          return (
            <div key={node.title} className="flex-1 w-full flex items-center">
              <div className="w-full p-4 rounded-xl bg-[#0e1424] border border-white/[0.08] flex flex-col items-center text-center shadow-md hover:border-blue-500/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2.5 shadow-inner">
                  <IconComp size={18} />
                </div>
                <div className="text-xs font-bold text-white leading-tight">
                  {node.title}
                </div>
                {node.badge && (
                  <div className="text-[10px] font-mono text-blue-400 mt-0.5">
                    {node.badge}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-1">
                  {node.subtitle}
                </div>
              </div>

              {i < workflowNodes.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-2 text-slate-600">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
