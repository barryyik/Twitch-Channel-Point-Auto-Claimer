// tests/claim-guard.test.js
import { describe, it, expect } from 'bun:test';
import { createClaimGuard } from '../src/utils/claim-guard.js';

describe('createClaimGuard', () => {
  it('allows claiming a new button', () => {
    const handled = new Set();
    const testGuard = createClaimGuard({ cooldownMs: 2000, handled });
    const button = { id: 'a' };

    expect(testGuard.canClaim(button)).toBe(true);
  });

  it('rejects the same button after markClaimed', () => {
    const handled = new Set();
    const guard = createClaimGuard({ cooldownMs: 2000, handled });
    const button = { id: 'a' };

    expect(guard.canClaim(button)).toBe(true);
    guard.markClaimed(button);
    expect(guard.canClaim(button)).toBe(false);
  });

  it('allows a different button after prior was handled (when cooldown expired)', () => {
    const handled = new Set();
    const guard = createClaimGuard({ cooldownMs: 0, handled });
    const buttonA = { id: 'a' };
    const buttonB = { id: 'b' };

    guard.markClaimed(buttonA);
    expect(guard.canClaim(buttonA)).toBe(false);
    expect(guard.canClaim(buttonB)).toBe(true);
  });

  it('rejects during cooldown even for a new button', () => {
    const handled = new Set();
    const guard = createClaimGuard({ cooldownMs: 60_000, handled });
    const buttonA = { id: 'a' };
    const buttonB = { id: 'b' };

    guard.markClaimed(buttonA);
    expect(guard.canClaim(buttonB)).toBe(false);
  });

  it('rejects null button', () => {
    const guard = createClaimGuard({ cooldownMs: 0, handled: new Set() });
    expect(guard.canClaim(null)).toBe(false);
  });
});
