// src/utils/favorites.js
// Pin / reorder helpers for channel favourites (popup-only metadata)

export function normalizeChannel(name) {
  if (typeof name !== 'string') return '';
  return name.toLowerCase().trim();
}

export function pruneFavorites(favorites, claimData) {
  const pruned = [];
  for (const entry of favorites) {
    const channel = normalizeChannel(entry);
    if (channel && Object.prototype.hasOwnProperty.call(claimData, channel)) {
      pruned.push(channel);
    }
  }
  return pruned;
}

export function partitionChannels(claimData, favorites) {
  const normalizedFavorites = favorites.map(normalizeChannel).filter(Boolean);
  const favoriteSet = new Set(normalizedFavorites);

  const pinned = [];
  for (const channel of normalizedFavorites) {
    if (Object.prototype.hasOwnProperty.call(claimData, channel)) {
      pinned.push({ channel, count: claimData[channel] });
    }
  }

  const others = Object.entries(claimData)
    .filter(([channel]) => !favoriteSet.has(normalizeChannel(channel)))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([channel, count]) => ({ channel, count }));

  return { pinned, others };
}

export function toggleFavorite(favorites, channel) {
  const normalized = normalizeChannel(channel);
  if (!normalized) return favorites;

  const index = favorites.findIndex((entry) => normalizeChannel(entry) === normalized);
  if (index >= 0) {
    return favorites.filter((_, i) => i !== index);
  }
  return [...favorites, normalized];
}

export function reorderFavorites(favorites, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return favorites;
  }
  if (fromIndex >= favorites.length || toIndex >= favorites.length) {
    return favorites;
  }

  const next = [...favorites];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function isPinned(favorites, channel) {
  const normalized = normalizeChannel(channel);
  return favorites.some((entry) => normalizeChannel(entry) === normalized);
}

export function removeFavorite(favorites, channel) {
  const normalized = normalizeChannel(channel);
  return favorites.filter((entry) => normalizeChannel(entry) !== normalized);
}
