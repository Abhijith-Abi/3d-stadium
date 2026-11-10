// ============================================================
// Zustand Store – Stadium Designer Global State
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StadiumConfig, AppStep, CustomizationStep, DesignMode, AIGeneratedDesign } from '@/types/stadium';
import { CUSTOMIZATION_STEPS } from '@/types/stadium';
import { DEFAULT_STADIUM_CONFIG } from '@/constants/stadium';
import { generateId } from '@/lib/utils';

interface HistoryEntry {
  config: StadiumConfig;
  timestamp: number;
}

interface StadiumStore {
  // ── App flow ─────────────────────────────────────────────
  appStep: AppStep;
  designMode: DesignMode;
  language: 'en' | 'ar';

  // ── Configuration ─────────────────────────────────────────
  config: StadiumConfig;
  customizationStep: CustomizationStep;
  aiInput: string;
  aiGeneratedDesign: AIGeneratedDesign | null;
  isAiLoading: boolean;
  aiError: string | null;

  // ── History (undo/redo) ───────────────────────────────────
  history: HistoryEntry[];
  historyIndex: number;

  // ── Actions ───────────────────────────────────────────────
  setAppStep: (step: AppStep) => void;
  setDesignMode: (mode: DesignMode) => void;
  setLanguage: (lang: 'en' | 'ar') => void;

  updateConfig: (partial: Partial<StadiumConfig>) => void;
  updateSeating: (partial: Partial<StadiumConfig['seating']>) => void;
  updateInterior: (partial: Partial<StadiumConfig['interior']>) => void;
  updateEntry: (partial: Partial<StadiumConfig['entry']>) => void;
  updateLandscape: (partial: Partial<NonNullable<StadiumConfig['landscape']>>) => void;
  updateMaterials: (partial: Partial<StadiumConfig['materials']>) => void;
  updateAddons: (partial: Partial<StadiumConfig['addons']>) => void;

  setCustomizationStep: (step: CustomizationStep) => void;
  nextCustomizationStep: () => void;
  prevCustomizationStep: () => void;

  setAiInput: (input: string) => void;
  setAiGeneratedDesign: (design: AIGeneratedDesign | null) => void;
  setAiLoading: (loading: boolean) => void;
  setAiError: (error: string | null) => void;
  applyAiDesign: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  reset: () => void;
  restoreDesign: (config: StadiumConfig) => void;
}

export const useStadiumStore = create<StadiumStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────
      appStep: 'welcome',
      designMode: null,
      language: 'en',
      config: { ...DEFAULT_STADIUM_CONFIG, id: generateId() },
      customizationStep: 'stadium-type',
      aiInput: '',
      aiGeneratedDesign: null,
      isAiLoading: false,
      aiError: null,
      history: [],
      historyIndex: -1,

      // ── App flow ───────────────────────────────────────────
      setAppStep: (step) => set({ appStep: step }),
      setDesignMode: (mode) => set({ designMode: mode }),
      setLanguage: (language) => set({ language }),

      // ── Config updates (always push to history) ────────────
      updateConfig: (partial) => {
        const { config, history, historyIndex } = get();
        const next = { ...config, ...partial };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ config, timestamp: Date.now() });
        set({ config: next, history: newHistory, historyIndex: newHistory.length - 1 });
      },

      updateSeating: (partial) => {
        const { config } = get();
        get().updateConfig({ seating: { ...config.seating, ...partial } });
      },
      updateInterior: (partial) => {
        const { config } = get();
        get().updateConfig({ interior: { ...config.interior, ...partial } });
      },
      updateEntry: (partial) => {
        const { config } = get();
        get().updateConfig({ entry: { ...config.entry, ...partial } });
      },
      updateLandscape: (partial) => {
        const { config } = get();
        const currentLandscape = config.landscape ?? {
          background: 'night',
          landscapeStyle: 'olympic',
          hasTrees: true,
          hasWaterFeatures: true,
          hasPlazaLighting: true,
          hasPedestrianAvenues: true,
          treeDensity: 'medium',
        };
        get().updateConfig({ landscape: { ...currentLandscape, ...partial } });
      },
      updateMaterials: (partial) => {
        const { config } = get();
        get().updateConfig({ materials: { ...config.materials, ...partial } });
      },
      updateAddons: (partial) => {
        const { config } = get();
        get().updateConfig({ addons: { ...config.addons, ...partial } });
      },

      // ── Customization step navigation ──────────────────────
      setCustomizationStep: (step) => set({ customizationStep: step }),
      nextCustomizationStep: () => {
        const { customizationStep } = get();
        const idx = CUSTOMIZATION_STEPS.indexOf(customizationStep);
        if (idx < CUSTOMIZATION_STEPS.length - 1) {
          set({ customizationStep: CUSTOMIZATION_STEPS[idx + 1] });
        } else {
          set({ appStep: 'preview' });
        }
      },
      prevCustomizationStep: () => {
        const { customizationStep } = get();
        const idx = CUSTOMIZATION_STEPS.indexOf(customizationStep);
        if (idx > 0) set({ customizationStep: CUSTOMIZATION_STEPS[idx - 1] });
      },

      // ── AI ─────────────────────────────────────────────────
      setAiInput: (aiInput) => set({ aiInput }),
      setAiGeneratedDesign: (aiGeneratedDesign) => set({ aiGeneratedDesign }),
      setAiLoading: (isAiLoading) => set({ isAiLoading }),
      setAiError: (aiError) => set({ aiError }),
      applyAiDesign: () => {
        const { aiGeneratedDesign } = get();
        if (aiGeneratedDesign) {
          get().updateConfig(aiGeneratedDesign.config);
          set({ appStep: 'customize' });
        }
      },

      // ── Undo / redo ────────────────────────────────────────
      undo: () => {
        const { history, historyIndex, config } = get();
        if (historyIndex < 0) return;
        const entry = history[historyIndex];
        // Push current to future (we do it differently – just move pointer)
        set({ config: entry.config, historyIndex: historyIndex - 1 });
      },
      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;
        const entry = history[historyIndex + 1];
        set({ config: entry.config, historyIndex: historyIndex + 1 });
      },
      canUndo: () => get().historyIndex >= 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // ── Reset ─────────────────────────────────────────────
      reset: () =>
        set({
          appStep: 'welcome',
          designMode: null,
          config: { ...DEFAULT_STADIUM_CONFIG, id: generateId() },
          customizationStep: 'stadium-type',
          aiInput: '',
          aiGeneratedDesign: null,
          history: [],
          historyIndex: -1,
          aiError: null,
        }),

      restoreDesign: (config) => {
        set({ config, history: [], historyIndex: -1, appStep: 'customize' });
      },
    }),
    {
      name: 'stadium-designer-store',
      partialize: (s) => ({
        config: s.config,
        language: s.language,
      }),
    }
  )
);
