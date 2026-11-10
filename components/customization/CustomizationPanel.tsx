'use client';

import { useStadiumStore } from '@/stores/stadiumStore';
import type { CustomizationStep } from '@/types/stadium';
import {
  STADIUM_TYPES,
  FACADE_STYLES,
  ROOF_TYPES,
  BACKGROUND_PRESETS,
  LANDSCAPE_STYLES,
} from '@/constants/stadium';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

function OptionCard({
  selected,
  onClick,
  children,
  colorHint,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  colorHint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-colors relative group',
        selected
          ? 'bg-[#182030] border-blue-500/50 text-white'
          : 'bg-[#10141e] border-white/[0.06] text-slate-400 hover:bg-[#151a28] hover:text-slate-200'
      )}
    >
      <div className="flex items-start gap-2.5">
        {colorHint && (
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border border-white/20"
            style={{ backgroundColor: colorHint }}
          />
        )}
        <div className="flex-1 pr-5">{children}</div>
        {selected && (
          <div className="absolute top-3 right-3 text-blue-400">
            <Check size={14} />
          </div>
        )}
      </div>
    </button>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-4 border-b border-white/[0.08] mb-4">
      <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StadiumTypePanel() {
  const { config, updateConfig } = useStadiumStore();
  return (
    <div>
      <SectionHead
        title="Stadium Type"
        subtitle="Select the primary stadium layout"
      />
      <div className="px-4 space-y-2">
        {STADIUM_TYPES.map((t) => (
          <OptionCard
            key={t.value}
            selected={config.type === t.value}
            onClick={() => updateConfig({ type: t.value })}
          >
            <div className="text-xs font-medium text-white">{t.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t.description}</div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

function FacadeThumbnailSvg({ style }: { style: string }) {
  switch (style) {
    case 'lattice':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#090d16" />
          <path d="M 0,90 Q 80,45 160,90 Z" fill="#d97706" opacity="0.45" />
          {/* Diagrid crossing white beams */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`cw-${i}`}
              x1={i * 24 - 20}
              y1="90"
              x2={i * 24 + 40}
              y2="15"
              stroke="#f8fafc"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`ccw-${i}`}
              x1={i * 24 + 40}
              y1="90"
              x2={i * 24 - 20}
              y2="15"
              stroke="#f1f5f9"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          ))}
          <path d="M 0,20 Q 80,8 160,20" stroke="#38bdf8" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'slats':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#0c0e14" />
          <path d="M 0,90 Q 80,40 160,90 Z" fill="#78350f" opacity="0.6" />
          {Array.from({ length: 18 }).map((_, i) => (
            <path
              key={i}
              d={`M ${12 + i * 8},85 Q ${14 + i * 8},48 ${10 + i * 8},18`}
              stroke={i % 2 === 0 ? '#d97706' : '#b45309'}
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <path d="M 0,18 Q 80,8 160,18" stroke="#ca8a04" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'geometric':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#0b0b14" />
          {/* Triangular origami facet panels */}
          <polygon points="10,80 30,25 50,80" fill="#a855f7" opacity="0.8" />
          <polygon points="30,25 50,80 70,25" fill="#7e22ce" opacity="0.9" />
          <polygon points="50,80 70,25 90,80" fill="#c084fc" opacity="0.75" />
          <polygon points="70,25 90,80 110,25" fill="#6b21a8" opacity="0.9" />
          <polygon points="90,80 110,25 130,80" fill="#9333ea" opacity="0.8" />
          <polygon points="110,25 130,80 150,25" fill="#c084fc" opacity="0.7" />
          <path d="M 0,25 Q 80,12 160,25" stroke="#e9d5ff" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'perforated':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#080e18" />
          <path d="M 5,85 Q 80,30 155,85 Z" fill="#0369a1" opacity="0.5" />
          {/* Array of stippled parametric apertures */}
          {Array.from({ length: 7 }).map((_, r) =>
            Array.from({ length: 14 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={15 + c * 10}
                cy={25 + r * 8}
                r={1.2 + ((c % 3) * 0.5)}
                fill="#38bdf8"
                opacity={0.85}
              />
            ))
          )}
          <path d="M 0,22 Q 80,10 160,22" stroke="#38bdf8" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'glass':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#061224" />
          <path d="M 0,85 Q 80,35 160,85 Z" fill="#0284c7" opacity="0.4" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1={12 + i * 12}
              y1="82"
              x2={14 + i * 12}
              y2="18"
              stroke="#60a5fa"
              strokeWidth="1.2"
              opacity="0.8"
            />
          ))}
          <path d="M 10,65 L 150,25" stroke="#93c5fd" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case 'steel':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#0a0f16" />
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i}>
              <line x1={15 + i * 18} y1="85" x2={15 + i * 18} y2="20" stroke="#64748b" strokeWidth="3" />
              <line x1={15 + i * 18} y1="85" x2={33 + i * 18} y2="20" stroke="#94a3b8" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#140f09" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={18 + i * 16}
              y="22"
              width="9"
              height="60"
              fill="#f59e0b"
              opacity="0.85"
              rx="1"
            />
          ))}
        </svg>
      );
  }
}

function FacadePanel() {
  const { config, updateConfig } = useStadiumStore();
  return (
    <div>
      <SectionHead
        title="Exterior Facade"
        subtitle="Step 2 of 8 · Select architectural cladding and skin structure"
      />
      <div className="px-4 space-y-3 pb-6">
        <div className="grid grid-cols-2 gap-2.5">
          {FACADE_STYLES.map((f) => {
            const isSelected = config.facade === f.value;
            return (
              <button
                key={f.value}
                onClick={() => updateConfig({ facade: f.value })}
                className={cn(
                  'group flex flex-col text-left rounded-lg border overflow-hidden transition-all relative',
                  isSelected
                    ? 'border-blue-500 bg-[#141b2a] ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/10'
                    : 'border-white/[0.08] bg-[#0f131d] hover:border-white/20 hover:bg-[#131824]'
                )}
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/[0.06] bg-[#070a12]">
                  <FacadeThumbnailSvg style={f.value} />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="p-2.5">
                  <div className="text-[12px] font-semibold text-white leading-tight">
                    {f.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {f.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RoofPanel() {
  const { config, updateConfig } = useStadiumStore();
  return (
    <div>
      <SectionHead
        title="Roof Structure"
        subtitle="Canopy and overhead structural system"
      />
      <div className="px-4 space-y-2">
        {ROOF_TYPES.map((r) => (
          <OptionCard
            key={r.value}
            selected={config.roof === r.value}
            onClick={() => updateConfig({ roof: r.value })}
          >
            <div className="text-xs font-medium text-white">{r.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{r.description}</div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

function SeatingPanel() {
  const { config, updateSeating } = useStadiumStore();
  return (
    <div>
      <SectionHead
        title="Seating Configuration"
        subtitle="Capacity, tier levels, and seating colors"
      />
      <div className="px-4 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-slate-400">Total capacity</Label>
            <span className="text-xs font-mono font-semibold text-white">
              {config.seating.capacity.toLocaleString()} seats
            </span>
          </div>
          <Slider
            min={30000}
            max={120000}
            step={5000}
            value={[config.seating.capacity]}
            onValueChange={([v]) => updateSeating({ capacity: v })}
            className="w-full my-1.5"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>30K</span>
            <span>120K</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-slate-400">Grandstand tiers</Label>
            <span className="text-xs font-mono font-semibold text-white">
              {config.seating.tiers} {config.seating.tiers === 1 ? 'tier' : 'tiers'}
            </span>
          </div>
          <Slider
            min={1}
            max={4}
            step={1}
            value={[config.seating.tiers]}
            onValueChange={([v]) => updateSeating({ tiers: v })}
            className="w-full my-1.5"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1</span>
            <span>4</span>
          </div>
        </div>

        <div>
          <Label className="text-xs text-slate-400 mb-2 block">
            Seat color
          </Label>
          <div className="flex items-center gap-2.5">
            <input
              type="color"
              value={config.seating.primaryColor}
              onChange={(e) => updateSeating({ primaryColor: e.target.value })}
              className="w-9 h-8 rounded border border-white/20 bg-transparent cursor-pointer shrink-0"
            />
            <span className="text-xs font-mono text-slate-300">
              {config.seating.primaryColor}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-white/[0.06]">
          {[
            { label: 'VIP hospitality seating', key: 'hasVip' as const },
            { label: 'Premium club seating', key: 'hasPremium' as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-xs text-slate-300">{label}</Label>
              <Switch
                checked={config.seating[key]}
                onCheckedChange={(v) => updateSeating({ [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InteriorPanel() {
  const { config, updateInterior } = useStadiumStore();
  const lightingOptions = ['standard', 'led', 'dramatic', 'natural'] as const;

  return (
    <div>
      <SectionHead
        title="Interior & Lighting"
        subtitle="Pitch design and floodlight system"
      />
      <div className="px-4 space-y-4">
        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Floodlight mode</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {lightingOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateInterior({ lighting: opt })}
                className={cn(
                  'py-2 px-2.5 rounded text-xs capitalize transition-colors text-left border',
                  config.interior.lighting === opt
                    ? 'bg-[#182030] border-blue-500/50 text-white font-medium'
                    : 'bg-[#10141e] border-white/[0.06] text-slate-400 hover:text-white'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-white/[0.06]">
          {[
            { label: 'Scoreboard screens', key: 'hasScoreboard' as const },
            { label: 'Player tunnel', key: 'hasPlayerTunnel' as const },
            { label: 'Hospitality lounges', key: 'hasHospitality' as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-xs text-slate-300">{label}</Label>
              <Switch
                checked={config.interior[key]}
                onCheckedChange={(v) => updateInterior({ [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EntryPanel() {
  const { config, updateEntry, updateLandscape } = useStadiumStore();
  const entranceOptions = ['arch', 'glass', 'tower', 'classic'] as const;
  const currentLandscape = config.landscape ?? {
    background: 'night',
    landscapeStyle: 'olympic',
    hasTrees: true,
    hasWaterFeatures: true,
    hasPlazaLighting: true,
    hasPedestrianAvenues: true,
    treeDensity: 'medium',
  };

  return (
    <div>
      <SectionHead
        title="Entry, Plaza & Landscape"
        subtitle="Sky atmosphere, surrounding landscape, water features & entries"
      />
      <div className="px-4 space-y-5 pb-6">
        {/* ── 1. Sky & Background Atmosphere ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-semibold text-white">Atmospheric Sky & Background</Label>
            <span className="text-[10px] font-mono text-blue-400 capitalize">
              {currentLandscape.background}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {BACKGROUND_PRESETS.map((preset) => {
              const isSelected = currentLandscape.background === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => updateLandscape({ background: preset.value })}
                  className={cn(
                    'w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group',
                    isSelected
                      ? 'bg-[#182030] border-blue-500/50 text-white shadow-sm'
                      : 'bg-[#10141e] border-white/[0.06] text-slate-400 hover:bg-[#151a28] hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{preset.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-white leading-tight">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-blue-400 shrink-0 ml-2">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Surrounding Landscape Style ── */}
        <div className="pt-3 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-semibold text-white">Surrounding Landscape Style</Label>
            <span className="text-[10px] font-mono text-indigo-400 capitalize">
              {currentLandscape.landscapeStyle}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {LANDSCAPE_STYLES.map((land) => {
              const isSelected = currentLandscape.landscapeStyle === land.value;
              return (
                <button
                  key={land.value}
                  onClick={() => updateLandscape({ landscapeStyle: land.value })}
                  className={cn(
                    'w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group',
                    isSelected
                      ? 'bg-[#182030] border-indigo-500/50 text-white shadow-sm'
                      : 'bg-[#10141e] border-white/[0.06] text-slate-400 hover:bg-[#151a28] hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{land.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-white leading-tight">
                        {land.label}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {land.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-indigo-400 shrink-0 ml-2">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Landscape Elements Toggles ── */}
        <div className="pt-3 border-t border-white/[0.08] space-y-3">
          <Label className="text-xs font-semibold text-white block">Landscape Features</Label>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300">Landscaping Trees</div>
              <div className="text-[10px] text-slate-500">Pines, cypresses, or date palms</div>
            </div>
            <Switch
              checked={currentLandscape.hasTrees}
              onCheckedChange={(v) => updateLandscape({ hasTrees: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300">Water Features</div>
              <div className="text-[10px] text-slate-500">Lagoon moat or urban fountains</div>
            </div>
            <Switch
              checked={currentLandscape.hasWaterFeatures}
              onCheckedChange={(v) => updateLandscape({ hasWaterFeatures: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300">Pedestrian Avenues</div>
              <div className="text-[10px] text-slate-500">4 grand approach boulevards</div>
            </div>
            <Switch
              checked={currentLandscape.hasPedestrianAvenues}
              onCheckedChange={(v) => updateLandscape({ hasPedestrianAvenues: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300">Plaza Ground Lighting</div>
              <div className="text-[10px] text-slate-500">Perimeter glowing bollards</div>
            </div>
            <Switch
              checked={currentLandscape.hasPlazaLighting}
              onCheckedChange={(v) => updateLandscape({ hasPlazaLighting: v })}
            />
          </div>
        </div>

        {/* ── 4. Main Entrance Architecture ── */}
        <div className="pt-3 border-t border-white/[0.08]">
          <Label className="text-xs font-semibold text-white mb-2 block">
            Stadium Entrance Architecture
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
            {entranceOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateEntry({ mainEntrance: opt })}
                className={cn(
                  'py-2 px-2.5 rounded text-xs capitalize transition-colors text-left border',
                  config.entry.mainEntrance === opt
                    ? 'bg-[#182030] border-blue-500/50 text-white font-medium'
                    : 'bg-[#10141e] border-white/[0.06] text-slate-400 hover:text-white'
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-3 mt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-300">VIP Gate Entrance</Label>
              <Switch
                checked={config.entry.hasVipEntrance}
                onCheckedChange={(v) => updateEntry({ hasVipEntrance: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-300">Subterranean Parking</Label>
              <Switch
                checked={config.entry.hasParking}
                onCheckedChange={(v) => updateEntry({ hasParking: v })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialsPanel() {
  const { config, updateMaterials } = useStadiumStore();
  const finishOptions = ['matte', 'metallic', 'glossy', 'textured'] as const;
  const materialOptions = ['steel', 'composite', 'concrete', 'wood'] as const;

  return (
    <div>
      <SectionHead
        title="Materials & Colors"
        subtitle="Structural surfaces and palette"
      />
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Primary', val: config.materials.primaryColor, key: 'primaryColor' as const },
            { label: 'Structure', val: config.materials.secondaryColor, key: 'secondaryColor' as const },
            { label: 'Accent', val: config.materials.accentColor, key: 'accentColor' as const },
          ].map(({ label, val, key }) => (
            <div key={key} className="p-2 rounded bg-[#10141e] border border-white/[0.06] text-center">
              <span className="text-[10px] text-slate-400 block mb-1">{label}</span>
              <input
                type="color"
                value={val}
                onChange={(e) => updateMaterials({ [key]: e.target.value })}
                className="w-full h-7 rounded border border-white/20 bg-transparent cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Surface finish</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {finishOptions.map((f) => (
              <button
                key={f}
                onClick={() => updateMaterials({ finish: f })}
                className={cn(
                  'py-1.5 px-2 rounded text-xs capitalize transition-colors border',
                  config.materials.finish === f
                    ? 'bg-[#182030] border-blue-500/50 text-white font-medium'
                    : 'bg-[#10141e] border-white/[0.06] text-slate-400 hover:text-white'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs text-slate-400 mb-2 block">Material substrate</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {materialOptions.map((m) => (
              <button
                key={m}
                onClick={() => updateMaterials({ material: m })}
                className={cn(
                  'py-1.5 px-2 rounded text-xs capitalize transition-colors border',
                  config.materials.material === m
                    ? 'bg-[#182030] border-blue-500/50 text-white font-medium'
                    : 'bg-[#10141e] border-white/[0.06] text-slate-400 hover:text-white'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddonsPanel() {
  const { config, updateAddons } = useStadiumStore();
  const addons: Array<{ label: string; key: keyof typeof config.addons; desc: string }> = [
    { label: 'Solar panel roof grid', key: 'hasSolarPanels', desc: 'Roof-mounted photovoltaic arrays' },
    { label: 'LED video screens', key: 'hasLedScreens', desc: 'Perimeter stadium display boards' },
    { label: 'Retractable roof motors', key: 'hasRetractableRoofMechanism', desc: 'Automated roof open/close actuators' },
    { label: 'Smart lighting system', key: 'hasSmartLighting', desc: 'Automated matchday floodlight control' },
    { label: 'Sustainability features', key: 'hasSustainabilityFeatures', desc: 'Rainwater harvesting and low-carbon design' },
    { label: 'Concourse food courts', key: 'hasFoodCourts', desc: 'Dining facilities' },
    { label: 'Public fan plaza', key: 'hasFanZone', desc: 'Outdoor spectator zone' },
  ];

  return (
    <div>
      <SectionHead
        title="Add-ons & Systems"
        subtitle="Sustainable and digital stadium components"
      />
      <div className="px-4 space-y-2">
        {addons.map(({ label, key, desc }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-3 p-2.5 rounded bg-[#10141e] border border-white/[0.06]"
          >
            <div>
              <div className="text-xs font-medium text-slate-200">{label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
            </div>
            <Switch
              checked={config.addons[key]}
              onCheckedChange={(v) => updateAddons({ [key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomizationPanel({ step }: { step: CustomizationStep }) {
  switch (step) {
    case 'stadium-type':
      return <StadiumTypePanel />;
    case 'facade':
      return <FacadePanel />;
    case 'roof':
      return <RoofPanel />;
    case 'seating':
      return <SeatingPanel />;
    case 'interior':
      return <InteriorPanel />;
    case 'entry':
      return <EntryPanel />;
    case 'materials':
      return <MaterialsPanel />;
    case 'addons':
      return <AddonsPanel />;
    default:
      return null;
  }
}
