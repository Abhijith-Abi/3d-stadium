'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchSavedDesigns, deleteDesign } from '@/services/stadiumApi';
import { useStadiumStore } from '@/stores/stadiumStore';
import type { StadiumConfig } from '@/types/stadium';
import { FACADE_STYLES, ROOF_TYPES } from '@/constants/stadium';
import { formatCapacity } from '@/lib/utils';
import { Trash2, Pencil, Trophy, ArrowLeft, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft size={16} /> Back to Designer
            </Link>
            <h1 className="text-3xl font-extrabold text-white">Saved Designs</h1>
            <p className="text-slate-400 mt-1">Your stadium design library</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={32} className="animate-spin text-purple-500" />
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border border-white/8">
            <Trophy size={40} className="mx-auto text-slate-600 mb-4" />
            <div className="text-slate-400">No saved designs yet</div>
            <Link href="/" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium">
              Start Designing
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {designs.map((design, i) => {
              const facadeLabel = FACADE_STYLES.find((f) => f.value === design.facade)?.label ?? design.facade;
              const roofLabel = ROOF_TYPES.find((r) => r.value === design.roof)?.label ?? design.roof;
              return (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 border border-white/8 hover:border-purple-500/30 transition-all group"
                >
                  {/* Color swatch */}
                  <div className="flex gap-2 mb-4">
                    {[design.materials.primaryColor, design.materials.secondaryColor, design.materials.accentColor].map((c) => (
                      <div key={c} className="w-8 h-8 rounded-lg border border-white/10" style={{ background: c }} />
                    ))}
                  </div>

                  <div className="font-bold text-white mb-1">{design.name}</div>
                  <div className="text-xs text-slate-500 capitalize mb-3">{design.type.replace('-', ' ')} · {facadeLabel}</div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Roof</span>
                      <span className="text-slate-300">{roofLabel}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Capacity</span>
                      <span className="text-slate-300">{formatCapacity(design.seating.capacity)} seats</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Source</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${design.aiGenerated ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                        {design.aiGenerated ? 'AI' : 'Manual'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/"
                      onClick={() => restoreDesign(design)}
                      className="flex-1 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Pencil size={12} /> Edit
                    </Link>
                    <button
                      onClick={() => design.id && handleDelete(design.id)}
                      className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center transition-all"
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

