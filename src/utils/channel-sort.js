export const SORT_STORAGE_KEY = 'tcpacSortPreference';
export const DEFAULT_SORT = Object.freeze({ column: 'channel', direction: 'asc' });

const SORT_COLUMNS = ['channel', 'count', 'points'];

export function normalizeSortPreference(value) {
  if (
    !value ||
    !SORT_COLUMNS.includes(value.column) ||
    !['asc', 'desc'].includes(value.direction)
  ) {
    return DEFAULT_SORT;
  }
  return { column: value.column, direction: value.direction };
}

export function nextSortPreference(preference, column) {
  if (preference.column === column) {
    return { column, direction: preference.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { column, direction: column === 'channel' ? 'asc' : 'desc' };
}

export function sortChannels(channels, preference) {
  const { column, direction } = normalizeSortPreference(preference);
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...channels].sort((a, b) => {
    const byName = a.channel.localeCompare(b.channel);
    if (column === 'channel') return byName * multiplier;

    // Estimated points are count * 50, so both numeric columns share this order.
    return (a.count - b.count) * multiplier || byName;
  });
}
