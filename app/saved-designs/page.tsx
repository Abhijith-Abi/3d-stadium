'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchSavedDesigns, deleteDesign } from '@/services/stadiumApi';
import { useStadiumStore } from '@/stores/stadiumStore';
import type { StadiumConfig } from '@/types/stadium';
import { FACADE_STYLES, ROOF_TYPES } from '@/constants/stadium';
import { formatCapacity } from '@/lib/utils';
import { Trash2, Pencil, FolderOpen, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SavedDesignsPage() {
  const [designs, setDesigns] = useState<StadiumConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const restoreDesign = useStadiumStore((s) => s.restoreDesign);

  useEffect(() => {
    fetchSavedDesigns()
      .then(setDesigns)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      toast.success('Design deleted');
    } catch {
      toast.error('Could not delete design');
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 bg-paper">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10 flex items-end justify-between border-b border-line pb-6">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-ink-muted hover:text-ink text-xs mb-4 transition-colors"
            >
              <ArrowLeft size={14} /> Back to designer
            </Link>
            <div className="annotation-brass mb-2">Archive</div>
            <h1 className="text-3xl font-semibold text-ink tracking-tight">Saved designs</h1>
          </div>
          <span className="font-mono text-xs text-ink-muted tabular-nums hidden sm:block">
            {designs.length} {designs.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={24} className="animate-spin text-brass" />
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-20 border border-line bg-paper-raised/40">
            <FolderOpen size={32} strokeWidth={1.5} className="mx-auto text-line-strong mb-4" />
            <div className="text-ink-muted text-sm mb-5">No saved designs yet</div>
            <Link href="/" className="btn-ink px-5 py-2.5 text-xs font-semibold">
              Start designing
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-line">
            {designs.map((design, i) => {
              const facadeLabel = FACADE_STYLES.find((f) => f.value === design.facade)?.label ?? design.facade;
              const roofLabel = ROOF_TYPES.find((r) => r.value === design.roof)?.label ?? design.roof;
              return (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-r border-b border-line p-5 bg-paper hover:bg-paper-raised/50 transition-colors group flex flex-col"
                >
                  {/* Palette */}
                  <div className="flex gap-1.5 mb-4">
                    {[design.materials.primaryColor, design.materials.secondaryColor, design.materials.accentColor].map(
                      (c, ci) => (
                        <div key={ci} className="w-7 h-7 border border-line-strong" style={{ background: c }} />
                      )
                    )}
                  </div>

                  <div className="text-sm font-semibold text-ink mb-1">{design.name}</div>
                  <div className="text-[11px] text-ink-muted capitalize mb-4 font-mono">
                    {design.type.replace('-', ' ')} · {facadeLabel}
                  </div>

                  <div className="space-y-0 mb-5 border-t border-line pt-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-line/60">
                      <span className="text-ink-muted">Roof</span>
                      <span className="text-ink">{roofLabel}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-line/60">
                      <span className="text-ink-muted">Capacity</span>
                      <span className="text-ink font-mono tabular-nums">{formatCapacity(design.seating.capacity)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-ink-muted">Source</span>
                      <span className={`font-mono text-[10px] uppercase tracking-widest px-1.5 ${design.aiGenerated ? 'text-brass' : 'text-ink'}`}>
                        {design.aiGenerated ? 'AI' : 'Manual'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Link
                      href="/"
                      onClick={() => restoreDesign(design)}
                      className="btn-outline flex-1 py-2 text-xs font-medium"
                    >
                      <Pencil size={12} /> Edit
                    </Link>
                    <button
                      onClick={() => design.id && handleDelete(design.id)}
                      className="py-2 px-3 border border-line text-ink-muted hover:border-signal hover:text-signal text-xs flex items-center justify-center transition-colors"
                      title="Delete design"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
