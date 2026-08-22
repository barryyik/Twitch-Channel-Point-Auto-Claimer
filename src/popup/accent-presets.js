// src/popup/accent-presets.js
// Single source of truth for accent color presets

export const ACCENT_PRESETS = [
  { id: 'teal', swatch: '#099' },
  { id: 'green', swatch: '#16a34a' },
  { id: 'blue', swatch: '#2563eb' },
  { id: 'purple', swatch: '#7c3aed' },
  { id: 'orange', swatch: '#ea580c' },
  { id: 'pink', swatch: '#db2777' }
];

export const DEFAULT_ACCENT = 'teal';

const ACCENT_IDS = new Set(ACCENT_PRESETS.map((preset) => preset.id));

export function normalizeAccent(accentId) {
  return ACCENT_IDS.has(accentId) ? accentId : DEFAULT_ACCENT;
}
