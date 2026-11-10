'use client';

import { useState } from 'react';
import { useStadiumStore } from '@/stores/stadiumStore';
import { StadiumPreview3D } from '@/components/stadium-viewer/StadiumPreview3D';
import { FACADE_STYLES, ROOF_TYPES, STADIUM_TYPES } from '@/constants/stadium';
import { saveDesign } from '@/services/stadiumApi';
import {
  Save,
  Pencil,
  Share2,
  Printer,
  Check,
  Loader2,
} from 'lucide-react';
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
    <div className="min-h-[calc(100vh-56px)] px-6 py-8 bg-[#07090f]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <div className="text-[11px] font-mono text-blue-400 mb-1">Step 7 of 7 · Completion</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Your Stadium is Ready!
          </h2>
          <p className="text-slate-400 text-xs">
            Review your master architectural 3D stadium design, inspect details, and save or export.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Main 3D Viewport */}
          <div className="lg:col-span-8 h-[520px] rounded-xl bg-[#0b0e18] border border-white/[0.08] relative overflow-hidden shadow-2xl shadow-blue-950/20">
            <StadiumPreview3D interactive={true} autoRotate={true} />
            <div className="absolute top-4 left-5 text-xs font-mono text-slate-300 pointer-events-none bg-[#0a0f1d]/80 px-3 py-1.5 rounded border border-white/[0.08]">
              {config.name}
            </div>
            <div className="absolute bottom-4 left-5 text-[11px] font-mono text-slate-400 pointer-events-none bg-[#0a0f1d]/80 px-3 py-1.5 rounded border border-white/[0.08]">
              Drag to rotate · Scroll to zoom · Right-click to pan
            </div>
          </div>

          {/* Design Summary Panel & Actions */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-[#0d121e] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-sm font-bold text-white">Design Summary</h3>
                  <div className="text-[11px] text-slate-400">{config.name}</div>
                </div>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                  {config.aiGenerated ? 'AI Assisted' : 'Manual Design'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {specifications.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between py-1.5 border-b border-white/[0.04]"
                  >
                    <span className="text-slate-400">{spec.label}</span>
                    <span className="text-white font-mono capitalize">{spec.val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <div className="text-[11px] text-slate-400 mb-2 font-medium">Architectural Color Palette:</div>
                <div className="flex gap-2">
                  {[
                    { color: config.materials.primaryColor, label: 'Primary' },
                    { color: config.materials.secondaryColor, label: 'Structure' },
                    { color: config.materials.accentColor, label: 'Accent' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <div
                        className="w-4 h-4 rounded border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons matching Step 7 in reference */}
            <div className="space-y-2.5">
              <button
                onClick={handleSave}
                disabled={isSaving || saved}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-75 transition-all shadow-lg shadow-blue-600/30 active:scale-[0.99]"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving design…</span>
                  </>
                ) : saved ? (
                  <>
                    <Check size={15} />
                    <span>Design Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save My Design</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleEdit}
                  className="py-2.5 rounded-lg bg-[#141b2a] hover:bg-[#1a2336] text-slate-200 text-xs font-medium border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Pencil size={13} />
                  <span>Back to Edit</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-2.5 rounded-lg bg-[#141b2a] hover:bg-[#1a2336] text-slate-200 text-xs font-medium border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 size={13} />
                  <span>Print / Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
