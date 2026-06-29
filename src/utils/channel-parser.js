// src/utils/channel-parser.js
// Single source of truth for channel name extraction
// Used by tests and copied into content script during build

export function getChannelNameFromUrl(url) {
  // Parse the URL to get pathname
  let pathname;
  try {
    const urlObj = new URL(url);
    pathname = urlObj.pathname;
  } catch (e) {
    // If it's just a path string, use it directly
    pathname = url;
  }
  
  // Decode the pathname to handle international characters
  try {
    pathname = decodeURIComponent(pathname);
  } catch (e) {
    // If decoding fails, use the original pathname
    console.warn('[Channel Parser] Failed to decode pathname:', pathname);
  }
  
  // Remove leading and trailing slashes and split
  const pathParts = pathname.replace(/^\/|\/$/g, '').split('/');
  
  // If first part is "moderator", the channel name is the second part
  if (pathParts[0] === 'moderator' && pathParts[1]) {
    return pathParts[1];
  }
  
  // If first part is "popout" and second is "moderator", channel is third part
  if (pathParts[0] === 'popout' && pathParts[1] === 'moderator' && pathParts[2]) {
    return pathParts[2];
  }
  
  // If first part is "popout" and second is channel name (e.g., /popout/channel_name/chat)
  if (pathParts[0] === 'popout' && pathParts[1] && !['moderator', 'settings', 'dashboard'].includes(pathParts[1])) {
    return pathParts[1];
  }
  
  // For regular channel URLs, the first part is the channel name
  // But only if it's not a special route
  const specialRoutes = [
    'directory', 'videos', 'search', 'settings', 'dashboard', 
    'subscriptions', 'friends', 'inventory', 'drops', 'wallet',
    'downloads', 'jobs', 'security', 'creators', 'turbo',
    'broadcast', 'messages', 'notifications', 'moderator'
  ];
  
  if (pathParts[0] && !specialRoutes.includes(pathParts[0])) {
    return pathParts[0];
  }
  
  // Check for channel in URL parameters (fallback)
  try {
    const urlObj = new URL(url);
    let channelParam = urlObj.searchParams.get('channel');
    if (channelParam) {
      try {
        channelParam = decodeURIComponent(channelParam);
      } catch (e) {
        // If decoding fails, use as is
      }
      return channelParam;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  return null;
}