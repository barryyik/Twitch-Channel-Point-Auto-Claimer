// src/utils/browser-api.js
// Browser API compatibility layer for Chrome and Firefox

const hasBrowser = typeof browser !== 'undefined';
const hasChrome = typeof chrome !== 'undefined';

// Prefer Firefox's browser API when available, otherwise chrome
export const browserAPI = (() => {
  if (hasBrowser) {
    return browser;
  }
  if (hasChrome) {
    return chrome;
  }
  // Fallback for development without extension API
  return {
    storage: {
      local: {
        get: (keys, callback) => {
          const data = {};
          if (Array.isArray(keys)) {
            keys.forEach((key) => {
              try {
                data[key] = JSON.parse(localStorage.getItem(key));
              } catch {
                data[key] = localStorage.getItem(key);
              }
            });
          } else if (typeof keys === 'string') {
            try {
              data[keys] = JSON.parse(localStorage.getItem(keys));
            } catch {
              data[keys] = localStorage.getItem(keys);
            }
          } else if (typeof keys === 'object' && keys !== null) {
            Object.keys(keys).forEach((key) => {
              try {
                const raw = localStorage.getItem(key);
                data[key] = raw != null ? JSON.parse(raw) : keys[key];
              } catch {
                data[key] = localStorage.getItem(key) || keys[key];
              }
            });
          }
          callback(data);
        },
        set: (items, callback) => {
          Object.keys(items).forEach((key) => {
            localStorage.setItem(key, JSON.stringify(items[key]));
          });
          if (callback) callback();
        },
        remove: (keys, callback) => {
          const keyArray = Array.isArray(keys) ? keys : [keys];
          keyArray.forEach((key) => localStorage.removeItem(key));
          if (callback) callback();
        },
        onChanged: {
          addListener: () => {},
          removeListener: () => {}
        }
      },
      onChanged: {
        addListener: () => {},
        removeListener: () => {}
      }
    },
    runtime: {
      getManifest: () => ({
        version: __APP_VERSION__
      }),
      onInstalled: {
        addListener: () => {},
        removeListener: () => {}
      },
      sendMessage: () => {}
    },
    i18n: {
      getMessage: (messageName) => {
        const fallbacks = {
          description: 'Auto-claiming bonus channel points',
          channel: 'Channel',
          claimedcount: 'Claims',
          approxpoints: 'Approx.',
          clearrecord: 'Clear',
          clear: 'Clear',
          clearall: 'Clear All',
          theme: 'Theme',
          light: 'Light',
          dark: 'Dark',
          system: 'System',
          loading: 'Loading...',
          empty: 'No claims recorded yet',
          confirmclearall: 'Confirm to clear records for ALL?',
          confirmclearchannel: 'Confirm to clear records for $1?',
          cancel: 'Cancel',
          toggledtheme: 'Toggle theme',
          accent: 'Accent',
          accentteal: 'Teal',
          accentgreen: 'Green',
          accentblue: 'Blue',
          accentpurple: 'Purple',
          accentorange: 'Orange',
          accentpink: 'Pink',
          pin: 'Pin',
          unpin: 'Unpin',
          pinchannel: 'Pin $1',
          unpinchannel: 'Unpin $1',
          reorder: 'Reorder',
          moveup: 'Move $1 up',
          movedown: 'Move $1 down',
          others: 'Others',
          confirmclearchannelpinned:
            'Clear records for $1? This channel is pinned and will be removed from your favourites.',
          confirmclearallwithpinssingle:
            'Clear all records? This will also remove 1 pinned channel from your favourites.',
          confirmclearallwithpins:
            'Clear all records? This will also remove $1 pinned channels from your favourites.'
        };
        return fallbacks[messageName] || messageName;
      }
    }
  };
})();

export const storage = browserAPI.storage;
export const runtime = browserAPI.runtime;
export const i18n = browserAPI.i18n;
