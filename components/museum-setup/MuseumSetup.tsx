'use client';

import { Monitor, Touchpad } from 'lucide-react';
import { StadiumPreview3D } from '@/components/stadium-viewer/StadiumPreview3D';

export function MuseumSetup() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="annotation-brass mb-2">Physical exhibition concept</div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Physical setup in the museum
          </h2>
          <p className="text-xs text-ink-muted mt-2 max-w-xl leading-relaxed">
            Dual-display architectural station layout: a large wall output display paired with an
            inclined multi-touch design console for interactive visitor exploration.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-brass border border-brass/40 px-3 py-1.5 self-start">
          <span className="w-1.5 h-1.5 bg-brass" />
          <span>Stations synchronized & online</span>
        </div>
      </div>

      {/* Dual kiosks */}
      <div className="grid md:grid-cols-2 gap-6 border border-line bg-paper p-5 sm:p-6 mb-6">
        {[
          { id: 1, label: 'Station 1', mode: 'Interactive 3D visitor terminal' },
          { id: 2, label: 'Station 2', mode: 'AI co-design exploration pod' },
        ].map((station) => (
          <div key={station.id} className="flex flex-col">
            {/* Station header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
              <span className="text-xs font-semibold text-ink font-mono uppercase tracking-wider">
                {station.label}
              </span>
              <span className="annotation">{station.mode}</span>
            </div>

            {/* Wall display */}
            <div>
              <div className="annotation mb-1.5 flex items-center gap-1.5">
                <Monitor size={11} className="text-brass" />
                <span>Large display — live output</span>
              </div>
              <div className="h-44 sm:h-52 w-full bg-viewport border border-ink/30 overflow-hidden relative">
                <StadiumPreview3D autoRotate={true} showQuickControls={false} quality="mini" className="pointer-events-none" />
                <div className="absolute top-2 right-2 px-2 py-0.5 vp-chip text-[9px] font-mono">
                  4K · 60 FPS
                </div>
              </div>
            </div>

            {/* Pedestal */}
            <div className="flex justify-center">
              <div className="w-4 h-5 bg-ink-soft my-1" />
            </div>

            {/* Touch console */}
            <div>
              <div className="annotation mb-1.5 flex items-center gap-1.5">
                <Touchpad size={11} className="text-brass" />
                <span>Interactive touchscreen — design & controls</span>
              </div>
              <div className="h-28 w-full bg-paper-raised border border-line p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-line pb-1.5">
                  <span className="text-[10px] font-mono text-ink-soft">Stadium Studio UI</span>
                  <span className="text-[9px] font-mono text-brass">Touch active</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 py-1">
                  {['Lattice', 'Retractable', '60K seats', 'Night match'].map((t, idx) => (
                    <div
                      key={idx}
                      className="border border-line bg-paper p-1.5 text-center text-[9px] font-mono text-ink-muted"
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-ink-muted pt-1 border-t border-line">
                  <span>Touch response: &lt;8ms</span>
                  <span className="text-brass">Session active</span>
                </div>
              </div>
            </div>

            {/* Plinth */}
            <div className="flex justify-center">
              <div className="w-28 h-2 bg-ink-soft border-t border-ink mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Specifications */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 border border-line divide-y sm:divide-y-0 sm:divide-x divide-line">
        {[
          {
            title: 'Dual-screen synchronization',
            desc: 'Real-time WebSocket bridge mirrors touch input immediately onto the 4K wall display.',
          },
          {
            title: 'Bilingual interface',
            desc: 'Seamless English and Arabic localized UI with instantaneous language flipping.',
          },
          {
            title: 'Export & souvenir printing',
            desc: 'Visitors take home personalized design summaries via QR code or physical print.',
          },
          {
            title: 'Automated kiosk recovery',
            desc: 'Self-resetting idle timer preserves unattended museum gallery uptime.',
          },
        ].map((item) => (
          <div key={item.title} className="p-4">
            <div className="flex items-start gap-2">
              <span className="text-brass font-mono text-[10px] mt-0.5">→</span>
              <div>
                <h4 className="text-xs font-semibold text-ink mb-1.5">{item.title}</h4>
                <p className="text-ink-muted text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
