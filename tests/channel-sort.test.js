import { describe, it, expect } from 'bun:test';
import {
  DEFAULT_SORT,
  normalizeSortPreference,
  nextSortPreference,
  sortChannels
} from '../src/utils/channel-sort.js';
import { partitionChannels } from '../src/utils/favorites.js';

const rows = [
  { channel: 'charlie', count: 2 },
  { channel: 'alpha', count: 100 },
  { channel: 'delta', count: 10 },
  { channel: 'bravo', count: 10 }
];
const names = (entries) => entries.map(({ channel }) => channel);

describe('channel sorting', () => {
  it('defaults to alphabetical order for missing or invalid stored preferences', () => {
    for (const invalid of [undefined, null, '', [], {},
      { column: 'unknown', direction: 'asc' },
      { column: 'count', direction: 'invalid' }]) {
      expect(normalizeSortPreference(invalid)).toEqual(DEFAULT_SORT);
    }
  });

  it('restores each supported column and direction', () => {
    for (const column of ['channel', 'count', 'points']) {
      for (const direction of ['asc', 'desc']) {
        expect(normalizeSortPreference({ column, direction })).toEqual({ column, direction });
      }
    }
  });

  it('toggles the active column and starts newly selected numeric columns descending', () => {
    const count = nextSortPreference(DEFAULT_SORT, 'count');
    expect(count).toEqual({ column: 'count', direction: 'desc' });
    expect(nextSortPreference(count, 'count')).toEqual({ column: 'count', direction: 'asc' });
    expect(nextSortPreference(count, 'points')).toEqual({ column: 'points', direction: 'desc' });
    expect(nextSortPreference(count, 'channel')).toEqual(DEFAULT_SORT);
    expect(nextSortPreference(DEFAULT_SORT, 'channel')).toEqual({ column: 'channel', direction: 'desc' });
  });

  it('sorts channel names in both directions without mutating the input', () => {
    const input = Object.freeze([...rows]);
    expect(names(sortChannels(input, DEFAULT_SORT))).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
    expect(names(sortChannels(input, { column: 'channel', direction: 'desc' })))
      .toEqual(['delta', 'charlie', 'bravo', 'alpha']);
    expect(names(input)).toEqual(['charlie', 'alpha', 'delta', 'bravo']);
  });

  for (const column of ['count', 'points']) {
    it(`sorts ${column} numerically with alphabetical ties in either direction`, () => {
      expect(names(sortChannels(rows, { column, direction: 'asc' })))
        .toEqual(['charlie', 'bravo', 'delta', 'alpha']);
      expect(names(sortChannels(rows, { column, direction: 'desc' })))
        .toEqual(['alpha', 'bravo', 'delta', 'charlie']);
    });
  }

  it('preserves manually ordered favourites when sorting the remaining channels', () => {
    const data = Object.fromEntries(rows.map(({ channel, count }) => [channel, count]));
    const { pinned, others } = partitionChannels(data, ['delta', 'alpha']);
    expect(names(sortChannels(others, { column: 'count', direction: 'desc' })))
      .toEqual(['bravo', 'charlie']);
    expect(names(pinned)).toEqual(['delta', 'alpha']);
    expect(sortChannels([], DEFAULT_SORT)).toEqual([]);
  });
});
