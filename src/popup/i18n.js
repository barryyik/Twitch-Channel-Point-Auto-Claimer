// src/popup/i18n.js
import { i18n } from '../utils/browser-api.js';

const FALLBACKS = {
  channel: 'Channel',
  claimedcount: 'Claims',
  approxpoints: 'Approx.',
  sortascending: 'Sort ascending',
  sortdescending: 'Sort descending',
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
