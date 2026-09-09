import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME_PRESETS, DEFAULT_THEME_ID, ThemePreset, ThemeColors, ThemeMode } from '../constants/theme';
import { showSweetToast } from '../utils/sweetAlert';

interface ThemeContextType {
  currentThemeId: string;
  currentTheme: ThemePreset;
  themeMode: ThemeMode;
  setThemeId: (themeId: string) => void;
  toggleThemeMode: () => void;
  setCustomAccent: (accentHex: string) => void;
  resetTheme: () => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'intelligrade_theme_preset_v6';
const CUSTOM_ACCENT_KEY = 'intelligrade_theme_custom_accent_v6';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentThemeId, setCurrentThemeIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEME_PRESETS[saved]) return saved;
    } catch {
      // fallback
    }
    return DEFAULT_THEME_ID;
  });

  const [customAccent, setCustomAccentState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOM_ACCENT_KEY);
    } catch {
      return null;
    }
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  const basePreset = THEME_PRESETS[currentThemeId] || THEME_PRESETS[DEFAULT_THEME_ID];
  
  // Merge custom accent if provided
  const currentTheme: ThemePreset = React.useMemo(() => {
    if (!customAccent) return basePreset;
    return {
      ...basePreset,
      colors: {
        ...basePreset.colors,
        accentPrimary: customAccent,
        accentPrimaryHover: customAccent,
        accentPrimaryLight: customAccent,
        borderFocus: customAccent,
      }
    };
  }, [basePreset, customAccent]);

  const themeMode = currentTheme.mode;

  // Apply theme dynamically to document and inject CSS overrides
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    // 1. Set data attributes
    root.setAttribute('data-theme', currentTheme.id);
    root.setAttribute('data-theme-mode', themeMode);

    // 2. Set root CSS custom properties
    root.style.setProperty('--theme-bg-main', colors.bgMain);
    root.style.setProperty('--theme-bg-header', colors.bgHeader);
    root.style.setProperty('--theme-bg-surface', colors.bgSurface);
    root.style.setProperty('--theme-bg-card', colors.bgCard);
    root.style.setProperty('--theme-bg-input', colors.bgInput);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-border-hover', colors.borderHover);
    root.style.setProperty('--theme-border-focus', colors.borderFocus);
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-primary', colors.accentPrimary);
    root.style.setProperty('--theme-primary-hover', colors.accentPrimaryHover);
    root.style.setProperty('--theme-primary-light', colors.accentPrimaryLight);
    root.style.setProperty('--theme-primary-rgb', colors.accentPrimaryRgb);
    root.style.setProperty('--theme-secondary', colors.accentSecondary);
    root.style.setProperty('--theme-header-navy', colors.headerNavy);
    root.style.setProperty('--theme-accent-success', colors.accentSuccess);
    root.style.setProperty('--theme-accent-warning', colors.accentWarning);
    root.style.setProperty('--theme-accent-danger', colors.accentDanger);

    // 3. Inject / Update runtime CSS stylesheet to seamlessly theme all existing classes
    let styleTag = document.getElementById('intelligrade-theme-engine') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'intelligrade-theme-engine';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --color-theme-primary: ${colors.accentPrimary};
        --color-theme-header: ${colors.bgHeader};
        --color-theme-secondary: ${colors.accentSecondary};
        --color-theme-gold: ${colors.accentWarmGold};
        --color-theme-bg: ${colors.bgMain};
        --color-theme-card: ${colors.bgCard};
        --color-theme-border: ${colors.border};
        --color-theme-text: ${colors.textPrimary};
        --color-theme-muted: ${colors.textMuted};
        --color-theme-success: ${colors.accentSuccess};
        --color-theme-failed: ${colors.accentDanger};
      }
      
      /* Dark Canvas Background & Text */
      body, html {
        background-color: ${colors.bgMain} !important;
        color: ${colors.textPrimary} !important;
        transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
      }
      
      /* Primary Interactive Accent Elements */
      .bg-indigo-600,
      .bg-blue-600,
      .theme-btn-primary {
        background-color: ${colors.accentPrimary} !important;
        color: #ffffff !important;
      }

      .hover\\:bg-indigo-500:hover,
      .hover\\:bg-indigo-600:hover,
      .hover\\:bg-blue-500:hover,
      .hover\\:bg-blue-700:hover,
      .theme-btn-primary:hover {
        background-color: ${colors.accentPrimaryHover} !important;
        color: #ffffff !important;
      }

      /* Secondary Interactive Elements */
      .theme-btn-secondary,
      .bg-indigo-700 {
        background-color: ${colors.accentSecondary} !important;
        color: #ffffff !important;
      }
      .theme-btn-secondary:hover,
      .hover\\:bg-indigo-800:hover {
        background-color: ${colors.accentSecondaryHover} !important;
        color: #ffffff !important;
      }

      /* Selection Highlight */
      ::selection {
        background-color: ${colors.accentPrimary} !important;
        color: #ffffff !important;
      }

      /* Focus Rings */
      *:focus-visible {
        outline-color: ${colors.borderFocus} !important;
      }

      /* Dark Sticky Header */
      header.sticky, header {
        background-color: ${colors.bgHeader} !important;
        border-color: ${colors.border} !important;
        color: #ffffff !important;
      }

      header h1, header h2, header h3 {
        color: #ffffff !important;
      }

      header p.text-slate-500, header .text-slate-400, header .text-zinc-400 {
        color: #94A3B8 !important;
      }

      header select, header input {
        background-color: ${colors.bgInput} !important;
        color: ${colors.textPrimary} !important;
        border-color: ${colors.border} !important;
      }

      /* Sub-bar (Pipeline navigation tabs) in Dark Mode */
      header div.bg-\\[\\#18181b\\],
      header [class*="bg-[#18181b]"],
      header [class*="bg-[#101014]"],
      header [class*="bg-[#0c0c0e]"] {
        background-color: #0c0c0e !important;
        border-color: ${colors.border} !important;
      }

      /* Cards & Surfaces in Dark Mode */
      .bg-zinc-900,
      .bg-zinc-900\\/90,
      .bg-zinc-900\\/80,
      .bg-zinc-900\\/50,
      .bg-slate-900,
      [class*="bg-[#18181b]"]:not(header *),
      .theme-card,
      [id$="-modal-content"],
      [role="dialog"] {
        background-color: ${colors.bgCard} !important;
        border-color: ${colors.border} !important;
      }

      .bg-zinc-950,
      .bg-slate-950,
      .bg-zinc-950\\/60,
      .bg-zinc-950\\/50,
      [class*="bg-[#09090b]"]:not(header *),
      .theme-bg-main {
        background-color: ${colors.bgMain} !important;
      }

      .border-zinc-800,
      .border-zinc-800\\/60,
      .border-zinc-800\\/80,
      .border-zinc-700,
      .border-zinc-700\\/80,
      .border-slate-800,
      [class*="border-[#27272a]"]:not(header *) {
        border-color: ${colors.border} !important;
      }

      /* Form Inputs & Controls in Dark Mode */
      main input, main select, main textarea,
      [id$="-modal-content"] input, [id$="-modal-content"] select, [id$="-modal-content"] textarea {
        background-color: ${colors.bgInput} !important;
        color: ${colors.textPrimary} !important;
        border-color: ${colors.border} !important;
      }

      main input::placeholder, main textarea::placeholder {
        color: ${colors.textMuted} !important;
      }

      /* Footer Status Bar in Dark Mode */
      footer[class*="bg-[#18181b]"], footer {
        background-color: ${colors.bgCard} !important;
        border-color: ${colors.border} !important;
        color: ${colors.textMuted} !important;
      }
      footer strong, footer .text-zinc-200, footer .text-\\[#fafafa\\] {
        color: ${colors.textPrimary} !important;
      }
    `;

  }, [currentTheme, themeMode]);

  const setThemeId = (newThemeId: string) => {
    if (!THEME_PRESETS[newThemeId]) return;
    setCurrentThemeIdState(newThemeId);
    setCustomAccentState(null);
    try {
      localStorage.setItem(STORAGE_KEY, newThemeId);
      localStorage.removeItem(CUSTOM_ACCENT_KEY);
    } catch {
      // ignore
    }
    showSweetToast(`Theme changed to "${THEME_PRESETS[newThemeId].name}"`, 'success');
  };

  const toggleThemeMode = () => {
    const nextThemeId = currentThemeId === 'dark_obsidian' ? 'midnight_slate' : 'dark_obsidian';
    setThemeId(nextThemeId);
  };

  const setCustomAccent = (accentHex: string) => {
    setCustomAccentState(accentHex);
    try {
      localStorage.setItem(CUSTOM_ACCENT_KEY, accentHex);
    } catch {
      // ignore
    }
    showSweetToast(`Custom accent color applied (${accentHex})`, 'success');
  };

  const resetTheme = () => {
    setThemeId(DEFAULT_THEME_ID);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        themeMode,
        setThemeId,
        toggleThemeMode,
        setCustomAccent,
        resetTheme,
        isThemeModalOpen,
        setIsThemeModalOpen
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
