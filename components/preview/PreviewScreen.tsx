'use client';

import { useState } from 'react';
import { useStadiumStore } from '@/stores/stadiumStore';
import { StadiumPreview3D } from '@/components/stadium-viewer/StadiumPreview3D';
import { FACADE_STYLES, ROOF_TYPES, STADIUM_TYPES } from '@/constants/stadium';
import { saveDesign } from '@/services/stadiumApi';
import { Save, Pencil, Share2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function PreviewScreen() {
  const { config, setAppStep, setCustomizationStep } = useStadiumStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDesign(config);
      setSaved(true);
      toast.success('Project saved successfully');
    } catch {
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setCustomizationStep('stadium-type');
    setAppStep('customize');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: config.name,
        text: `Stadium Design: ${config.name} (${config.seating.capacity.toLocaleString()} seats).`,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Project link copied to clipboard');
    }
  };

  const facadeLabel = FACADE_STYLES.find((f) => f.value === config.facade)?.label ?? config.facade;
  const roofLabel = ROOF_TYPES.find((r) => r.value === config.roof)?.label ?? config.roof;
  const typeLabel = STADIUM_TYPES.find((t) => t.value === config.type)?.label ?? config.type;

  const specifications = [
    { label: 'Stadium type', val: typeLabel },
    { label: 'Exterior facade', val: facadeLabel },
    { label: 'Roof structure', val: roofLabel },
    { label: 'Seating capacity', val: `${config.seating.capacity.toLocaleString()} seats` },
    { label: 'Atmospheric sky', val: config.landscape?.background ?? 'night' },
    { label: 'Landscape plaza', val: config.landscape?.landscapeStyle ?? 'olympic' },
    { label: 'Bowl tiers', val: `${config.seating.tiers} tiers` },
    { label: 'Floodlighting', val: config.interior.lighting },
    { label: 'Solar panels', val: config.addons.hasSolarPanels ? 'Yes' : 'No' },
    { label: 'VIP hospitality', val: config.seating.hasVip ? 'Yes' : 'No' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] px-6 py-10 bg-paper">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <div className="annotation-brass mb-3">04 — Completion</div>
          <h2 className="text-3xl font-semibold text-ink tracking-tight">
            Your stadium is ready
          </h2>
          <p className="text-ink-muted text-sm mt-2">
            Review the final design, inspect the details, then save or export.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* 3D viewport */}
          <div className="lg:col-span-8 h-[520px] bg-viewport border border-ink/20 relative overflow-hidden">
            <StadiumPreview3D interactive={true} autoRotate={true} />
            <div className="absolute top-3 left-4 vp-chip px-3 py-1.5 text-xs font-mono text-paper/90 pointer-events-none">
              {config.name}
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 text-[10px] font-mono text-paper/50 pointer-events-none">
              Drag rotate · Scroll zoom · Right-drag pan
            </div>
          </div>

          {/* Spec sheet & actions */}
          <div className="lg:col-span-4 space-y-5">
            <div className="border border-ink bg-paper">
              <div className="flex items-center justify-between px-5 py-3 border-b border-line">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Design summary</h3>
                  <div className="text-[11px] text-ink-muted">{config.name}</div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-brass border border-brass/40 px-2 py-1">
                  {config.aiGenerated ? 'AI assisted' : 'Manual'}
                </span>
              </div>

              <div className="px-5 py-2 text-xs">
                {specifications.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between py-2 border-b border-line/60 last:border-0"
                  >
                    <span className="text-ink-muted">{spec.label}</span>
                    <span className="text-ink font-mono capitalize text-right">{spec.val}</span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-line">
                <div className="annotation mb-2">Palette</div>
                <div className="flex gap-2">
                  {[
                    { color: config.materials.primaryColor, label: 'Primary' },
                    { color: config.materials.secondaryColor, label: 'Structure' },
                    { color: config.materials.accentColor, label: 'Accent' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                      <div className="w-4 h-4 border border-line-strong" style={{ backgroundColor: color }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleSave}
                disabled={isSaving || saved}
                className="btn-ink w-full py-3 text-sm font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving design…</span>
                  </>
                ) : saved ? (
                  <>
                    <Check size={15} />
                    <span>Design saved</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save my design</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={handleEdit} className="btn-outline py-2.5 text-xs font-medium">
                  <Pencil size={13} />
                  <span>Back to edit</span>
                </button>

                <button onClick={handleShare} className="btn-outline py-2.5 text-xs font-medium">
                  <Share2 size={13} />
                  <span>Print / share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
