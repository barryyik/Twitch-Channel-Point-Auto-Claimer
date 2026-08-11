// tests/claim-button.test.js
import { describe, it, expect } from 'bun:test';
import { findClaimButton, findCommunityPointsSummary } from '../src/utils/claim-button.js';

/** Minimal element tree for unit tests without jsdom */
function el(tag, attrs = {}, children = []) {
  const node = {
    nodeName: tag.toUpperCase(),
    disabled: !!attrs.disabled,
    attributes: attrs,
    children: [],
    className: attrs.class || '',
    querySelector(selector) {
      return queryIn(this, selector);
    },
    closest(selector) {
      let current = this;
      while (current) {
        if (matches(current, selector)) return current;
        current = current.parent;
      }
      return null;
    }
  };
  for (const child of children) {
    child.parent = node;
    node.children.push(child);
  }
  return node;
}

function matches(node, selector) {
  if (selector.startsWith('[data-test-selector="') && selector.endsWith('"]')) {
    const value = selector.slice('[data-test-selector="'.length, -2);
    return node.attributes['data-test-selector'] === value;
  }
  if (selector.startsWith('[aria-label="') && selector.endsWith('"]')) {
    const value = selector.slice('[aria-label="'.length, -2);
    return node.attributes['aria-label'] === value;
  }
  if (selector.startsWith('.')) {
    const cls = selector.slice(1);
    return (node.className || '').split(/\s+/).includes(cls);
  }
  if (selector === 'button') {
    return node.nodeName === 'BUTTON';
  }
  return false;
}

function queryIn(root, selector) {
  const stack = [...(root.children || [])];
  while (stack.length) {
    const node = stack.shift();
    if (matches(node, selector)) return node;
    if (node.children) stack.push(...node.children);
  }
  return null;
}

function makeRoot(children) {
  const root = {
    nodeName: '#document',
    children,
    querySelector(selector) {
      return queryIn(this, selector);
    }
  };
  for (const child of children) child.parent = root;
  return root;
}

describe('findClaimButton', () => {
  it('finds button via data-test-selector claimable-bonus', () => {
    const button = el('button', { 'data-test-selector': 'claimable-bonus' });
    const root = makeRoot([button]);
    expect(findClaimButton(root)).toBe(button);
  });

  it('finds button via aria-label Claim Bonus', () => {
    const button = el('button', { 'aria-label': 'Claim Bonus' });
    const root = makeRoot([button]);
    expect(findClaimButton(root)).toBe(button);
  });

  it('finds button via claimable-bonus__icon closest button', () => {
    const icon = el('div', { class: 'claimable-bonus__icon' });
    const button = el('button', {}, [icon]);
    const root = makeRoot([button]);
    expect(findClaimButton(root)).toBe(button);
  });

  it('returns null for disabled button', () => {
    const button = el('button', {
      'data-test-selector': 'claimable-bonus',
      disabled: true
    });
    const root = makeRoot([button]);
    expect(findClaimButton(root)).toBeNull();
  });

  it('returns null when no claim UI present', () => {
    const root = makeRoot([el('div', {})]);
    expect(findClaimButton(root)).toBeNull();
  });
});

describe('findCommunityPointsSummary', () => {
  it('finds summary by data-test-selector', () => {
    const summary = el('div', { 'data-test-selector': 'community-points-summary' });
    const root = makeRoot([summary]);
    expect(findCommunityPointsSummary(root)).toBe(summary);
  });

  it('finds summary by class name', () => {
    const summary = el('div', { class: 'community-points-summary' });
    const root = makeRoot([summary]);
    expect(findCommunityPointsSummary(root)).toBe(summary);
  });
});
