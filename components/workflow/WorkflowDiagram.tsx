'use client';

import { User, Layers, Sliders, Eye, Download, ArrowRight } from 'lucide-react';

const workflowNodes = [
  {
    index: '01',
    title: 'Start',
    subtitle: 'Visitor welcome',
    icon: User,
  },
  {
    index: '02',
    title: 'Choose Mode',
    subtitle: 'Manual or AI',
    icon: Layers,
  },
  {
    index: '03',
    title: 'Design',
    badge: '(Configure)',
    subtitle: '8 categories',
    icon: Sliders,
  },
  {
    index: '04',
    title: 'Preview',
    badge: '(Live 3D)',
    subtitle: 'Interactive 3D',
    icon: Eye,
  },
  {
    index: '05',
    title: 'Save',
    badge: '(Store / Print)',
    subtitle: 'PDF & DB export',
    icon: Download,
  },
];

export function WorkflowDiagram() {
  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="annotation-brass mb-2">Interactive pipeline</div>
          <h3 className="text-2xl font-semibold text-ink tracking-tight">Overall flow</h3>
        </div>
        <p className="text-xs text-ink-muted max-w-sm sm:text-right">
          End-to-end visitor journey across the museum and design experience.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch justify-between gap-3">
        {workflowNodes.map((node, i) => {
          const IconComp = node.icon;
          return (
            <div key={node.title} className="flex-1 w-full flex items-center">
              <div className="w-full h-full p-4 border border-line bg-paper hover:border-line-strong transition-colors flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-brass tabular-nums">{node.index}</span>
                  <IconComp size={16} strokeWidth={1.75} className="text-ink-muted" />
                </div>

                <div className="mt-auto">
                  <div className="text-sm font-semibold text-ink leading-tight">{node.title}</div>
                  {node.badge && (
                    <div className="font-mono text-[10px] text-ink-muted mt-0.5">{node.badge}</div>
                  )}
                  <div className="text-[11px] text-ink-muted mt-1.5 pt-2 border-t border-line">
                    {node.subtitle}
                  </div>
                </div>
              </div>

              {i < workflowNodes.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-2 text-line-strong shrink-0">
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
