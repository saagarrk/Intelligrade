/**
 * IntelliGrade Theme & Configuration Constants
 * Centralized design tokens and default parameters to eliminate hardcoded style values.
 */

/**
 * IntelliGrade Theme & Configuration Constants
 * Centralized design tokens, theme presets, and default parameters.
 */

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bgMain: string;          // Background: Soft Cream (#F7F8F5)
  bgHeader: string;        // Primary/Header: Academic Navy (#173B57)
  bgSurface: string;       // Cards: White (#FFFFFF)
  bgCard: string;          // Cards: White (#FFFFFF)
  bgInput: string;
  border: string;
  borderHover: string;
  borderFocus: string;
  textPrimary: string;     // Main Text: Charcoal (#263238)
  textSecondary: string;
  textMuted: string;       // Muted Text: Slate (#64748B)
  accentPrimary: string;   // Primary: Academic Navy (#173B57)
  accentPrimaryHover: string;
  accentPrimaryLight: string;
  accentPrimaryRgb: string;
  accentSecondary: string; // Secondary: Teal (#2A7F8E)
  accentSecondaryHover: string;
  accentSecondaryLight: string;
  accentSecondaryRgb: string;
  accentWarmGold: string;  // Accent: Warm Gold (#D9A441)
  headerNavy: string;      // Academic Navy (#173B57)
  accentSuccess: string;   // Success / Passed: Green (#3E7C59)
  accentWarning: string;   // Accent / Warning: Warm Gold (#D9A441)
  accentDanger: string;    // Failed: Muted Red (#B85450)
}

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  mode: ThemeMode;
  colors: ThemeColors;
  previewColors: [string, string, string, string]; // [bgMain, bgCard, accentPrimary, textPrimary]
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  dark_obsidian: {
    id: 'dark_obsidian',
    name: 'Obsidian Dark (Default)',
    tagline: 'Deep dark obsidian (#09090B) with zinc cards (#18181B) and electric indigo accents',
    mode: 'dark',
    colors: {
      bgMain: '#09090B',
      bgHeader: '#121215',
      bgSurface: '#18181B',
      bgCard: '#18181B',
      bgInput: '#141417',
      border: '#27272A',
      borderHover: '#3F3F46',
      borderFocus: '#6366F1',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      accentPrimary: '#4F46E5',
      accentPrimaryHover: '#4338CA',
      accentPrimaryLight: '#6366F1',
      accentPrimaryRgb: '79, 70, 229',
      accentSecondary: '#3B82F6',
      accentSecondaryHover: '#2563EB',
      accentSecondaryLight: '#60A5FA',
      accentSecondaryRgb: '59, 130, 246',
      accentWarmGold: '#F59E0B',
      headerNavy: '#121215',
      accentSuccess: '#10B981',
      accentWarning: '#F59E0B',
      accentDanger: '#F43F5E',
    },
    previewColors: ['#09090B', '#18181B', '#4F46E5', '#FAFAFA']
  },
  midnight_slate: {
    id: 'midnight_slate',
    name: 'Midnight Slate Dark',
    tagline: 'Deep navy-slate canvas (#0B0F19) with electric cyan accents',
    mode: 'dark',
    colors: {
      bgMain: '#0B0F19',
      bgHeader: '#0F172A',
      bgSurface: '#151E32',
      bgCard: '#151E32',
      bgInput: '#0E1626',
      border: '#1E293B',
      borderHover: '#334155',
      borderFocus: '#0EA5E9',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      accentPrimary: '#0EA5E9',
      accentPrimaryHover: '#0284C7',
      accentPrimaryLight: '#38BDF8',
      accentPrimaryRgb: '14, 165, 233',
      accentSecondary: '#6366F1',
      accentSecondaryHover: '#4F46E5',
      accentSecondaryLight: '#818CF8',
      accentSecondaryRgb: '99, 102, 241',
      accentWarmGold: '#F59E0B',
      headerNavy: '#0F172A',
      accentSuccess: '#10B981',
      accentWarning: '#F59E0B',
      accentDanger: '#F43F5E',
    },
    previewColors: ['#0B0F19', '#151E32', '#0EA5E9', '#F8FAFC']
  },
  emerald_dark: {
    id: 'emerald_dark',
    name: 'Emerald Matrix Dark',
    tagline: 'Deep forest dark canvas (#070D0A) with radiant emerald accents',
    mode: 'dark',
    colors: {
      bgMain: '#070D0A',
      bgHeader: '#0D1712',
      bgSurface: '#122019',
      bgCard: '#122019',
      bgInput: '#0A140F',
      border: '#1B3127',
      borderHover: '#2A4B3C',
      borderFocus: '#10B981',
      textPrimary: '#ECFDF5',
      textSecondary: '#A7F3D0',
      textMuted: '#6EE7B7',
      accentPrimary: '#10B981',
      accentPrimaryHover: '#059669',
      accentPrimaryLight: '#34D399',
      accentPrimaryRgb: '16, 185, 129',
      accentSecondary: '#14B8A6',
      accentSecondaryHover: '#0D9488',
      accentSecondaryLight: '#2DD4BF',
      accentSecondaryRgb: '20, 184, 166',
      accentWarmGold: '#F59E0B',
      headerNavy: '#0D1712',
      accentSuccess: '#10B981',
      accentWarning: '#F59E0B',
      accentDanger: '#F43F5E',
    },
    previewColors: ['#070D0A', '#122019', '#10B981', '#ECFDF5']
  },
  violet_dark: {
    id: 'violet_dark',
    name: 'Cyberpunk Violet Dark',
    tagline: 'Deep neon-violet dark theme (#090514) with electric purple accents',
    mode: 'dark',
    colors: {
      bgMain: '#090514',
      bgHeader: '#120A24',
      bgSurface: '#1A0F35',
      bgCard: '#1A0F35',
      bgInput: '#130B26',
      border: '#2E1A5E',
      borderHover: '#44278B',
      borderFocus: '#8B5CF6',
      textPrimary: '#FAF5FF',
      textSecondary: '#DDD6FE',
      textMuted: '#A78BFA',
      accentPrimary: '#8B5CF6',
      accentPrimaryHover: '#7C3AED',
      accentPrimaryLight: '#A78BFA',
      accentPrimaryRgb: '139, 92, 246',
      accentSecondary: '#EC4899',
      accentSecondaryHover: '#DB2777',
      accentSecondaryLight: '#F472B6',
      accentSecondaryRgb: '236, 72, 153',
      accentWarmGold: '#F59E0B',
      headerNavy: '#120A24',
      accentSuccess: '#10B981',
      accentWarning: '#F59E0B',
      accentDanger: '#F43F5E',
    },
    previewColors: ['#090514', '#1A0F35', '#8B5CF6', '#FAF5FF']
  }
};

export const DEFAULT_THEME_ID = 'dark_obsidian';

export const THEME = {
  colors: THEME_PRESETS[DEFAULT_THEME_ID].colors,
  typography: {
    fontSans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
  },
  animations: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
  },
  canvas: {
    defaultWidth: 800,
    defaultHeight: 700,
    paperColorRaw: '#09090B',
    paperColorAged: '#141417',
    gridLineColor: '#27272A',
    marginLineColor: '#F43F5E',
    inkColor: '#38BDF8',
  }
} as const;

export const DEFAULT_PREPROCESSING_CONFIG = {
  noiseReduction: true,
  noiseRadius: 2,
  styleNormalization: true,
  contrastStretch: 1.8,
  strokeBoost: 2,
  skewCorrection: true,
  skewAngle: -2.4,
  thinning: true,
  thinningIterations: 2,
  thresholdingType: 'otsu' as const,
  binarizationThreshold: 135,
};

export const API_ENDPOINTS = {
  HEALTH: '/api/v1/health',
  OCR_EXTRACT: '/api/v1/ocr/extract',
  MODEL_ANSWERS: '/api/v1/model-answers/generate',
  GRADE_EVALUATE: '/api/v1/grade/evaluate',
  NOTIFY_MOCK_EMAIL: '/api/v1/notifications/mock-email',
  EXAMS: '/api/v1/exams',
} as const;
