import { describe, it, expect } from 'vitest';
import { parseEmojiContent, hasEmoji, extractEmojis } from '../utils/emojiParser';

describe('emojiParser', () => {
  describe('parseEmojiContent', () => {
    it('extracts emoji and text from content', () => {
      const result = parseEmojiContent('🚀 Launch App');
      expect(result).toEqual({
        emoji: '🚀',
        text: 'Launch App'
      });
    });

    it('handles content without emoji', () => {
      const result = parseEmojiContent('Just Text');
      expect(result).toEqual({
        emoji: '🎮',
        text: 'Just Text'
      });
    });

    it('uses custom fallback emoji', () => {
      const result = parseEmojiContent('Just Text', '⭐');
      expect(result).toEqual({
        emoji: '⭐',
        text: 'Just Text'
      });
    });

    it('handles multiple emojis by taking the first one', () => {
      const result = parseEmojiContent('🚀🎯 Multi Emoji');
      expect(result).toEqual({
        emoji: '🚀',
        text: 'Multi Emoji'
      });
    });

    it('handles emoji at the end', () => {
      const result = parseEmojiContent('Click Me 🎯');
      expect(result).toEqual({
        emoji: '🎯',
        text: 'Click Me'
      });
    });

    it('handles emoji in the middle', () => {
      const result = parseEmojiContent('Save 💾 File');
      expect(result).toEqual({
        emoji: '💾',
        text: 'Save File'
      });
    });

    it('handles React nodes by converting to string', () => {
      const result = parseEmojiContent(123);
      expect(result).toEqual({
        emoji: '🎮',
        text: '123'
      });
    });

    it('handles empty content', () => {
      const result = parseEmojiContent('');
      expect(result).toEqual({
        emoji: '🎮',
        text: ''
      });
    });
  });

  describe('hasEmoji', () => {
    it('returns true when content has emoji', () => {
      expect(hasEmoji('🚀 Launch')).toBe(true);
      expect(hasEmoji('Save 💾')).toBe(true);
      expect(hasEmoji('🎯')).toBe(true);
    });

    it('returns false when content has no emoji', () => {
      expect(hasEmoji('Just Text')).toBe(false);
      expect(hasEmoji('123')).toBe(false);
      expect(hasEmoji('')).toBe(false);
    });
  });

  describe('extractEmojis', () => {
    it('extracts all emojis from content', () => {
      expect(extractEmojis('🚀🎯💾 Multi')).toEqual(['🚀', '🎯', '💾']);
      expect(extractEmojis('Save 💾 and Launch 🚀')).toEqual(['💾', '🚀']);
    });

    it('returns empty array when no emojis found', () => {
      expect(extractEmojis('Just Text')).toEqual([]);
      expect(extractEmojis('')).toEqual([]);
    });

    it('handles single emoji', () => {
      expect(extractEmojis('🎮')).toEqual(['🎮']);
    });
  });
});