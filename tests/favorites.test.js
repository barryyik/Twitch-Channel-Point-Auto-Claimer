// tests/favorites.test.js
import { describe, it, expect } from 'bun:test';
import {
  normalizeChannel,
  pruneFavorites,
  partitionChannels,
  toggleFavorite,
  reorderFavorites,
  isPinned,
  removeFavorite
} from '../src/utils/favorites.js';

describe('normalizeChannel', () => {
  it('lowercases and trims', () => {
    expect(normalizeChannel('  Shroud  ')).toBe('shroud');
  });

  it('returns empty string for non-string', () => {
    expect(normalizeChannel(null)).toBe('');
  });
});

describe('pruneFavorites', () => {
  it('drops favourites missing from claim data', () => {
    const claimData = { shroud: 5, ninja: 2 };
    expect(pruneFavorites(['shroud', 'missing', 'ninja'], claimData)).toEqual([
      'shroud',
      'ninja'
    ]);
  });

  it('normalizes entries while pruning', () => {
    const claimData = { shroud: 1 };
    expect(pruneFavorites([' Shroud '], claimData)).toEqual(['shroud']);
  });
});

describe('partitionChannels', () => {
  const claimData = { alpha: 1, bravo: 2, charlie: 3, delta: 4 };

  it('orders pinned by favourites list', () => {
    const { pinned, others } = partitionChannels(claimData, ['charlie', 'alpha']);
    expect(pinned.map((r) => r.channel)).toEqual(['charlie', 'alpha']);
    expect(pinned.map((r) => r.count)).toEqual([3, 1]);
  });

  it('sorts others alphabetically', () => {
    const { others } = partitionChannels(claimData, ['charlie']);
    expect(others.map((r) => r.channel)).toEqual(['alpha', 'bravo', 'delta']);
  });

  it('matches favourites defensively when casing differs', () => {
    const { pinned } = partitionChannels(claimData, ['Charlie']);
    expect(pinned).toHaveLength(1);
    expect(pinned[0].channel).toBe('charlie');
  });
});

describe('toggleFavorite', () => {
  it('adds channel to end when pinning', () => {
    expect(toggleFavorite(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes channel when unpinning', () => {
    expect(toggleFavorite(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('normalizes on add', () => {
    expect(toggleFavorite([], ' Shroud ')).toEqual(['shroud']);
  });
});

describe('reorderFavorites', () => {
  it('moves item from one index to another', () => {
    expect(reorderFavorites(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('returns same array when indices equal', () => {
    const favs = ['a', 'b'];
    expect(reorderFavorites(favs, 1, 1)).toBe(favs);
  });

  it('returns same array for out-of-range indices', () => {
    const favs = ['a'];
    expect(reorderFavorites(favs, 0, 5)).toBe(favs);
  });
});

describe('isPinned', () => {
  it('returns true when channel is in favourites', () => {
    expect(isPinned(['shroud'], 'shroud')).toBe(true);
  });

  it('matches case-insensitively', () => {
    expect(isPinned(['shroud'], 'Shroud')).toBe(true);
  });
});

describe('removeFavorite', () => {
  it('removes matching channel', () => {
    expect(removeFavorite(['a', 'b'], 'a')).toEqual(['b']);
  });
});
