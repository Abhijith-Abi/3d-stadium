'use client';

import {
  Monitor,
  Touchpad,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { StadiumPreview3D } from '@/components/stadium-viewer/StadiumPreview3D';

export function MuseumSetup() {
  return (
    <div className="rounded-xl bg-[#0a0f1d] p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono text-blue-400 uppercase tracking-wider mb-1">
            Physical Exhibition Concept
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Physical Setup in the Museum
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Dual-display architectural station layout: large wall output display paired with an inclined multi-touch design console for interactive visitor exploration.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Stations Synchronized & Online</span>
        </div>
      </div>

      {/* Physical Setup Dual Kiosks (Station 1 & Station 2) matching reference image */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {[
          { id: 1, label: 'Station 1', mode: 'Interactive 3D Visitor Terminal' },
          { id: 2, label: 'Station 2', mode: 'AI Co-Design Exploration Pod' },
        ].map((station) => (
          <div
            key={station.id}
            className="p-5 rounded-xl bg-[#0e1424] border border-white/[0.08] flex flex-col items-center shadow-lg relative group"
          >
            {/* Top Tag */}
            <div className="w-full flex items-center justify-between text-xs mb-3 text-slate-400 font-mono">
              <span className="text-white font-semibold">{station.label}</span>
              <span className="text-[11px] text-blue-400">{station.mode}</span>
            </div>

            {/* 1. Large Wall Display (Live Output) */}
            <div className="w-full">
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                <Monitor size={12} className="text-blue-400" />
                <span>Large Display (Live Output)</span>
              </div>
              <div className="h-44 sm:h-52 w-full rounded-lg bg-[#070a13] border border-blue-500/30 overflow-hidden relative shadow-inner">
                <StadiumPreview3D autoRotate={true} className="pointer-events-none" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-mono text-slate-300 border border-white/10">
                  4K 60FPS Video Wall
                </div>
              </div>
            </div>

            {/* Mounting Pedestal Stand Neck */}
            <div className="w-4 h-5 bg-gradient-to-b from-slate-700 to-slate-900 border-x border-slate-700 my-1" />

            {/* 2. Interactive Touchscreen Console (Design & Controls) */}
            <div className="w-full">
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                <Touchpad size={12} className="text-blue-400" />
                <span>Interactive Touchscreen (Design & Controls)</span>
              </div>
              <div className="h-28 w-full rounded-lg bg-[#111728] border border-white/10 p-2.5 flex flex-col justify-between shadow-lg relative overflow-hidden transform group-hover:-translate-y-0.5 transition-transform">
                {/* Simulated UI Screen on Touch Console */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                  <span className="text-[10px] font-mono text-slate-300">Stadium Studio UI</span>
                  <span className="text-[9px] font-mono text-emerald-400">Touch Active</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 py-1">
                  {['Lattice', 'Retractable', '60K Seats', 'Night Match'].map((t, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-[#182138] p-1.5 text-center text-[9px] font-mono text-slate-300 border border-white/[0.06]"
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-white/[0.06]">
                  <span>Touch Response: &lt;8ms</span>
                  <span className="text-blue-400">Visitor Design Session Active</span>
                </div>
              </div>
            </div>

            {/* Base Plinth of Kiosk */}
            <div className="w-28 h-2 rounded-b bg-slate-800 border-t border-slate-600 mt-1 shadow-md" />
            <div className="text-[11px] font-mono text-slate-400 font-semibold mt-3">
              {station.label}
            </div>
          </div>
        ))}
      </div>

      {/* Specifications Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {[
          {
            title: 'Dual-Screen Synchronization',
            desc: 'Real-time WebSocket bridge mirrors touch input immediately onto the 4K wall display.',
          },
          {
            title: 'Bilingual Exhibition Interface',
            desc: 'Seamless English and Arabic localized UI with instantaneous language flipping.',
          },
          {
            title: 'Export & Souvenir Printing',
            desc: 'Visitors take home personalized design summaries via QR code or physical print.',
          },
          {
            title: 'Automated Kiosk Recovery',
            desc: 'Self-resetting idle timer preserves unattended museum gallery uptime.',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-[#0e1424] border border-white/[0.06]"
          >
            <h4 className="font-semibold text-white mb-1">{item.title}</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
