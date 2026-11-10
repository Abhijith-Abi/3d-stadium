// ============================================================
// API Service Layer (TanStack Query powered)
// ============================================================
import type { StadiumConfig, AIGeneratedDesign } from '@/types/stadium';
import { DEFAULT_STADIUM_CONFIG } from '@/constants/stadium';
import { generateId, sleep } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const IS_DEMO = !API_BASE || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ── Helpers ──────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── AI Generation ─────────────────────────────────────────────

function buildDemoConfig(prompt: string): AIGeneratedDesign {
  const lower = prompt.toLowerCase();
  const isEco = lower.includes('eco') || lower.includes('green') || lower.includes('sustainable');
  const isTraditional = lower.includes('cultural') || lower.includes('heritage') || lower.includes('traditional') || lower.includes('kerala');
  const isFuturistic = lower.includes('futuristic') || lower.includes('modern') || lower.includes('smart');

  // Background environment parsing
  const background = lower.includes('sunset') || lower.includes('golden')
    ? 'sunset'
    : lower.includes('day') || lower.includes('bright') || lower.includes('clear sky')
    ? 'day'
    : lower.includes('cyber') || lower.includes('neon')
    ? 'cyberpunk'
    : lower.includes('desert') || lower.includes('oasis') || lower.includes('dune')
    ? 'desert'
    : 'night';

  // Landscape style parsing
  const landscapeStyle = lower.includes('water') || lower.includes('ocean') || lower.includes('harbor') || lower.includes('lake')
    ? 'waterfront'
    : lower.includes('park') || lower.includes('botanical') || lower.includes('green') || lower.includes('trees')
    ? 'park'
    : lower.includes('urban') || lower.includes('city') || lower.includes('civic') || lower.includes('fountain')
    ? 'urban'
    : lower.includes('desert') || lower.includes('dunes')
    ? 'desert'
    : 'olympic';

  const capacityMatch = prompt.match(/(\d[\d,]*)\s*seat/i);
  const capacity = capacityMatch ? parseInt(capacityMatch[1].replace(/,/g, '')) : 60000;

  return {
    config: {
      ...DEFAULT_STADIUM_CONFIG,
      id: generateId(),
      name: isTraditional ? 'Cultural Heritage Arena' : isEco ? 'Eco-Sphere Grand Stadium' : isFuturistic ? 'Cyber-Axis Millennium Arena' : 'Premier Football Stadium',
      type: 'football',
      facade: isTraditional ? 'lattice' : isFuturistic ? 'lattice' : isEco ? 'slats' : 'geometric',
      roof: isEco ? 'transparent' : isFuturistic ? 'retractable' : 'retractable',
      seating: {
        ...DEFAULT_STADIUM_CONFIG.seating,
        capacity,
        hasVip: true,
        hasPremium: isFuturistic,
        tiers: capacity > 70000 ? 3 : 2,
      },
      landscape: {
        background,
        landscapeStyle,
        hasTrees: true,
        hasWaterFeatures: true,
        hasPlazaLighting: true,
        hasPedestrianAvenues: true,
        treeDensity: 'medium',
      },
      materials: {
        ...DEFAULT_STADIUM_CONFIG.materials,
        primaryColor: isEco ? '#166534' : isTraditional ? '#92400e' : '#1e3a8a',
        secondaryColor: isEco ? '#4ade80' : isTraditional ? '#d97706' : '#7c3aed',
        accentColor: '#06b6d4',
      },
      addons: {
        ...DEFAULT_STADIUM_CONFIG.addons,
        hasSolarPanels: isEco,
        hasSustainabilityFeatures: isEco,
        hasSmartLighting: isFuturistic,
        hasRetractableRoofMechanism: isFuturistic,
      },
      aiPrompt: prompt,
      aiGenerated: true,
    },
    description: `A ${isEco ? 'sustainable eco-friendly' : isFuturistic ? 'cutting-edge modern' : isTraditional ? 'culturally inspired' : 'contemporary'} football stadium concept generated from your description. The design features ${capacity.toLocaleString()} seats, a ${background} sky environment, ${landscapeStyle} landscaped plaza, and dynamic architectural lighting.`,
    reasoning: `Generated based on prompt analysis. ${IS_DEMO ? '(Demo mode – connect a backend for real AI generation)' : ''}`,
  };
}

export async function generateAiDesign(prompt: string): Promise<AIGeneratedDesign> {
  if (IS_DEMO) {
    await sleep(2200); // simulate latency
    return buildDemoConfig(prompt);
  }
  return apiFetch<AIGeneratedDesign>('/api/ai/generate/', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

// ── CRUD ──────────────────────────────────────────────────────

export async function saveDesign(config: StadiumConfig): Promise<{ id: string }> {
  if (IS_DEMO) {
    await sleep(800);
    // Persist to localStorage in demo mode
    const id = config.id ?? generateId();
    const saved = JSON.parse(localStorage.getItem('saved-designs') ?? '[]') as StadiumConfig[];
    const idx = saved.findIndex((d) => d.id === id);
    if (idx >= 0) saved[idx] = { ...config, id, updatedAt: new Date().toISOString() };
    else saved.push({ ...config, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    localStorage.setItem('saved-designs', JSON.stringify(saved));
    return { id };
  }
  return apiFetch('/api/designs/', { method: 'POST', body: JSON.stringify(config) });
}

export async function fetchSavedDesigns(): Promise<StadiumConfig[]> {
  if (IS_DEMO) {
    await sleep(400);
    return JSON.parse(localStorage.getItem('saved-designs') ?? '[]') as StadiumConfig[];
  }
  return apiFetch('/api/designs/');
}

export async function deleteDesign(id: string): Promise<void> {
  if (IS_DEMO) {
    const saved = JSON.parse(localStorage.getItem('saved-designs') ?? '[]') as StadiumConfig[];
    localStorage.setItem('saved-designs', JSON.stringify(saved.filter((d) => d.id !== id)));
    return;
  }
  await apiFetch(`/api/designs/${id}/`, { method: 'DELETE' });
}

