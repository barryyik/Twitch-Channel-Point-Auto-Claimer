// src/content/content.template.js
// Template for content script — placeholders injected by scripts/build-content.js

const DEBUG = false;

function log(...args) {
  if (DEBUG) console.log('[Twitch Channel Point Auto Claimer]', ...args);
}

function warn(...args) {
  if (DEBUG) console.warn('[Twitch Channel Point Auto Claimer]', ...args);
}

{{CHANNEL_PARSER}}

{{CLAIM_BUTTON}}

{{CLAIM_GUARD}}

const excludeUrl = [
  /.*:\/\/dashboard\.twitch\.tv.*/,
  /.*:\/\/.*\.twitch\.tv\/settings\/.*/,
];

const claimGuard = createClaimGuard({ cooldownMs: 2000 });

function isExcludedUrl() {
  return excludeUrl.some((url) => window.location.href.match(url));
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function sendIncrement(channelName) {
  try {
    chrome.runtime.sendMessage(
      { type: 'INCREMENT_CLAIM', channel: channelName },
      (response) => {
        if (chrome.runtime.lastError) {
          warn('INCREMENT_CLAIM failed:', chrome.runtime.lastError.message);
          return;
        }
        if (response?.ok) {
          log(`Updated count for ${channelName}: ${response.count}`);
        }
      }
    );
  } catch (e) {
    warn('sendMessage error:', e);
  }
}

const claimBonus = debounce(() => {
  if (isExcludedUrl()) {
    log('On excluded URL, skipping');
    return;
  }

  const summary = findCommunityPointsSummary(document);
  const searchRoot = summary || document;
  const button = findClaimButton(searchRoot);

  if (!button) return;
  if (!claimGuard.canClaim(button)) {
    log('Claim skipped (already handled or cooldown)');
    return;
  }

  const channelNameRaw = getChannelNameFromUrl(window.location.href);
  if (!channelNameRaw) {
    warn('Could not extract channel name from URL:', window.location.href);
    return;
  }

  const channelName = channelNameRaw.toLowerCase();

  claimGuard.markClaimed(button);
  log('Claim button found, clicking for', channelName);
  button.click();
  sendIncrement(channelName);
}, 300);

// --- Observers: scoped summary + light body rediscovery ---

let summaryObserver = null;
let bodyObserver = null;
let summaryDebounceId = null;
let bodyDebounceId = null;
let observedSummary = null;

function disconnectSummaryObserver() {
  if (summaryObserver) {
    summaryObserver.disconnect();
    summaryObserver = null;
  }
  observedSummary = null;
}

function observeSummary(summaryEl) {
  if (!summaryEl || summaryEl === observedSummary) return;

  disconnectSummaryObserver();
  observedSummary = summaryEl;

  summaryObserver = new MutationObserver(() => {
    if (summaryDebounceId) clearTimeout(summaryDebounceId);
    summaryDebounceId = setTimeout(() => claimBonus(), 100);
  });

  summaryObserver.observe(summaryEl, { childList: true, subtree: true });
  log('Observing community-points-summary');
  claimBonus();
}

function rediscoverSummary() {
  const summary = findCommunityPointsSummary(document);
  if (summary && summary !== observedSummary) {
    observeSummary(summary);
  } else if (!summary && observedSummary) {
    disconnectSummaryObserver();
  }
}

function setupBodyObserver() {
  if (bodyObserver) bodyObserver.disconnect();

  // Light rediscovery only (debounced) — claim checks run on the summary observer
  bodyObserver = new MutationObserver(() => {
    if (bodyDebounceId) clearTimeout(bodyDebounceId);
    bodyDebounceId = setTimeout(rediscoverSummary, 500);
  });

  if (document.body) {
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }
}

function initClaimer() {
  log('Initializing claimer...');

  const summary = findCommunityPointsSummary(document);
  if (summary) observeSummary(summary);

  setupBodyObserver();

  // Fallback interval (5s) for cases observers miss
  setInterval(() => {
    if (isExcludedUrl()) return;

    const summary = findCommunityPointsSummary(document);
    if (summary && summary !== observedSummary) {
      observeSummary(summary);
    }

    claimBonus();
  }, 5000);

  claimBonus();
  log('Claimer initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClaimer);
} else {
  initClaimer();
}
