/**
 * IntelliGrade Theme & Configuration Constants
 * Centralized design tokens and default parameters to eliminate hardcoded style values.
 */

export const THEME = {
  colors: {
    bgMain: '#09090b',
    bgSurface: '#18181b',
    bgCard: '#18181b',
    bgInput: '#09090b',
    border: '#27272a',
    borderHover: '#3f3f46',
    borderFocus: '#6366f1',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    accentPrimary: '#6366f1', // Indigo 500
    accentPrimaryHover: '#4f46e5', // Indigo 600
    accentSuccess: '#10b981', // Emerald 500
    accentWarning: '#f59e0b', // Amber 500
    accentDanger: '#f43f5e', // Rose 500
  },
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
    paperColorRaw: '#fcfbfa',
    paperColorAged: '#f3eee2',
    gridLineColor: '#e2e8f0',
    marginLineColor: '#fca5a5',
    inkColor: '#1e3a8a',
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
} as const;
