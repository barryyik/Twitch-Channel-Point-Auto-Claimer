// src/popup/useTheme.js
import { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/browser-api.js';
import { normalizeAccent } from './accent-presets.js';

const THEME_STORAGE_KEY = 'themePreference';
const THEME_MIRROR_KEY = 'tcpacThemePreference';
const ACCENT_STORAGE_KEY = 'accentPreference';
const ACCENT_MIRROR_KEY = 'tcpacAccentPreference';

export { ACCENT_PRESETS } from './accent-presets.js';

export function applyTheme(themeMode) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');

  if (themeMode === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(systemPrefersDark ? 'theme-dark' : 'theme-light');
  } else if (themeMode === 'dark') {
    root.classList.add('theme-dark');
  } else {
    root.classList.add('theme-light');
  }
}

export function applyAccent(accentId) {
  document.documentElement.dataset.accent = normalizeAccent(accentId);
}

export function useTheme() {
  const [theme, setTheme] = useState('system');
  const [accent, setAccent] = useState('teal');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    storage.local.get([THEME_STORAGE_KEY, ACCENT_STORAGE_KEY], (result) => {
      const savedTheme = result[THEME_STORAGE_KEY] || 'system';
      const savedAccent = normalizeAccent(result[ACCENT_STORAGE_KEY]);
      setTheme(savedTheme);
      setAccent(savedAccent);
      applyTheme(savedTheme);
      applyAccent(savedAccent);
      try {
        localStorage.setItem(THEME_MIRROR_KEY, savedTheme);
        localStorage.setItem(ACCENT_MIRROR_KEY, savedAccent);
      } catch {
        // ignore
      }
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const saveThemePreference = (themeMode) => {
    setTheme(themeMode);
    applyTheme(themeMode);
    setShowThemeMenu(false);
    storage.local.set({ [THEME_STORAGE_KEY]: themeMode });
    try {
      localStorage.setItem(THEME_MIRROR_KEY, themeMode);
    } catch {
      // ignore
    }
  };

  const saveAccentPreference = (accentId) => {
    const next = normalizeAccent(accentId);
    setAccent(next);
    applyAccent(next);
    setShowThemeMenu(false);
    storage.local.set({ [ACCENT_STORAGE_KEY]: next });
    try {
      localStorage.setItem(ACCENT_MIRROR_KEY, next);
    } catch {
      // ignore
    }
  };

  return {
    theme,
    accent,
    showThemeMenu,
    setShowThemeMenu,
    menuRef,
    saveThemePreference,
    saveAccentPreference
  };
}
