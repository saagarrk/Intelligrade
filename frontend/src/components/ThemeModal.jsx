import { useState } from "react";
import {
  X,
  Palette,
  Check,
  Sun,
  Moon,
  RotateCcw,
  Eye,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { THEME_PRESETS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
const QUICK_ACCENT_SWATCHES = [
  { name: "Indigo", hex: "#6366F1", purpose: "Primary: Key actions and vibrant focal highlights" },
  { name: "Cyan", hex: "#06B6D4", purpose: "Secondary: Dynamic telemetry and analytics" },
  { name: "Emerald", hex: "#10B981", purpose: "Success: Verified grades, perfect rubrics & pass" },
  { name: "Violet", hex: "#8B5CF6", purpose: "Creative: AI insights and rubric benchmarks" },
  { name: "Amber", hex: "#F59E0B", purpose: "Accent: Percentiles, honors, and alerts" },
  { name: "Rose", hex: "#F43F5E", purpose: "Attention: Variance deductions and remarks" },
  { name: "Sky", hex: "#0EA5E9", purpose: "Interface: Focused inputs and interactive tabs" },
  { name: "Slate", hex: "#94A3B8", purpose: "Neutral: Crisp contrast and clean typography" }
];
export const ThemeModal = ({ isOpen, onClose }) => {
  const {
    currentThemeId,
    currentTheme,
    themeMode,
    setThemeId,
    toggleThemeMode,
    setCustomAccent,
    resetTheme
  } = useTheme();
  const [activeTab, setActiveTab] = useState("presets");
  const [customColorInput, setCustomColorInput] = useState(currentTheme.colors.accentPrimary);
  if (!isOpen) return null;
  return <div
    id="theme-picker-modal-backdrop"
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    onClick={onClose}
  >
      <div
    id="theme-picker-modal-content"
    className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    onClick={(e) => e.stopPropagation()}
  >
        {
    /* Modal Header */
  }
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div
    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
    style={{ backgroundColor: currentTheme.colors.accentPrimary }}
  >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Appearance & Theme Colors</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {currentTheme.name}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Personalize IntelliGrade color palette, dark/light contrast, and accent tones
              </p>
            </div>
          </div>
          
          <button
    id="close-theme-modal-btn"
    onClick={onClose}
    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
    title="Close theme picker"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Tab Switcher & Quick Mode Toggle */
  }
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/90">
          <div className="flex items-center gap-2">
            <button
    onClick={() => setActiveTab("presets")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "presets" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700" : "text-zinc-400 hover:text-zinc-200"}`}
  >
              Curated Palettes ({Object.keys(THEME_PRESETS).length})
            </button>
            <button
    onClick={() => setActiveTab("custom")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "custom" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700" : "text-zinc-400 hover:text-zinc-200"}`}
  >
              Custom Accent Color
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
    onClick={toggleThemeMode}
    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5"
    title="Toggle dark or high-contrast daylight mode"
  >
              {themeMode === "dark" ? <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch to Light</span>
                </> : <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Switch to Dark</span>
                </>}
            </button>

            <button
    onClick={resetTheme}
    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-zinc-700 transition"
    title="Reset to default theme"
  >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {
    /* Scrollable Content Body */
  }
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === "presets" ? <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Select Theme Palette
                </span>
                <span className="text-[11px] text-zinc-400">
                  Click any card to apply instantly across the platform
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {Object.values(THEME_PRESETS).map((preset) => {
    const isSelected = currentThemeId === preset.id;
    return <button
      key={preset.id}
      id={`theme-card-${preset.id}`}
      onClick={() => setThemeId(preset.id)}
      className={`relative p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between gap-3 group ${isSelected ? "bg-zinc-800/90 border-zinc-400 shadow-md ring-2" : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40"}`}
      style={{
        borderColor: isSelected ? preset.colors.accentPrimary : void 0,
        boxShadow: isSelected ? `0 0 16px rgba(${preset.colors.accentPrimaryRgb}, 0.25)` : void 0
      }}
    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            {preset.name}
                            {isSelected && <CheckCircle2
      className="w-4 h-4"
      style={{ color: preset.colors.accentPrimary }}
    />}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${preset.mode === "light" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                            {preset.mode === "light" ? "Light" : "Dark"}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {preset.tagline}
                        </p>
                      </div>

                      {
      /* Swatch Previews */
    }
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center gap-1.5">
                          {preset.previewColors.map((color, idx) => <div
      key={idx}
      className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
      style={{ backgroundColor: color }}
      title={`Sample token: ${color}`}
    />)}
                        </div>
                        <span
      className="text-[11px] font-semibold flex items-center gap-1"
      style={{ color: preset.colors.accentPrimary }}
    >
                          {isSelected ? "Active" : "Apply"}
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </button>;
  })}
              </div>
            </div> : (
    /* Custom Accent Color Tab */
    <div className="space-y-5">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Quick Accent Swatches
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Choose an accent color to override primary buttons, active tabs, and highlights
                  </p>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {QUICK_ACCENT_SWATCHES.map((swatch) => <button
      key={swatch.name}
      onClick={() => {
        setCustomColorInput(swatch.hex);
        setCustomAccent(swatch.hex);
      }}
      className="group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
      title={`Select ${swatch.name} (${swatch.hex})`}
    >
                      <div
      className="w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-transform group-hover:scale-110"
      style={{ backgroundColor: swatch.hex }}
    >
                        {currentTheme.colors.accentPrimary.toLowerCase() === swatch.hex.toLowerCase() && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium">{swatch.name}</span>
                    </button>)}
                </div>

                {
      /* Custom Color Picker Input */
    }
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label
      htmlFor="custom-accent-color-picker"
      className="relative cursor-pointer w-10 h-10 rounded-xl overflow-hidden border border-zinc-700 shadow-sm flex-shrink-0"
      style={{ backgroundColor: customColorInput }}
    >
                      <input
      id="custom-accent-color-picker"
      type="color"
      value={customColorInput}
      onChange={(e) => {
        setCustomColorInput(e.target.value);
        setCustomAccent(e.target.value);
      }}
      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
    />
                    </label>
                    <div>
                      <span className="text-xs font-bold text-white block">Custom Hex Code</span>
                      <span className="text-[11px] text-zinc-400 font-mono">{customColorInput}</span>
                    </div>
                  </div>

                  <button
      onClick={() => setCustomAccent(customColorInput)}
      className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition"
      style={{ backgroundColor: customColorInput }}
    >
                    Apply Custom Color
                  </button>
                </div>
              </div>
            </div>
  )}

          {
    /* Live Preview Card */
  }
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Live Component Preview
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Theme: {currentTheme.name}
              </span>
            </div>

            <div
    className="p-4 rounded-xl border transition-all"
    style={{
      backgroundColor: currentTheme.colors.bgCard,
      borderColor: currentTheme.colors.border
    }}
  >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
    className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
    style={{
      backgroundColor: `${currentTheme.colors.accentSecondary}25`,
      color: currentTheme.colors.accentSecondary,
      border: `1px solid ${currentTheme.colors.accentSecondary}50`
    }}
  >
                      CS-301 Midterm
                    </span>
                    <span className="text-xs font-semibold" style={{ color: currentTheme.colors.textPrimary }}>
                      Digital Image Processing & OCR
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: currentTheme.colors.textMuted }}>
                    {currentTheme.name} — Canvas ({currentTheme.colors.bgMain}), Cards ({currentTheme.colors.bgCard}), Accent ({currentTheme.colors.accentPrimary}).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div
    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
    style={{ backgroundColor: currentTheme.colors.accentSuccess }}
  >
                    Passed (92.4%)
                  </div>
                  <button
    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition shadow-sm"
    style={{ backgroundColor: currentTheme.colors.accentPrimary }}
  >
                    View Rubrics
                  </button>
                </div>
              </div>
            </div>

            {
    /* Official System Color Specification Table */
  }
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Active System Color Tokens
              </span>
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-1.5 px-3">Role</th>
                      <th className="py-1.5 px-3">Token</th>
                      <th className="py-1.5 px-3">Hex Value</th>
                      <th className="py-1.5 px-3">Swatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
                    <tr>
                      <td className="py-1.5 px-3 font-sans font-medium text-white">Primary Accent</td>
                      <td className="py-1.5 px-3 font-sans">accentPrimary</td>
                      <td className="py-1.5 px-3 font-semibold" style={{ color: currentTheme.colors.accentPrimary }}>
                        {currentTheme.colors.accentPrimary}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="w-4 h-4 rounded shadow-sm border border-white/20" style={{ backgroundColor: currentTheme.colors.accentPrimary }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans font-medium text-white">Secondary Accent</td>
                      <td className="py-1.5 px-3 font-sans">accentSecondary</td>
                      <td className="py-1.5 px-3 font-semibold" style={{ color: currentTheme.colors.accentSecondary }}>
                        {currentTheme.colors.accentSecondary}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="w-4 h-4 rounded shadow-sm border border-white/20" style={{ backgroundColor: currentTheme.colors.accentSecondary }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans font-medium text-white">Background Canvas</td>
                      <td className="py-1.5 px-3 font-sans">bgMain</td>
                      <td className="py-1.5 px-3 text-zinc-400">
                        {currentTheme.colors.bgMain}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="w-4 h-4 rounded shadow-sm border border-zinc-700" style={{ backgroundColor: currentTheme.colors.bgMain }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans font-medium text-white">Cards & Surfaces</td>
                      <td className="py-1.5 px-3 font-sans">bgCard</td>
                      <td className="py-1.5 px-3 text-zinc-300">
                        {currentTheme.colors.bgCard}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="w-4 h-4 rounded shadow-sm border border-zinc-700" style={{ backgroundColor: currentTheme.colors.bgCard }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans font-medium text-white">Main Text</td>
                      <td className="py-1.5 px-3 font-sans">textPrimary</td>
                      <td className="py-1.5 px-3 text-zinc-200">
                        {currentTheme.colors.textPrimary}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="w-4 h-4 rounded shadow-sm border border-white/20" style={{ backgroundColor: currentTheme.colors.textPrimary }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans font-medium text-white">Muted Text</td>
                      <td className="py-1.5 px-3 font-sans">textMuted</td>
                      <td className="py-1.5 px-3 text-zinc-400">
                        {currentTheme.colors.textMuted}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="w-4 h-4 rounded shadow-sm border border-white/20" style={{ backgroundColor: currentTheme.colors.textMuted }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans font-medium text-white">Success / Passed</td>
                      <td className="py-1.5 px-3 font-sans">accentSuccess</td>
                      <td className="py-1.5 px-3 font-semibold" style={{ color: currentTheme.colors.accentSuccess }}>
                        {currentTheme.colors.accentSuccess}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="w-4 h-4 rounded shadow-sm border border-white/20" style={{ backgroundColor: currentTheme.colors.accentSuccess }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans font-medium text-white">Failed / Deductions</td>
                      <td className="py-1.5 px-3 font-sans">accentDanger</td>
                      <td className="py-1.5 px-3 font-semibold" style={{ color: currentTheme.colors.accentDanger }}>
                        {currentTheme.colors.accentDanger}
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="w-4 h-4 rounded shadow-sm border border-white/20" style={{ backgroundColor: currentTheme.colors.accentDanger }} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {
    /* Modal Footer */
  }
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/60">
          <span className="text-xs text-zinc-500">
            Selected theme is stored permanently in your browser preferences.
          </span>
          <button
    id="btn-done-theme-modal"
    onClick={onClose}
    className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition"
    style={{ backgroundColor: currentTheme.colors.accentPrimary }}
  >
            Done & Keep Theme
          </button>
        </div>

      </div>
    </div>;
};
