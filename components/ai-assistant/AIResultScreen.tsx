'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import { StadiumPreview3D } from '@/components/stadium-viewer/StadiumPreview3D';
import { generateAiDesign } from '@/services/stadiumApi';
import { RefreshCw, Pencil, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { FACADE_STYLES, ROOF_TYPES } from '@/constants/stadium';

export function AIResultScreen() {
  const {
    aiGeneratedDesign,
    setAiGeneratedDesign,
    setAiLoading,
    isAiLoading,
    aiInput,
    applyAiDesign,
    setAppStep,
  } = useStadiumStore();

  if (!aiGeneratedDesign) {
    setAppStep('ai-input');
    return null;
  }

  const { config, description } = aiGeneratedDesign;

  const handleTryAnother = async () => {
    setAiLoading(true);
    try {
      const result = await generateAiDesign(aiInput);
      setAiGeneratedDesign(result);
      toast.success('Generated new variation');
    } catch {
      toast.error('Could not generate variation');
    } finally {
      setAiLoading(false);
    }
  };

  const facadeLabel = FACADE_STYLES.find((f) => f.value === config.facade)?.label ?? config.facade;
  const roofLabel = ROOF_TYPES.find((r) => r.value === config.roof)?.label ?? config.roof;

  return (
    <div className="min-h-[calc(100vh-56px)] px-6 py-10 bg-[#090b10]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <div className="text-[11px] font-mono text-blue-400 mb-1">Step 4 of 7 · AI Concept</div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
            Here&apos;s a design based on your idea
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">{description}</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* 3D Model View */}
          <div className="lg:col-span-7 h-[460px] rounded-xl bg-[#0c0f16] border border-white/[0.08] relative overflow-hidden">
            <StadiumPreview3D config={config} interactive={true} autoRotate={true} />
            <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-500 pointer-events-none">
              Drag to inspect 3D structure
            </div>
          </div>

          {/* Config Summary & Actions */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-[#0f121a] border border-white/[0.08]">
              <div className="text-xs font-semibold text-white mb-3">
                Configuration Summary
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Stadium type', val: config.type.replace('-', ' ') },
                  { label: 'Exterior facade', val: facadeLabel },
                  { label: 'Roof structure', val: roofLabel },
                  { label: 'Sky environment', val: config.landscape?.background ?? 'night' },
                  { label: 'Landscape plaza', val: config.landscape?.landscapeStyle ?? 'olympic' },
                  { label: 'Seating capacity', val: `${config.seating.capacity.toLocaleString()} seats` },
                  { label: 'Tiers', val: `${config.seating.tiers} levels` },
                  { label: 'Lighting', val: config.interior.lighting },
                  { label: 'Solar grid', val: config.addons.hasSolarPanels ? 'Included' : 'None' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-1.5 border-b border-white/[0.04]"
                  >
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-white font-mono capitalize">{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Color swatches */}
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <div className="text-[11px] text-slate-500 mb-2">Palette:</div>
                <div className="flex gap-2">
                  {[config.materials.primaryColor, config.materials.secondaryColor, config.materials.accentColor].map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded border border-white/20"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions matching Step 4 in reference */}
            <div className="space-y-2.5">
              <button
                onClick={applyAiDesign}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.99]"
              >
                <span>Use This Design</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={handleTryAnother}
                disabled={isAiLoading}
                className="w-full py-2.5 rounded-lg bg-[#141b2a] hover:bg-[#1a2336] border border-white/[0.08] text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isAiLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                <span>Try Another</span>
              </button>

              <button
                onClick={() => setAppStep('ai-input')}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition-colors"
              >
                <Pencil size={11} />
                <span>Edit Prompt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
