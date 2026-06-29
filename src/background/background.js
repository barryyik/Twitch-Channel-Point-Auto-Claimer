// Background service worker
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Twitch Channel Point Auto Claimer installed');
  } else if (details.reason === 'update') {
    console.log('Twitch Channel Point Auto Claimer updated');
  }
});

// Optional: Add message listeners if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_VERSION') {
    sendResponse({ version: chrome.runtime.getManifest().version });
  }
  return true;
});