// ============================================================
// Stadium Designer – Core Type Definitions
// ============================================================

export type DesignMode = 'manual' | 'ai' | null;

export type StadiumType =
  | 'football'
  | 'multi-purpose'
  | 'olympic'
  | 'indoor';

export type FacadeStyle =
  | 'glass'
  | 'steel'
  | 'geometric'
  | 'traditional'
  | 'lattice'
  | 'slats'
  | 'perforated';

export type RoofType =
  | 'open'
  | 'retractable'
  | 'fixed'
  | 'transparent'
  | 'dome';

export type SurfaceFinish = 'matte' | 'glossy' | 'textured' | 'metallic';

export interface SeatingConfig {
  capacity: number;
  primaryColor: string;
  hasVip: boolean;
  hasPremium: boolean;
  tiers: number; // 1-4
}

export interface InteriorConfig {
  lighting: 'standard' | 'led' | 'dramatic' | 'natural';
  pitchDesign: 'classic' | 'modern' | 'heated' | 'artificial';
  hasScoreboard: boolean;
  hasPlayerTunnel: boolean;
  hasHospitality: boolean;
}

export type EnvironmentBackground = 'night' | 'sunset' | 'day' | 'cyberpunk' | 'desert';
export type LandscapeStyle = 'olympic' | 'park' | 'urban' | 'desert' | 'waterfront';

export interface LandscapeConfig {
  background: EnvironmentBackground;
  landscapeStyle: LandscapeStyle;
  hasTrees: boolean;
  hasWaterFeatures: boolean;
  hasPlazaLighting: boolean;
  hasPedestrianAvenues: boolean;
  treeDensity?: 'sparse' | 'medium' | 'dense';
}

export interface EntryConfig {
  mainEntrance: 'arch' | 'glass' | 'tower' | 'classic';
  hasVipEntrance: boolean;
  hasParking: boolean;
  hasLandscaping: boolean;
}

export interface MaterialsConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  finish: SurfaceFinish;
  material: 'concrete' | 'steel' | 'wood' | 'composite';
}

export interface AddOnsConfig {
  hasLedScreens: boolean;
  hasSolarPanels: boolean;
  hasSmartLighting: boolean;
  hasRetractableRoofMechanism: boolean;
  hasSustainabilityFeatures: boolean;
  hasFoodCourts: boolean;
  hasFanZone: boolean;
}

export interface StadiumConfig {
  id?: string;
  name: string;
  type: StadiumType;
  facade: FacadeStyle;
  roof: RoofType;
  seating: SeatingConfig;
  interior: InteriorConfig;
  entry: EntryConfig;
  landscape?: LandscapeConfig;
  materials: MaterialsConfig;
  addons: AddOnsConfig;
  aiPrompt?: string;
  aiGenerated?: boolean;
  previewImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CustomizationStep =
  | 'stadium-type'
  | 'facade'
  | 'roof'
  | 'seating'
  | 'interior'
  | 'entry'
  | 'materials'
  | 'addons';

export const CUSTOMIZATION_STEPS: CustomizationStep[] = [
  'stadium-type',
  'facade',
  'roof',
  'seating',
  'interior',
  'entry',
  'materials',
  'addons',
];

export type AppStep =
  | 'welcome'
  | 'choose-mode'
  | 'ai-input'
  | 'ai-result'
  | 'customize'
  | 'preview';

export interface AIGeneratedDesign {
  config: StadiumConfig;
  description: string;
  imageUrl?: string;
  reasoning?: string;
}

export interface SavedDesign {
  id: string;
  name: string;
  config: StadiumConfig;
  previewImage?: string;
  createdAt: string;
  updatedAt: string;
}

