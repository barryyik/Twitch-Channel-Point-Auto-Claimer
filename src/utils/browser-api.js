// src/utils/browser-api.js
// Browser API compatibility layer for Chrome and Firefox

// Detect browser
const isFirefox = typeof browser !== 'undefined' && typeof chrome === 'undefined';
const isChrome = typeof chrome !== 'undefined' && typeof browser === 'undefined';

// Get the appropriate API
export const browserAPI = (() => {
  // Use Firefox's browser API if available, otherwise fallback to chrome
  if (typeof browser !== 'undefined') {
    return browser;
  }
  if (typeof chrome !== 'undefined') {
    return chrome;
  }
  // Fallback for development without extension API
  return {
    storage: {
      local: {
        get: (keys, callback) => {
          const data = {};
          if (Array.isArray(keys)) {
            keys.forEach(key => {
              data[key] = localStorage.getItem(key);
            });
          } else if (typeof keys === 'string') {
            data[keys] = localStorage.getItem(keys);
          } else if (typeof keys === 'object') {
            Object.keys(keys).forEach(key => {
              data[key] = localStorage.getItem(key) || keys[key];
            });
          }
          callback(data);
        },
        set: (items, callback) => {
          Object.keys(items).forEach(key => {
            localStorage.setItem(key, items[key]);
          });
          if (callback) callback();
        },
        remove: (keys, callback) => {
          const keyArray = Array.isArray(keys) ? keys : [keys];
          keyArray.forEach(key => localStorage.removeItem(key));
          if (callback) callback();
        }
      }
    },
    runtime: {
      getManifest: () => ({
        version: '1.2.0'
      }),
      onInstalled: {
        addListener: () => {},
        removeListener: () => {}
      }
    },
    i18n: {
      getMessage: (messageName) => {
        // Simple fallback for development
        const fallbacks = {
          description: 'Auto-claiming bonus channel points',
          channel: 'Channel',
          claimedcount: 'Claimed Count (Points)',
          clearrecord: 'Clear Records',
          clear: 'Clear',
          clearall: 'Clear All',
          theme: 'Theme',
          light: 'Light',
          dark: 'Dark',
          system: 'System'
        };
        return fallbacks[messageName] || messageName;
      }
    }
  };
})();

// Helper to check browser type
export const browserType = {
  isFirefox,
  isChrome,
  isExtension: isChrome || isFirefox
};

// Export common API functions for easier use
export const storage = browserAPI.storage;
export const runtime = browserAPI.runtime;
export const i18n = browserAPI.i18n;