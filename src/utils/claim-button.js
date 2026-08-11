// src/utils/claim-button.js
// Find claimable bonus button within a root (summary or document)
// Used by tests and copied into content script during build

export const CLAIM_ARIA_LABELS = [
  'Claim Bonus',
  'Få bonus',
  'Bonus einfordern',
  'Reclamar bonificación',
  'Reclamar bono',
  'Récupérer un bonus',
  'Riscatta bonus',
  'Bónusz igénylése',
  'Bonus claimen',
  'Motta bonus',
  'Odbierz bonus',
  'Receber bónus',
  'Resgatar Bônus',
  'Obține bonusul',
  'Vyzdvihnúť bonus',
  'Lunasta bonus',
  'Hämta bonus',
  'Nhận thưởng',
  'Bonusu al',
  'Vyzvednout bonus',
  'Διεκδίκηση μπόνους',
  'Получаване на бонус',
  'Получить бонус',
  'เคลมโบนัส',
  '领取奖励',
  '領取額外獎勵',
  'ボーナスを受け取る',
  '보너스 받기'
];

export function findCommunityPointsSummary(doc = document) {
  return (
    doc.querySelector('[data-test-selector="community-points-summary"]') ||
    doc.querySelector('.community-points-summary') ||
    null
  );
}

function findButtonByAriaLabel(root) {
  for (const label of CLAIM_ARIA_LABELS) {
    const button = root.querySelector(`[aria-label="${label}"]`);
    if (button) return button;
  }
  return null;
}

function normalizeToButton(el, root) {
  if (!el) return null;
  if (el.nodeName === 'BUTTON') return el;
  return el.querySelector?.('button') || findButtonByAriaLabel(root) || null;
}

/**
 * Find the claimable bonus button within root (summary element or document).
 * Prefers stable selectors; hashed styled-components classes are last resort.
 */
export function findClaimButton(root = document) {
  const scope = root || document;

  let button =
    scope.querySelector('[data-test-selector="claimable-bonus"]') ||
    scope.querySelector('.claimable-bonus__icon')?.closest('button') ||
    findButtonByAriaLabel(scope) ||
    // Legacy hashed classes (fragile; last resort)
    scope.querySelector('.ScCoreButtonSuccess-sc-1qn4ixc-5') ||
    scope.querySelector('.ScCoreButtonSuccess-sc-ocjdkf-1');

  button = normalizeToButton(button, scope);
  if (!button || button.disabled) return null;
  return button;
}
