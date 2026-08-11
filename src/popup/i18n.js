// src/popup/i18n.js
import { i18n } from '../utils/browser-api.js';

const FALLBACKS = {
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
  toggledtheme: 'Toggle theme'
};

export function getMessage(messageName, substitutions) {
  if (i18n && i18n.getMessage) {
    const message = i18n.getMessage(messageName, substitutions);
    // Non-empty chrome message wins. Empty string may mean "missing" or
    // intentional blank — prefer explicit FALLBACKS when present.
    if (message) return message;
  }

  if (Object.prototype.hasOwnProperty.call(FALLBACKS, messageName)) {
    let fallback = FALLBACKS[messageName];
    if (substitutions != null) {
      const list = Array.isArray(substitutions) ? substitutions : [substitutions];
      list.forEach((value, index) => {
        fallback = String(fallback).replace(`$${index + 1}`, value);
      });
    }
    return fallback;
  }

  return messageName;
}
