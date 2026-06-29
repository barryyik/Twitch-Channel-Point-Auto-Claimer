// src/content/content.template.js
// Template for content script

console.log('[Twitch Channel Point Auto Claimer] Content script loaded and running');

// Channel parser function (injected during build)
{{CHANNEL_PARSER}}

const excludeUrl = [
  /.*:\/\/dashboard\.twitch\.tv.*/,
  /.*:\/\/.*\.twitch\.tv\/settings\/.*/,
];

// Debounce function to prevent multiple rapid claims
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const claimBonus = debounce(() => {
  // Check if we're on excluded URLs
  if (excludeUrl.some(url => window.location.href.match(url))) {
    console.log('[Twitch Channel Point Auto Claimer] On excluded URL, skipping');
    return;
  }

  // Try multiple selectors to find the claim button
  let button = document.querySelector('.ScCoreButtonSuccess-sc-1qn4ixc-5') || 
               document.querySelector('.ScCoreButtonSuccess-sc-ocjdkf-1') ||
               document.querySelector('[data-test-selector="claimable-bonus"]') ||
               document.querySelector('.claimable-bonus__icon')?.closest('button') ||
               getButtonByAriaLabel();

  if (!button) return;

  // Ensure it's a button element
  if (button.nodeName !== 'BUTTON') {
    button = button.querySelector('button') || getButtonByAriaLabel();
  }

  if (!button || button.disabled) return;

  console.log('[Twitch Channel Point Auto Claimer] Claim button found, clicking...');
  
  // Click the button
  button.click();

  // Get channel name from URL using shared parser
  const channelName = getChannelNameFromUrl(window.location.href);
  
  // Only record if we have a valid channel name
  if (!channelName) {
    console.warn('[Twitch Channel Point Auto Claimer] Could not extract channel name from URL:', window.location.href);
    return;
  }

  console.log(`[Twitch Channel Point Auto Claimer] Claimed bonus for channel: ${channelName}`);

  // Update storage with claimed count
  chrome.storage.local.get('tcpacObj', result => {
    let tcpacObj = result.tcpacObj ?? {};
    tcpacObj[channelName] = (tcpacObj[channelName] ?? 0) + 1;
    chrome.storage.local.set({ tcpacObj: tcpacObj }, () => {
      console.log(`[Twitch Channel Point Auto Claimer] Updated count for ${channelName}: ${tcpacObj[channelName]}`);
    });
  });
}, 500);

function getButtonByAriaLabel() {
  const labels = [
    "Claim Bonus",
    "Få bonus",
    "Bonus einfordern",
    "Reclamar bonificación",
    "Reclamar bono",
    "Récupérer un bonus",
    "Riscatta bonus",
    "Bónusz igénylése",
    "Bonus claimen",
    "Motta bonus",
    "Odbierz bonus",
    "Receber bónus",
    "Resgatar Bônus",
    "Obține bonusul",
    "Vyzdvihnúť bonus",
    "Lunasta bonus",
    "Hämta bonus",
    "Nhận thưởng",
    "Bonusu al",
    "Vyzvednout bonus",
    "Διεκδίκηση μπόνους",
    "Получаване на бонус",
    "Получить бонус",
    "เคลมโบนัส",
    "领取奖励",
    "領取額外獎勵",
    "ボーナスを受け取る",
    "보너스 받기"
  ];

  for (const label of labels) {
    const button = document.querySelector(`[aria-label="${label}"]`);
    if (button) return button;
  }
  return null;
}

// Set up mutation observer to detect dynamically added claim buttons
let observer = null;
let timeoutId = null;

function setupObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    // Clear previous timeout
    if (timeoutId) clearTimeout(timeoutId);
    
    // Debounce the check to avoid too many calls
    timeoutId = setTimeout(() => {
      claimBonus();
    }, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize the claimer
function initClaimer() {
  console.log('[Twitch Channel Point Auto Claimer] Initializing claimer...');
  
  // Run claim check periodically (fallback for cases where mutation observer might miss)
  setInterval(() => {
    if (!excludeUrl.some(url => window.location.href.match(url))) {
      claimBonus();
    }
  }, 2000);

  setupObserver();
  
  // Initial check
  claimBonus();
  
  console.log('[Twitch Channel Point Auto Claimer] Claimer initialized successfully');
}

// Start the claimer when the page is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClaimer);
} else {
  initClaimer();
}