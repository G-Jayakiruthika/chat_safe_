import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, MousePointer, Eye, Check, Sliders, Globe,
  Type, Sparkles, Moon, Sun, X, RotateCcw
} from 'lucide-react';
import { INDIAN_LANGUAGES } from '../lib/languages.js';

export const THEME_PRESETS = [
  { id: 'ocean', name: 'Ocean Cyan', hex: '#22d3ee', a2: '#34d399', darkBg: '7 11 20', desc: 'Chat_Safe Classic' },
  { id: 'violet', name: 'Violet Gemini', hex: '#8b5cff', a2: '#ff3ea5', darkBg: '12 8 26', desc: 'SkillForge AI' },
  { id: 'sunset', name: 'Sunset Kavach', hex: '#fb923c', a2: '#f43f5e', darkBg: '22 10 10', desc: 'Threat Watch' },
  { id: 'forest', name: 'Emerald Shield', hex: '#34d399', a2: '#22d3ee', darkBg: '6 18 14', desc: 'Safe Sentinel' },
  { id: 'rose', name: 'Neon Rose', hex: '#f43f5e', a2: '#fbbf24', darkBg: '20 6 15', desc: 'High Voltage' },
  { id: 'slate', name: 'Slate Stealth', hex: '#94a3b8', a2: '#38bdf8', darkBg: '10 12 16', desc: 'Minimalist Dark' },
];

export const CURSOR_MODES = [
  { id: 'orbit', label: '◎ Orbit Ring', desc: 'Glowing dot + lagging expansion ring' },
  { id: 'comet', label: '☄ Comet Trail', desc: 'Glowing particle tail behind pointer' },
  { id: 'spark', label: '✺ Spark Burst', desc: 'Electric sparks on movement & clicks' },
  { id: 'system', label: '↖ System Default', desc: 'Standard operating system cursor' },
];

export default function AppearanceModal({ open, onClose, currentLang, onLangChange }) {
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('ts_palette') || 'ocean');
  const [minimalMode, setMinimalMode] = useState(() => localStorage.getItem('ts_minimal') === '1');
  const [cursorStyle, setCursorStyle] = useState(() => localStorage.getItem('ts_cursor') || 'orbit');
  const [fontScale, setFontScale] = useState(() => localStorage.getItem('ts_font_scale') || '1');
  const [langSearch, setLangSearch] = useState('');

  // Apply theme preset
  const applyTheme = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem('ts_palette', themeId);
    document.documentElement.setAttribute('data-palette', themeId);
    window.dispatchEvent(new Event('ts_appearance_changed'));
  };

  // Apply minimal mode
  const toggleMinimal = (isMin) => {
    setMinimalMode(isMin);
    localStorage.setItem('ts_minimal', isMin ? '1' : '0');
    if (isMin) {
      document.documentElement.classList.add('minimal-mode');
    } else {
      document.documentElement.classList.remove('minimal-mode');
    }
    window.dispatchEvent(new Event('ts_appearance_changed'));
  };

  // Apply cursor mode
  const applyCursor = (style) => {
    setCursorStyle(style);
    localStorage.setItem('ts_cursor', style);
    window.dispatchEvent(new CustomEvent('ts_cursor_changed', { detail: style }));
  };

  // Apply font scale
  const applyFontScale = (scale) => {
    setFontScale(scale);
    localStorage.setItem('ts_font_scale', scale);
    document.documentElement.style.fontSize = `${scale * 16}px`;
  };

  // Reset to default
  const resetDefaults = () => {
    applyTheme('ocean');
    toggleMinimal(false);
    applyCursor('orbit');
    applyFontScale('1');
    onLangChange?.('en');
  };

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.native.toLowerCase().includes(langSearch.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-fg/20 bg-bg p-6 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-fg/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black">Appearance & Engine Customizer</h2>
              <p className="text-xs text-muted">SkillForge & Chat_Safe Personalization Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-fg/10 text-muted hover:text-fg"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. PALETTE SWITCHER */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Palette size={16} className="text-accent" />
              <span>Color Themes</span>
            </h3>
            <span className="text-[11px] text-muted">Dual Accent Gradients</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {THEME_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyTheme(p.id)}
                className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition ${
                  activeTheme === p.id
                    ? 'border-accent bg-accent/15 shadow-md'
                    : 'border-fg/15 bg-fg/5 hover:border-fg/30'
                }`}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-black shrink-0 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${p.hex}, ${p.a2})` }}
                >
                  {activeTheme === p.id && <Check size={14} className="stroke-[3]" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{p.name}</p>
                  <p className="text-[10px] text-muted truncate">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 2. MINIMALIST VS IMMERSIVE MODE */}
        <section className="space-y-3 border-t border-fg/10 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Eye size={16} className="text-accent" />
              <span>Display & Rendering Mode</span>
            </h3>
            <span className="text-[11px] text-accent font-semibold">Low-Bandwidth Friendly</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toggleMinimal(false)}
              className={`rounded-2xl border p-3.5 text-left transition ${
                !minimalMode
                  ? 'border-accent bg-accent/15 shadow-md'
                  : 'border-fg/15 bg-fg/5 text-muted hover:border-fg/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fg">🚀 Immersive Mode</span>
                {!minimalMode && <Check size={14} className="text-accent" />}
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Full 3D avatars, animated aurora canvas, glow cursor trails & particle effects.
              </p>
            </button>

            <button
              onClick={() => toggleMinimal(true)}
              className={`rounded-2xl border p-3.5 text-left transition ${
                minimalMode
                  ? 'border-accent bg-accent/15 shadow-md'
                  : 'border-fg/15 bg-fg/5 text-muted hover:border-fg/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fg">🧊 Minimalist Mode</span>
                {minimalMode && <Check size={14} className="text-accent" />}
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Clean, flat, high-contrast, distraction-free & super-fast for low-end devices.
              </p>
            </button>
          </div>
        </section>

        {/* 3. CUSTOM CURSOR PICKER */}
        <section className="space-y-3 border-t border-fg/10 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <MousePointer size={16} className="text-accent" />
              <span>Interactive Cursor Effects</span>
            </h3>
            <span className="text-[11px] text-muted">Desktop Precision</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {CURSOR_MODES.map((cm) => (
              <button
                key={cm.id}
                onClick={() => applyCursor(cm.id)}
                className={`rounded-xl border p-2.5 text-left transition text-xs font-semibold ${
                  cursorStyle === cm.id
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-fg/15 bg-fg/5 text-muted hover:border-fg/30'
                }`}
              >
                <p className="font-bold">{cm.label}</p>
                <p className="text-[10px] text-muted mt-0.5 line-clamp-1">{cm.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 4. 23 INDIAN LANGUAGES SELECTOR */}
        <section className="space-y-3 border-t border-fg/10 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Globe size={16} className="text-accent" />
              <span>Languages of Bharat (Eighth Schedule - 23 Languages)</span>
            </h3>
            <span className="text-[11px] text-accent font-bold">Active: {currentLang?.toUpperCase()}</span>
          </div>

          <input
            type="text"
            placeholder="Search language (e.g. தமிழ், Telugu, বাংলা, Urdu)..."
            value={langSearch}
            onChange={(e) => setLangSearch(e.target.value)}
            className="w-full rounded-xl border border-fg/20 bg-fg/5 px-3 py-2 text-xs text-fg outline-none focus:border-accent"
          />

          <div className="max-h-36 overflow-y-auto grid grid-cols-2 gap-1.5 sm:grid-cols-3 pr-1">
            {filteredLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => onLangChange?.(l.code)}
                className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                  currentLang === l.code
                    ? 'border-accent bg-accent text-onaccent font-bold shadow-sm'
                    : 'border-fg/10 bg-fg/5 text-muted hover:border-fg/30 hover:text-fg'
                }`}
              >
                <span>{l.native}</span>
                <span className="text-[10px] opacity-75 font-mono">({l.name})</span>
              </button>
            ))}
          </div>
        </section>

        {/* 5. TEXT SCALE & ACCESSIBILITY */}
        <section className="space-y-3 border-t border-fg/10 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Type size={16} className="text-accent" />
              <span>Text Size & Accessibility</span>
            </h3>
            <div className="flex items-center gap-1">
              {[
                ['1', 'A Normal'],
                ['1.15', 'A+ Large'],
                ['1.3', 'A++ Big'],
              ].map(([scale, label]) => (
                <button
                  key={scale}
                  onClick={() => applyFontScale(scale)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    fontScale === scale ? 'bg-accent text-onaccent' : 'border border-fg/20 text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-fg/10 pt-4">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-accent font-semibold"
          >
            <RotateCcw size={14} />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="btn-primary !min-h-[38px] !py-1.5 !px-5 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
