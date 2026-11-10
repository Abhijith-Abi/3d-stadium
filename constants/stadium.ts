// ============================================================
// Museum Stadium Designer – Enhanced Constants & Architectural Options
// ============================================================

import type {
  StadiumConfig,
  StadiumType,
  FacadeStyle,
  RoofType,
  CustomizationStep,
} from '@/types/stadium';

export { CUSTOMIZATION_STEPS } from '@/types/stadium';

export const DEFAULT_STADIUM_CONFIG: StadiumConfig = {
  name: 'Al-Rayyan Grand Pavilion Arena',
  type: 'football',
  facade: 'lattice',
  roof: 'retractable',
  seating: {
    capacity: 65000,
    primaryColor: '#6366f1',
    hasVip: true,
    hasPremium: true,
    tiers: 3,
  },
  interior: {
    lighting: 'dramatic',
    pitchDesign: 'modern',
    hasScoreboard: true,
    hasPlayerTunnel: true,
    hasHospitality: true,
  },
  entry: {
    mainEntrance: 'glass',
    hasVipEntrance: true,
    hasParking: true,
    hasLandscaping: true,
  },
  landscape: {
    background: 'night',
    landscapeStyle: 'olympic',
    hasTrees: true,
    hasWaterFeatures: true,
    hasPlazaLighting: true,
    hasPedestrianAvenues: true,
    treeDensity: 'medium',
  },
  materials: {
    primaryColor: '#1e1b4b',
    secondaryColor: '#6366f1',
    accentColor: '#38bdf8',
    finish: 'metallic',
    material: 'composite',
  },
  addons: {
    hasLedScreens: true,
    hasSolarPanels: true,
    hasSmartLighting: true,
    hasRetractableRoofMechanism: true,
    hasSustainabilityFeatures: true,
    hasFoodCourts: true,
    hasFanZone: true,
  },
};

export const STADIUM_TYPES: Array<{
  value: StadiumType;
  label: string;
  description: string;
  icon: string;
  museumNote: string;
}> = [
  {
    value: 'football',
    label: 'Cathedral of Football',
    description: 'Premier tier arena designed for FIFA tournament standards and acoustics',
    icon: '⚽',
    museumNote: 'Optimized sightline bowl with UEFA Elite acoustic geometry',
  },
  {
    value: 'multi-purpose',
    label: 'Civic Multi-Purpose Colosseum',
    description: 'Adaptive transforming ground for athletics, concerts, and global expos',
    icon: '🏟️',
    museumNote: 'Modular pitch elevation with retractable lower tier concourse',
  },
  {
    value: 'olympic',
    label: 'Olympic Monumental Stadium',
    description: 'Grand oval stadium featuring a 400m international athletics track & cauldron plaza',
    icon: '🏛️',
    museumNote: 'Panoramic 360-degree tiered bowl with grand ceremonial axis',
  },
  {
    value: 'indoor',
    label: 'Climate-Controlled Bio-Dome',
    description: 'Subterranean climate envelope with natural illuminated skylight architecture',
    icon: '🌐',
    museumNote: 'Micro-climate controlled environment with zero carbon footprint',
  },
];

export const FACADE_STYLES: Array<{
  value: FacadeStyle;
  label: string;
  description: string;
  colorHint: string;
  materialSpec: string;
}> = [
  {
    value: 'lattice',
    label: 'Architectural Lattice Diagrid',
    description: 'Interlocking diagonal white structural beams forming diamond aerodynamic apertures',
    colorHint: '#e2e8f0',
    materialSpec: 'Aerospace-grade white coated carbon steel diagrid frame with thermal break glazing',
  },
  {
    value: 'slats',
    label: 'Fluted Aerodynamic Louvers',
    description: 'Curved vertical fins with warm bronze and timber tones controlling natural airflow',
    colorHint: '#d97706',
    materialSpec: 'Extruded anodized bronze louvers with sustainably harvested timber composite',
  },
  {
    value: 'geometric',
    label: 'Parametric Origami Facets',
    description: 'Triangulated crystalline folded facets capturing and diffusing architectural sunlight',
    colorHint: '#9333ea',
    materialSpec: 'Folded titanium-zinc origami panels with integrated luminescent light guides',
  },
  {
    value: 'perforated',
    label: 'Perforated Kinetic Skin',
    description: 'Smooth aerodynamic monocoque skin with thousands of gradient light perforations',
    colorHint: '#38bdf8',
    materialSpec: 'Double-curved parametric perforated aluminium envelope with LED backlighting',
  },
  {
    value: 'glass',
    label: 'Crystalline Glazed Facade',
    description: 'Continuous structural panoramic glass envelope reflecting the sky and surroundings',
    colorHint: '#60a5fa',
    materialSpec: 'Low-E triple-laminated electrochromic smart glass curtain wall',
  },
  {
    value: 'steel',
    label: 'Industrial Spaceframe Truss',
    description: 'Raw high-tensile tubular steel exoskeleton conveying industrial structural power',
    colorHint: '#64748b',
    materialSpec: 'Heavy circular hollow section (CHS) weathering steel spaceframe network',
  },
  {
    value: 'traditional',
    label: 'Monumental Travertine Colonnade',
    description: 'Classical rhythmic stone porticos and archways evoking eternal civic monuments',
    colorHint: '#f59e0b',
    materialSpec: 'Honed Roman travertine limestone blocks with sculpted relief entablatures',
  },
];

export const ROOF_TYPES: Array<{
  value: RoofType;
  label: string;
  description: string;
  icon: string;
  engineeringSpec: string;
}> = [
  {
    value: 'retractable',
    label: 'Oculus Retractable Diaphragm',
    description: 'Motorized petal membrane opening like a camera shutter in 12 minutes',
    icon: '🔄',
    engineeringSpec: 'Dual-axis radial cable-stayed tensile PTFE membrane',
  },
  {
    value: 'transparent',
    label: 'ETFE Pneumatic Cushion Canopy',
    description: 'Ultra-light translucent air cushions allowing natural pitch turf growth',
    icon: '💎',
    engineeringSpec: 'Triple-layer UV-filtering pressurized fluoropolymer cushions',
  },
  {
    value: 'dome',
    label: 'Spherical Geodesic Dome',
    description: 'Grand monumental sphere enveloping spectators in an acoustic amphitheater',
    icon: '🔮',
    engineeringSpec: 'Triangulated space frame with integrated solar photovoltaic shingles',
  },
  {
    value: 'fixed',
    label: 'Cantilevered Halo Canopy',
    description: 'Floating gravity-defying roof suspended by perimeter pylons over all seats',
    icon: '🛡️',
    engineeringSpec: 'Continuous toroidal tension ring with 60-meter cantilever reach',
  },
  {
    value: 'open',
    label: 'Open-Air Arena Ocular',
    description: 'Open to the stars with dramatic night stadium skybeams and natural air circulation',
    icon: '✨',
    engineeringSpec: 'Natural passive stack ventilation with acoustic sound baffle ring',
  },
];

export const STEP_LABELS: Record<CustomizationStep, string> = {
  'stadium-type': 'Stadium Architecture',
  facade: 'Exterior Facade & Skin',
  roof: 'Roof Engineering',
  seating: 'Grandstand & Capacity',
  interior: 'Interior & Pitch Matrix',
  entry: 'Entry, Plaza & Landscape',
  materials: 'Materials & Tactile Finishes',
  addons: 'Smart & Sustainable Systems',
};

export const AI_QUICK_IDEAS = [
  'Modern & Futuristic',
  'Cultural Inspired',
  'Eco-Friendly',
  'Iconic',
  'Minimalist',
  'Traditional',
  'Golden Sunset Sky',
  'Waterfront Harbor Lagoon',
];

export const EXAMPLE_PROMPT =
  'e.g. A modern football stadium inspired by Kerala culture, 60,000 seats, retractable roof and eco-friendly design.';

export const TECH_STACK = [
  { label: 'Display & UI', items: ['Next.js 16 (App Router)', 'React 19', 'Tailwind CSS v4', 'Framer Motion'] },
  { label: '3D Simulation', items: ['Three.js WebGL', 'React Three Fiber', 'Drei Procedural Mesh'] },
  { label: 'Spatial Lighting', items: ['Spotlight Pedestals', 'Dynamic Shadows', 'PBR Materials'] },
  { label: 'Exhibition Engine', items: ['Zustand State with Undo/Redo', 'TanStack Query', 'Local Archiving'] },
  { label: 'AI Synthesis', items: ['Architectural Prompt Parser', 'Structural Config Generator'] },
  { label: 'Museum Hardware', items: ['4K Touchscreen Kiosk', '65″ Spatial Projector', 'Interactive Plinth'] },
];

export const MUSEUM_STATIONS = [
  {
    id: 'Exhibition Station 01',
    code: 'STN-ALPHA',
    title: 'Interactive Architectural Console',
    desc: 'High-resolution multi-touch capacitive kiosk where museum visitors select forms, materials, and structural modules.',
    badge: 'Curator Station',
  },
  {
    id: 'Exhibition Station 02',
    code: 'STN-BETA',
    title: 'Immersion Holographic Projection',
    desc: '65-inch ultra-high definition wall-mounted canvas rendering live architectural shadows, night illuminations, and pitch view.',
    badge: 'Main Observatory',
  },
  {
    id: 'Exhibition Station 03',
    code: 'STN-GAMMA',
    title: 'Visitor Archive & Design Print Station',
    desc: 'Takeaway terminal generating custom architectural blueprints, QR passes, and downloadable 3D specification portfolios.',
    badge: 'Visitor Hub',
  },
];

// ============================================================
// Environment Background & Landscape Constants
// ============================================================
import type { EnvironmentBackground, LandscapeStyle, LandscapeConfig } from '@/types/stadium';

export const DEFAULT_LANDSCAPE_CONFIG: LandscapeConfig = {
  background: 'night',
  landscapeStyle: 'olympic',
  hasTrees: true,
  hasWaterFeatures: true,
  hasPlazaLighting: true,
  hasPedestrianAvenues: true,
  treeDensity: 'medium',
};

export const BACKGROUND_PRESETS: Array<{
  value: EnvironmentBackground;
  label: string;
  description: string;
  icon: string;
  skyColor: string;
  horizonColor: string;
}> = [
  {
    value: 'night',
    label: 'Midnight Celestial',
    description: 'Deep navy night sky with twinkling stars and cool moonlight highlights',
    icon: '🌙',
    skyColor: '#050a16',
    horizonColor: '#091124',
  },
  {
    value: 'sunset',
    label: 'Golden Hour Sunset',
    description: 'Warm amber, violet, and rose twilight horizon with dramatic golden rim lighting',
    icon: '🌅',
    skyColor: '#1a0b2e',
    horizonColor: '#d97706',
  },
  {
    value: 'day',
    label: 'Daytime Clear Sky',
    description: 'Crisp bright architectural daylight with clean azure atmosphere',
    icon: '☀️',
    skyColor: '#0284c7',
    horizonColor: '#bae6fd',
  },
  {
    value: 'cyberpunk',
    label: 'Cyber Exhibition Stage',
    description: 'Futuristic exhibition environment with electric cyan and purple grid atmosphere',
    icon: '⚡',
    skyColor: '#08081a',
    horizonColor: '#3b0764',
  },
  {
    value: 'desert',
    label: 'Arabian Oasis Twilight',
    description: 'Warm terracotta desert twilight with soft dust haze and crystalline stars',
    icon: '🏜️',
    skyColor: '#1c1018',
    horizonColor: '#b45309',
  },
];

export const LANDSCAPE_STYLES: Array<{
  value: LandscapeStyle;
  label: string;
  description: string;
  icon: string;
  accent: string;
}> = [
  {
    value: 'olympic',
    label: 'Olympic Grand Plaza',
    description: 'Concentric granite stone pavers, 4 monumental pedestrian boulevards, lawn islands, and avenue trees',
    icon: '🏛️',
    accent: '#38bdf8',
  },
  {
    value: 'park',
    label: 'Botanical Eco-Park',
    description: 'Lush organic grass berms, perimeter floral parkways, dense cypress and pine tree groves',
    icon: '🌳',
    accent: '#22c55e',
  },
  {
    value: 'waterfront',
    label: 'Harbor Waterfront Lagoon',
    description: 'Surrounded by shimmering reflective ocean water lagoon and timber promenade piers',
    icon: '🌊',
    accent: '#06b6d4',
  },
  {
    value: 'urban',
    label: 'Civic Esplanade & Fountains',
    description: 'Metropolitan geometric pavers, perimeter water fountain jets, modern lampposts',
    icon: '🏙️',
    accent: '#a855f7',
  },
  {
    value: 'desert',
    label: 'Desert Oasis & Dunes',
    description: 'Warm undulating sand ripples, terracotta tile plazas, date palms, and amber lantern bollards',
    icon: '🌴',
    accent: '#f59e0b',
  },
];
