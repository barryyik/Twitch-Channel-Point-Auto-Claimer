// tests/content-logic.test.js
// Using Bun's native test runner
import { describe, it, expect } from 'bun:test';
import { getChannelNameFromUrl } from '../src/utils/channel-parser.js';

describe('Channel Name Extraction Logic', () => {
  
  describe('Regular channel URLs', () => {
    it('should extract channel name from basic Twitch URL', () => {
      const url = 'https://www.twitch.tv/shroud';
      expect(getChannelNameFromUrl(url)).toBe('shroud');
    });

    it('should extract channel name with trailing slash', () => {
      const url = 'https://www.twitch.tv/summit1g/';
      expect(getChannelNameFromUrl(url)).toBe('summit1g');
    });

    it('should extract channel name with additional path segments', () => {
      const url = 'https://www.twitch.tv/asmongold/videos';
      expect(getChannelNameFromUrl(url)).toBe('asmongold');
    });

    it('should extract channel name with numbers and underscores', () => {
      const url = 'https://www.twitch.tv/xqcow';
      expect(getChannelNameFromUrl(url)).toBe('xqcow');
    });

    it('should handle channel names with dots', () => {
      const url = 'https://www.twitch.tv/example.channel';
      expect(getChannelNameFromUrl(url)).toBe('example.channel');
    });
  });

  describe('Moderator URLs (Critical Fix)', () => {
    it('should extract actual channel name from moderator URL', () => {
      const url = 'https://www.twitch.tv/moderator/xqc';
      expect(getChannelNameFromUrl(url)).toBe('xqc');
    });

    it('should extract channel name from moderator URL with trailing slash', () => {
      const url = 'https://www.twitch.tv/moderator/shroud/';
      expect(getChannelNameFromUrl(url)).toBe('shroud');
    });

    it('should extract channel name from moderator URL with additional path', () => {
      const url = 'https://www.twitch.tv/moderator/asmongold/chat';
      expect(getChannelNameFromUrl(url)).toBe('asmongold');
    });

    it('should NOT return "moderator" as channel name', () => {
      const url = 'https://www.twitch.tv/moderator/summit1g';
      const channelName = getChannelNameFromUrl(url);
      expect(channelName).not.toBe('moderator');
      expect(channelName).toBe('summit1g');
    });

    it('should handle moderator view with special characters in channel name', () => {
      const url = 'https://www.twitch.tv/moderator/example_channel_123';
      expect(getChannelNameFromUrl(url)).toBe('example_channel_123');
    });
    
    it('should handle moderator view with international channel names', () => {
      const url = 'https://www.twitch.tv/moderator/こんにちは';
      expect(getChannelNameFromUrl(url)).toBe('こんにちは');
    });
  });

  describe('Popout URLs', () => {
    it('should extract channel name from popout moderator URL', () => {
      const url = 'https://www.twitch.tv/popout/moderator/xqc/chat';
      expect(getChannelNameFromUrl(url)).toBe('xqc');
    });

    it('should extract channel name from popout chat URL', () => {
      const url = 'https://www.twitch.tv/popout/shroud/chat';
      expect(getChannelNameFromUrl(url)).toBe('shroud');
    });

    it('should extract channel name from popout video URL', () => {
      const url = 'https://www.twitch.tv/popout/asmongold/video';
      expect(getChannelNameFromUrl(url)).toBe('asmongold');
    });

    it('should handle popout player URL', () => {
      const url = 'https://www.twitch.tv/popout/summit1g/player';
      expect(getChannelNameFromUrl(url)).toBe('summit1g');
    });
    
    it('should handle popout with international channel names', () => {
      const url = 'https://www.twitch.tv/popout/привет/chat';
      expect(getChannelNameFromUrl(url)).toBe('привет');
    });
  });

  describe('Special Routes (Should Return null)', () => {
    it('should return null for directory page', () => {
      const url = 'https://www.twitch.tv/directory';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for directory following page', () => {
      const url = 'https://www.twitch.tv/directory/following';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for search page', () => {
      const url = 'https://www.twitch.tv/search?term=example';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for settings page', () => {
      const url = 'https://www.twitch.tv/settings';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for dashboard', () => {
      const url = 'https://dashboard.twitch.tv/';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for subscriptions page', () => {
      const url = 'https://www.twitch.tv/subscriptions';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for friends page', () => {
      const url = 'https://www.twitch.tv/friends';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for inventory page', () => {
      const url = 'https://www.twitch.tv/inventory';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for drops page', () => {
      const url = 'https://www.twitch.tv/drops';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });

    it('should return null for wallet page', () => {
      const url = 'https://www.twitch.tv/wallet';
      expect(getChannelNameFromUrl(url)).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle URL with query parameters', () => {
      const url = 'https://www.twitch.tv/shroud?referrer=home';
      expect(getChannelNameFromUrl(url)).toBe('shroud');
    });

    it('should handle URL with hash fragment', () => {
      const url = 'https://www.twitch.tv/xqc#section';
      expect(getChannelNameFromUrl(url)).toBe('xqc');
    });

    it('should handle channel name with hyphens', () => {
      const url = 'https://www.twitch.tv/example-channel';
      expect(getChannelNameFromUrl(url)).toBe('example-channel');
    });

    it('should handle numeric channel names', () => {
      const url = 'https://www.twitch.tv/12345';
      expect(getChannelNameFromUrl(url)).toBe('12345');
    });

    it('should use URL parameter as fallback', () => {
      const url = 'https://www.twitch.tv/?channel=fallback_channel';
      expect(getChannelNameFromUrl(url)).toBe('fallback_channel');
    });
    
    it('should use URL parameter as fallback with international chars', () => {
      const url = 'https://www.twitch.tv/?channel=テストチャンネル';
      expect(getChannelNameFromUrl(url)).toBe('テストチャンネル');
    });

    it('should handle subdomain variations', () => {
      const url = 'https://twitch.tv/shroud';
      expect(getChannelNameFromUrl(url)).toBe('shroud');
    });

    it('should handle m.twitch.tv mobile subdomain', () => {
      const url = 'https://m.twitch.tv/shroud';
      expect(getChannelNameFromUrl(url)).toBe('shroud');
    });
    
    it('should handle www subdomain with international chars', () => {
      const url = 'https://www.twitch.tv/こんにちは';
      expect(getChannelNameFromUrl(url)).toBe('こんにちは');
    });
  });

  describe('International Channel Names', () => {
    it('should handle Japanese channel names', () => {
      const url = 'https://www.twitch.tv/こんにちは';
      expect(getChannelNameFromUrl(url)).toBe('こんにちは');
    });

    it('should handle Cyrillic channel names', () => {
      const url = 'https://www.twitch.tv/привет';
      expect(getChannelNameFromUrl(url)).toBe('привет');
    });

    it('should handle mixed character sets', () => {
      const url = 'https://www.twitch.tv/abc123_测试';
      expect(getChannelNameFromUrl(url)).toBe('abc123_测试');
    });
    
    it('should handle Korean channel names', () => {
      const url = 'https://www.twitch.tv/안녕하세요';
      expect(getChannelNameFromUrl(url)).toBe('안녕하세요');
    });
    
    it('should handle Arabic channel names', () => {
      const url = 'https://www.twitch.tv/مرحبا';
      expect(getChannelNameFromUrl(url)).toBe('مرحبا');
    });
    
    it('should handle Emoji in channel names', () => {
      const url = 'https://www.twitch.tv/😀test😀';
      expect(getChannelNameFromUrl(url)).toBe('😀test😀');
    });
  });

  describe('VOD and Clip URLs', () => {
    it('should extract channel name from VOD URL', () => {
      const url = 'https://www.twitch.tv/shroud/video/123456789';
      expect(getChannelNameFromUrl(url)).toBe('shroud');
    });

    it('should extract channel name from clip URL', () => {
      const url = 'https://www.twitch.tv/xqc/clip/ClampTenderTigerPogChamp';
      expect(getChannelNameFromUrl(url)).toBe('xqc');
    });

    it('should extract channel name from collections URL', () => {
      const url = 'https://www.twitch.tv/asmongold/collections';
      expect(getChannelNameFromUrl(url)).toBe('asmongold');
    });
  });
});