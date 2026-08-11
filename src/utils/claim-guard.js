// src/utils/claim-guard.js
// Idempotency for claim clicks: WeakSet of handled buttons + cooldown
// Used by tests and copied into content script during build

const DEFAULT_COOLDOWN_MS = 2000;

/**
 * Create a claim guard. In browser, pass nothing (uses WeakSet).
 * In tests, you may inject a Set-like store that holds button refs.
 */
export function createClaimGuard(options = {}) {
  const cooldownMs = options.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const handled = options.handled ?? new WeakSet();
  let lastClaimAt = 0;

  function canClaim(button) {
    if (!button) return false;
    if (handled.has(button)) return false;
    if (Date.now() - lastClaimAt < cooldownMs) return false;
    return true;
  }

  function markClaimed(button) {
    if (button) handled.add(button);
    lastClaimAt = Date.now();
  }

  function resetCooldownForTests(now = 0) {
    lastClaimAt = now;
  }

  return { canClaim, markClaimed, resetCooldownForTests };
}
