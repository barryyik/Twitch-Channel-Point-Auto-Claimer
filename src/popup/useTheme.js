// src/popup/useTheme.js
import { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/browser-api.js';

const THEME_STORAGE_KEY = 'themePreference';
const THEME_MIRROR_KEY = 'tcpacThemePreference';

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

export function useTheme() {
  const [theme, setTheme] = useState('system');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    storage.local.get(THEME_STORAGE_KEY, (result) => {
      const savedTheme = result[THEME_STORAGE_KEY] || 'system';
      setTheme(savedTheme);
      applyTheme(savedTheme);
      try {
        localStorage.setItem(THEME_MIRROR_KEY, savedTheme);
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

  return {
    theme,
    showThemeMenu,
    setShowThemeMenu,
    menuRef,
    saveThemePreference
  };
}
