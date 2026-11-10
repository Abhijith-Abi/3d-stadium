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
    <div className="min-h-[calc(100vh-64px)] px-6 py-10 bg-paper">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="annotation-brass mb-3">04 — AI concept</div>
            <h2 className="text-3xl font-semibold text-ink tracking-tight mb-2">
              Here&apos;s a design based on your idea
            </h2>
            <p className="text-ink-muted text-sm leading-relaxed max-w-xl border-l-2 border-brass pl-4">
              {description}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* 3D viewport */}
          <div className="lg:col-span-7 h-[460px] bg-viewport border border-ink/20 relative overflow-hidden">
            <StadiumPreview3D config={config} interactive={true} autoRotate={true} />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 text-[10px] font-mono text-paper/50 pointer-events-none">
              Drag to inspect the 3D structure
            </div>
          </div>

          {/* Specification sheet */}
          <div className="lg:col-span-5 space-y-5">
            <div className="border border-ink bg-paper">
              <div className="flex items-center justify-between px-5 py-3 border-b border-line">
                <span className="text-sm font-semibold text-ink">Configuration summary</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-brass">
                  {config.aiGenerated ? 'AI assisted' : 'Manual'}
                </span>
              </div>

              <div className="px-5 py-2 text-xs">
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
                    className="flex items-center justify-between py-2 border-b border-line/60 last:border-0"
                  >
                    <span className="text-ink-muted">{row.label}</span>
                    <span className="text-ink font-mono capitalize text-right">{row.val}</span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-line flex items-center gap-4">
                <span className="annotation">Palette</span>
                <div className="flex gap-1.5">
                  {[
                    config.materials.primaryColor,
                    config.materials.secondaryColor,
                    config.materials.accentColor,
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 border border-line-strong"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={applyAiDesign}
                className="btn-ink w-full py-3 text-sm font-semibold"
              >
                <span>Use this design</span>
                <ArrowRight size={15} />
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleTryAnother}
                  disabled={isAiLoading}
                  className="btn-outline py-2.5 text-xs font-medium"
                >
                  {isAiLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  <span>Try another</span>
                </button>

                <button
                  onClick={() => setAppStep('ai-input')}
                  className="btn-outline py-2.5 text-xs font-medium"
                >
                  <Pencil size={13} />
                  <span>Edit prompt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
