'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import { StadiumPreview3D } from '@/components/stadium-viewer/StadiumPreview3D';
import { WorkflowDiagram } from '@/components/workflow/WorkflowDiagram';
import { TechStackPanel } from '@/components/shared/TechStackPanel';
import { MuseumSetup } from '@/components/museum-setup/MuseumSetup';
import { ArrowRight } from 'lucide-react';

export function WelcomeScreen() {
  const setAppStep = useStadiumStore((s) => s.setAppStep);
  const { language, setLanguage, config } = useStadiumStore();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper text-ink">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="max-w-[1500px] mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center py-12 lg:py-16">
          {/* Left: editorial copy */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-6">
              <div className="annotation">01 — Welcome</div>

              {/* Language selector */}
              <div className="flex items-center border border-line divide-x divide-line">
                {(['en', 'ar'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 py-1 transition-colors uppercase text-[11px] font-mono ${
                      language === lang
                        ? 'bg-ink text-paper'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.05] tracking-tight text-ink mb-5">
              {language === 'ar' ? 'صمّم ملعب أحلامك' : (
                <>
                  Design your
                  <br />
                  dream stadium.
                </>
              )}
            </h1>

            <p className="text-ink-soft text-[15px] leading-relaxed mb-8 max-w-md border-l-2 border-brass pl-4">
              {language === 'ar'
                ? 'أنشئ ملعباً فريداً مستوحى من رؤيتك وثقافتك وأسلوبك المعماري بدقة ثلاثية الأبعاد تفاعلية.'
                : 'Configure a complete stadium — facade, roof structure, seating bowl, plaza landscape and materials — rendered live in interactive 3D.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setAppStep('choose-mode')}
                className="btn-ink px-6 py-3 text-sm font-semibold"
              >
                <span>{language === 'ar' ? 'ابدأ التصميم' : 'Start designing'}</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('exhibition-setup');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-outline px-4 py-3 text-xs font-medium"
              >
                <span>Museum setup</span>
              </button>
            </div>

            {/* Spec figures */}
            <div className="mt-12 pt-6 border-t border-line grid grid-cols-3 divide-x divide-line">
              {[
                { v: '120K', l: 'Max capacity' },
                { v: '08', l: 'Component groups' },
                { v: '60', l: 'FPS · WebGL' },
              ].map((s) => (
                <div key={s.l} className="first:pl-0 px-4 first:px-0">
                  <div className="text-2xl font-display font-semibold text-ink tabular-nums">
                    {s.v}
                  </div>
                  <div className="annotation mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3D viewport */}
          <div className="lg:col-span-7">
            <div className="h-[480px] lg:h-[540px] bg-viewport relative overflow-hidden border border-ink/20">
              {/* Viewport chrome */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 text-[11px] font-mono pointer-events-none">
                <div className="vp-chip px-3 py-1.5 pointer-events-none">
                  <span className="text-paper/90">{config.name}</span>
                </div>
                <div className="vp-chip px-2.5 py-1.5 pointer-events-none">
                  <span className="text-paper/60">
                    {config.seating.capacity.toLocaleString()} seats
                  </span>
                </div>
              </div>

              <StadiumPreview3D interactive={true} autoRotate={true} />

              <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 text-[10px] font-mono pointer-events-none text-paper/50">
                <span>Drag rotate · Scroll zoom · Right-drag pan</span>
                <span>Scale 1 : 500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────── */}
      <section className="border-b border-line py-12">
        <div className="max-w-[1500px] mx-auto px-6">
          <WorkflowDiagram />
        </div>
      </section>

      {/* ── Museum setup ─────────────────────────────────────────────── */}
      <section id="exhibition-setup" className="border-b border-line py-12">
        <div className="max-w-[1500px] mx-auto px-6">
          <MuseumSetup />
        </div>
      </section>

      {/* ── Stack ────────────────────────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-[1500px] mx-auto px-6">
          <TechStackPanel />
        </div>
      </section>
    </div>
  );
}
