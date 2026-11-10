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
        'w-full text-left p-3 border transition-colors relative group',
        selected
          ? 'border-ink bg-paper-raised text-ink'
          : 'border-line bg-paper text-ink-muted hover:border-line-strong hover:text-ink-soft'
      )}
    >
      <div className="flex items-start gap-2.5">
        {colorHint && (
          <div
            className="w-3.5 h-3.5 shrink-0 mt-0.5 border border-line-strong"
            style={{ backgroundColor: colorHint }}
          />
        )}
        <div className="flex-1 pr-5">{children}</div>
        {selected && (
          <div className="absolute top-3 right-3 text-brass">
            <Check size={14} strokeWidth={2.5} />
          </div>
        )}
      </div>
    </button>
  );
}

function SectionHead({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <div className="px-5 py-4 border-b border-line mb-4">
      <div className="annotation-brass mb-1">{index}</div>
      <h3 className="text-base font-semibold text-ink tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-ink-muted mt-1">{subtitle}</p>}
    </div>
  );
}

function StadiumTypePanel() {
  const { config, updateConfig } = useStadiumStore();
  return (
    <div>
      <SectionHead index="01 / 08" title="Stadium Type" subtitle="Select the primary stadium layout" />
      <div className="px-5 space-y-2">
        {STADIUM_TYPES.map((t) => (
          <OptionCard
            key={t.value}
            selected={config.type === t.value}
            onClick={() => updateConfig({ type: t.value })}
          >
            <div className="text-xs font-medium text-ink">{t.label}</div>
            <div className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">{t.description}</div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

function FacadeThumbnailSvg({ style }: { style: string }) {
  const ink = '#9fb3cc';
  const brass = '#2dd4bf';
  const muted = '#4a5d75';
  switch (style) {
    case 'lattice':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#16212e" />
          <path d="M 0,90 Q 80,45 160,90 Z" fill="#2a3a4e" opacity="0.7" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`cw-${i}`}
              x1={i * 24 - 20}
              y1="90"
              x2={i * 24 + 40}
              y2="15"
              stroke={ink}
              strokeWidth="2.4"
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
              stroke={ink}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          ))}
          <path d="M 0,20 Q 80,8 160,20" stroke={brass} strokeWidth="2" fill="none" />
        </svg>
      );
    case 'slats':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#16212e" />
          <path d="M 0,90 Q 80,40 160,90 Z" fill="#2a3a4e" opacity="0.8" />
          {Array.from({ length: 18 }).map((_, i) => (
            <path
              key={i}
              d={`M ${12 + i * 8},85 Q ${14 + i * 8},48 ${10 + i * 8},18`}
              stroke={i % 2 === 0 ? ink : brass}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </svg>
      );
    case 'geometric':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#16212e" />
          <polygon points="10,80 30,25 50,80" fill="#2dd4bf" opacity="0.85" />
          <polygon points="30,25 50,80 70,25" fill="#14b8a6" opacity="0.9" />
          <polygon points="50,80 70,25 90,80" fill="#fb7185" opacity="0.75" />
          <polygon points="70,25 90,80 110,25" fill="#2dd4bf" opacity="0.9" />
          <polygon points="90,80 110,25 130,80" fill="#14b8a6" opacity="0.8" />
          <polygon points="110,25 130,80 150,25" fill="#fb7185" opacity="0.7" />
        </svg>
      );
    case 'perforated':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#16212e" />
          <path d="M 5,85 Q 80,30 155,85 Z" fill="#2a3a4e" opacity="0.9" />
          {Array.from({ length: 7 }).map((_, r) =>
            Array.from({ length: 14 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={15 + c * 10}
                cy={25 + r * 8}
                r={1.2 + ((c % 3) * 0.5)}
                fill={ink}
                opacity={0.8}
              />
            ))
          )}
        </svg>
      );
    case 'glass':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#1b2736" />
          <path d="M 0,85 Q 80,35 160,85 Z" fill="#4a5d75" opacity="0.7" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1={12 + i * 12}
              y1="82"
              x2={14 + i * 12}
              y2="18"
              stroke={ink}
              strokeWidth="1.1"
              opacity="0.7"
            />
          ))}
          <path d="M 10,65 L 150,25" stroke={brass} strokeWidth="1" opacity="0.8" />
        </svg>
      );
    case 'steel':
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#16212e" />
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i}>
              <line x1={15 + i * 18} y1="85" x2={15 + i * 18} y2="20" stroke={ink} strokeWidth="3" />
              <line x1={15 + i * 18} y1="85" x2={33 + i * 18} y2="20" stroke={muted} strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 160 90" className="w-full h-full object-cover">
          <rect width="160" height="90" fill="#16212e" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={18 + i * 16}
              y="22"
              width="9"
              height="60"
              fill={brass}
              opacity="0.9"
              rx="0.5"
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
        index="02 / 08"
        title="Exterior Facade"
        subtitle="Architectural cladding and skin structure"
      />
      <div className="px-5 space-y-3 pb-6">
        <div className="grid grid-cols-2 gap-2.5">
          {FACADE_STYLES.map((f) => {
            const isSelected = config.facade === f.value;
            return (
              <button
                key={f.value}
                onClick={() => updateConfig({ facade: f.value })}
                className={cn(
                  'group flex flex-col text-left border overflow-hidden transition-colors relative',
                  isSelected
                    ? 'border-ink bg-paper-raised'
                    : 'border-line bg-paper hover:border-line-strong'
                )}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line">
                  <FacadeThumbnailSvg style={f.value} />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brass flex items-center justify-center text-paper">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="text-[12px] font-semibold text-ink leading-tight">{f.label}</div>
                  <div className="text-[10px] text-ink-muted mt-1 line-clamp-2 leading-relaxed">
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
      <SectionHead index="03 / 08" title="Roof Structure" subtitle="Canopy and overhead structural system" />
      <div className="px-5 space-y-2">
        {ROOF_TYPES.map((r) => (
          <OptionCard
            key={r.value}
            selected={config.roof === r.value}
            onClick={() => updateConfig({ roof: r.value })}
          >
            <div className="text-xs font-medium text-ink">{r.label}</div>
            <div className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">{r.description}</div>
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
      <SectionHead index="04 / 08" title="Seating Configuration" subtitle="Capacity, tier levels and seat colors" />
      <div className="px-5 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-ink-muted">Total capacity</Label>
            <span className="text-xs font-mono font-semibold text-ink tabular-nums">
              {config.seating.capacity.toLocaleString()}
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
          <div className="flex justify-between text-[10px] text-ink-muted/70 font-mono">
            <span>30K</span>
            <span>120K</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-ink-muted">Grandstand tiers</Label>
            <span className="text-xs font-mono font-semibold text-ink tabular-nums">
              {config.seating.tiers}
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
          <div className="flex justify-between text-[10px] text-ink-muted/70 font-mono">
            <span>1</span>
            <span>4</span>
          </div>
        </div>

        <div>
          <Label className="text-xs text-ink-muted mb-2 block">Seat color</Label>
          <div className="flex items-center gap-2.5">
            <input
              type="color"
              value={config.seating.primaryColor}
              onChange={(e) => updateSeating({ primaryColor: e.target.value })}
              className="w-9 h-8 border border-line-strong bg-transparent cursor-pointer shrink-0 p-0.5"
            />
            <span className="text-xs font-mono text-ink-soft uppercase">
              {config.seating.primaryColor}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-line">
          {[
            { label: 'VIP hospitality seating', key: 'hasVip' as const },
            { label: 'Premium club seating', key: 'hasPremium' as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-xs text-ink-soft">{label}</Label>
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
      <SectionHead index="05 / 08" title="Interior & Lighting" subtitle="Pitch design and floodlight system" />
      <div className="px-5 space-y-5">
        <div>
          <Label className="text-xs text-ink-muted mb-2 block">Floodlight mode</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {lightingOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateInterior({ lighting: opt })}
                className={cn(
                  'py-2 px-2.5 text-xs capitalize transition-colors text-left border',
                  config.interior.lighting === opt
                    ? 'border-ink bg-paper-raised text-ink font-medium'
                    : 'border-line bg-paper text-ink-muted hover:border-line-strong hover:text-ink'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-line">
          {[
            { label: 'Scoreboard screens', key: 'hasScoreboard' as const },
            { label: 'Player tunnel', key: 'hasPlayerTunnel' as const },
            { label: 'Hospitality lounges', key: 'hasHospitality' as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-xs text-ink-soft">{label}</Label>
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
        index="06 / 08"
        title="Entry, Plaza & Landscape"
        subtitle="Sky atmosphere, surroundings, water features and entries"
      />
      <div className="px-5 space-y-5 pb-6">
        {/* 1 — Sky */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-semibold text-ink">Atmospheric sky</Label>
            <span className="annotation-brass normal-case tracking-normal">
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
                    'w-full text-left p-2.5 border transition-colors flex items-center justify-between group',
                    isSelected
                      ? 'border-ink bg-paper-raised text-ink'
                      : 'border-line bg-paper text-ink-muted hover:border-line-strong hover:text-ink'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 border border-line-strong shrink-0"
                      style={{ background: `linear-gradient(${preset.skyColor}, ${preset.horizonColor})` }}
                    />
                    <div>
                      <div className="text-xs font-medium text-ink leading-tight">{preset.label}</div>
                      <div className="text-[10px] text-ink-muted line-clamp-1 mt-0.5">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-brass shrink-0 ml-2">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 — Landscape style */}
        <div className="pt-4 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-semibold text-ink">Landscape style</Label>
            <span className="annotation-brass normal-case tracking-normal">
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
                    'w-full text-left p-2.5 border transition-colors flex items-center justify-between',
                    isSelected
                      ? 'border-ink bg-paper-raised text-ink'
                      : 'border-line bg-paper text-ink-muted hover:border-line-strong hover:text-ink'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 border border-line-strong shrink-0"
                      style={{ backgroundColor: land.accent }}
                    />
                    <div>
                      <div className="text-xs font-medium text-ink leading-tight">{land.label}</div>
                      <div className="text-[10px] text-ink-muted line-clamp-1 mt-0.5">
                        {land.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-brass shrink-0 ml-2">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 — Feature toggles */}
        <div className="pt-4 border-t border-line space-y-3">
          <Label className="text-xs font-semibold text-ink block">Landscape features</Label>

          {[
            { title: 'Landscaping trees', desc: 'Pines, cypresses or date palms', key: 'hasTrees' as const },
            { title: 'Water features', desc: 'Lagoon moat or urban fountains', key: 'hasWaterFeatures' as const },
            { title: 'Pedestrian avenues', desc: '4 grand approach boulevards', key: 'hasPedestrianAvenues' as const },
            { title: 'Plaza ground lighting', desc: 'Perimeter bollard lights', key: 'hasPlazaLighting' as const },
          ].map(({ title, desc, key }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="text-xs text-ink-soft">{title}</div>
                <div className="text-[10px] text-ink-muted">{desc}</div>
              </div>
              <Switch
                checked={currentLandscape[key]}
                onCheckedChange={(v) => updateLandscape({ [key]: v })}
              />
            </div>
          ))}
        </div>

        {/* 4 — Entrance architecture */}
        <div className="pt-4 border-t border-line">
          <Label className="text-xs font-semibold text-ink mb-2 block">
            Stadium entrance architecture
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
            {entranceOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateEntry({ mainEntrance: opt })}
                className={cn(
                  'py-2 px-2.5 text-xs capitalize transition-colors text-left border',
                  config.entry.mainEntrance === opt
                    ? 'border-ink bg-paper-raised text-ink font-medium'
                    : 'border-line bg-paper text-ink-muted hover:border-line-strong hover:text-ink'
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-4 mt-4 border-t border-line">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-ink-soft">VIP gate entrance</Label>
              <Switch
                checked={config.entry.hasVipEntrance}
                onCheckedChange={(v) => updateEntry({ hasVipEntrance: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-ink-soft">Subterranean parking</Label>
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
      <SectionHead index="07 / 08" title="Materials & Colors" subtitle="Structural surfaces and palette" />
      <div className="px-5 space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Primary', val: config.materials.primaryColor, key: 'primaryColor' as const },
            { label: 'Structure', val: config.materials.secondaryColor, key: 'secondaryColor' as const },
            { label: 'Accent', val: config.materials.accentColor, key: 'accentColor' as const },
          ].map(({ label, val, key }) => (
            <div key={key} className="p-2 border border-line bg-paper text-center">
              <span className="annotation block mb-1.5">{label}</span>
              <input
                type="color"
                value={val}
                onChange={(e) => updateMaterials({ [key]: e.target.value })}
                className="w-full h-7 border border-line-strong bg-transparent cursor-pointer p-0.5"
              />
            </div>
          ))}
        </div>

        <div>
          <Label className="text-xs text-ink-muted mb-2 block">Surface finish</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {finishOptions.map((f) => (
              <button
                key={f}
                onClick={() => updateMaterials({ finish: f })}
                className={cn(
                  'py-1.5 px-2 text-xs capitalize transition-colors border',
                  config.materials.finish === f
                    ? 'border-ink bg-paper-raised text-ink font-medium'
                    : 'border-line bg-paper text-ink-muted hover:border-line-strong hover:text-ink'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs text-ink-muted mb-2 block">Material substrate</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {materialOptions.map((m) => (
              <button
                key={m}
                onClick={() => updateMaterials({ material: m })}
                className={cn(
                  'py-1.5 px-2 text-xs capitalize transition-colors border',
                  config.materials.material === m
                    ? 'border-ink bg-paper-raised text-ink font-medium'
                    : 'border-line bg-paper text-ink-muted hover:border-line-strong hover:text-ink'
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
    { label: 'LED video screens', key: 'hasLedScreens', desc: 'Perimeter display boards' },
    { label: 'Retractable roof motors', key: 'hasRetractableRoofMechanism', desc: 'Automated roof actuators' },
    { label: 'Smart lighting system', key: 'hasSmartLighting', desc: 'Matchday floodlight control' },
    { label: 'Sustainability features', key: 'hasSustainabilityFeatures', desc: 'Rainwater harvesting, low-carbon design' },
    { label: 'Concourse food courts', key: 'hasFoodCourts', desc: 'Dining facilities' },
    { label: 'Public fan plaza', key: 'hasFanZone', desc: 'Outdoor spectator zone' },
  ];

  return (
    <div>
      <SectionHead index="08 / 08" title="Add-ons & Systems" subtitle="Sustainable and digital stadium components" />
      <div className="px-5 space-y-2">
        {addons.map(({ label, key, desc }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-3 p-2.5 border border-line bg-paper"
          >
            <div>
              <div className="text-xs font-medium text-ink-soft">{label}</div>
              <div className="text-[11px] text-ink-muted mt-0.5">{desc}</div>
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
