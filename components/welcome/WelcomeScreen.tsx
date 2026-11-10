'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import { StadiumPreview3D } from '@/components/stadium-viewer/StadiumPreview3D';
import { WorkflowDiagram } from '@/components/workflow/WorkflowDiagram';
import { TechStackPanel } from '@/components/shared/TechStackPanel';
import { MuseumSetup } from '@/components/museum-setup/MuseumSetup';
import {
  ArrowRight,
  Compass,
  Layers,
  Box,
  FileText,
  Sliders,
} from 'lucide-react';

export function WelcomeScreen() {
  const setAppStep = useStadiumStore((s) => s.setAppStep);
  const { language, setLanguage, config } = useStadiumStore();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#090b10] text-[#eceff4]">
      {/* ── Main Hero Section ────────────────────────────────────────── */}
      <section className="border-b border-white/[0.08] py-12 lg:py-16">
        <div className="max-w-[1500px] mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
          {/* Left: Product Information & Clear Actions */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-[11px] font-mono text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Step 1 · Welcome / Attract Screen</span>
              </div>

              {/* Language Selection Pill (EN | AR) matching Reference */}
              <div className="flex items-center p-0.5 rounded-lg bg-[#0e1424] border border-white/[0.08] text-xs font-mono">
                {(['en', 'ar'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 py-1 rounded-md transition-all uppercase text-[11px] font-semibold ${
                      language === lang
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] text-white mb-4">
              {language === 'ar' ? 'صمّم ملعب أحلامك' : 'Design Your Dream Stadium'}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
              {language === 'ar'
                ? 'أنشئ ملعباً فريداً مستوحى من رؤيتك وثقافتك وأسلوبك المعماري بدقة ثلاثية الأبعاد تفاعلية.'
                : 'Create a unique stadium inspired by your vision, culture and style with real-time interactive 3D architecture.'}
            </p>

            {/* Actions matching Step 1 in reference */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setAppStep('choose-mode')}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-[0.99]"
              >
                <span>{language === 'ar' ? 'ابدأ التصميم' : 'Start Designing'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('exhibition-setup');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-[#141b2a] hover:bg-[#1a2336] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                <Compass size={14} className="text-blue-400" />
                <span>Museum Setup</span>
              </button>
            </div>

            {/* Key Technical Figures */}
            <div className="mt-10 pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl font-semibold text-white font-mono tabular-nums">
                  120K
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Max capacity</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-white font-mono tabular-nums">
                  8
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Component groups</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-white font-mono tabular-nums">
                  60 FPS
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">WebGL rendering</div>
              </div>
            </div>
          </div>

          {/* Right: Focused 3D Real-Time Preview (The Single Bright Moment) */}
          <div className="lg:col-span-7">
            <div className="h-[480px] lg:h-[520px] rounded-xl bg-[#0c0f16] border border-white/[0.08] relative overflow-hidden">
              {/* Telemetry Header */}
              <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between text-xs font-mono pointer-events-none">
                <div className="bg-[#141822]/90 backdrop-blur px-3 py-1.5 rounded border border-white/[0.08] text-slate-300 pointer-events-auto">
                  {config.name}
                </div>
                <div className="bg-[#141822]/90 backdrop-blur px-2.5 py-1 rounded border border-white/[0.08] text-slate-400">
                  {config.seating.capacity.toLocaleString()} seats
                </div>
              </div>

              {/* Interactive 3D Canvas */}
              <StadiumPreview3D interactive={true} autoRotate={true} />

              {/* Viewport Control Caption */}
              <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-[11px] font-mono text-slate-500 pointer-events-none">
                <span>Left click: rotate · Scroll: zoom · Right click: pan</span>
                <span>Scale 1:500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Diagram Section ─────────────────────────────────── */}
      <section className="border-b border-white/[0.08] py-12">
        <div className="max-w-[1500px] mx-auto px-6">
          <WorkflowDiagram />
        </div>
      </section>

      {/* ── Museum Setup Section ─────────────────────────────────────── */}
      <section id="exhibition-setup" className="border-b border-white/[0.08] py-12">
        <div className="max-w-[1500px] mx-auto px-6">
          <MuseumSetup />
        </div>
      </section>

      {/* ── Architecture Stack ───────────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-[1500px] mx-auto px-6">
          <TechStackPanel />
        </div>
      </section>
    </div>
  );
}
