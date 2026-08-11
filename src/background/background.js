// Background service worker / script
// Single writer for claim increments (avoids multi-tab storage races)

function normalizeTcpacKeys(tcpacObj) {
  if (!tcpacObj || typeof tcpacObj !== 'object') return {};
  const normalized = {};
  for (const [key, value] of Object.entries(tcpacObj)) {
    const channel = String(key).toLowerCase();
    const count = typeof value === 'number' ? value : 0;
    normalized[channel] = (normalized[channel] ?? 0) + count;
  }
  return normalized;
}

function migrateTcpacKeys() {
  chrome.storage.local.get('tcpacObj', (result) => {
    const current = result.tcpacObj;
    if (!current || typeof current !== 'object') return;

    const normalized = normalizeTcpacKeys(current);
    const keys = Object.keys(current);
    const needsMigration =
      keys.some((k) => k !== k.toLowerCase()) ||
      keys.length !== Object.keys(normalized).length;

    if (needsMigration) {
      chrome.storage.local.set({ tcpacObj: normalized });
    }
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    migrateTcpacKeys();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.type === 'INCREMENT_CLAIM') {
    const channel = typeof request.channel === 'string'
      ? request.channel.toLowerCase().trim()
      : '';

    if (!channel) {
      sendResponse({ ok: false, error: 'missing_channel' });
      return false;
    }

    chrome.storage.local.get('tcpacObj', (result) => {
      const tcpacObj = normalizeTcpacKeys(result.tcpacObj ?? {});
      tcpacObj[channel] = (tcpacObj[channel] ?? 0) + 1;
      chrome.storage.local.set({ tcpacObj }, () => {
        sendResponse({ ok: true, count: tcpacObj[channel] });
      });
    });

    return true; // async sendResponse
  }

  return false;
});
