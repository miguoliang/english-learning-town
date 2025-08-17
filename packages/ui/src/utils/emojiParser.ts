/**
 * Utility functions for emoji parsing and text extraction
 */

export interface ParsedContent {
  emoji: string;
  text: string;
}

/**
 * Extracts emoji and clean text from React node content
 * @param content - React node content to parse
 * @param fallbackEmoji - Default emoji to use if none found
 * @returns Object with emoji and cleaned text
 */
export const parseEmojiContent = (
  content: React.ReactNode, 
  fallbackEmoji: string = '🎮'
): ParsedContent => {
  const text = String(content);
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
  const detectedEmoji = text.match(emojiRegex)?.[0] || fallbackEmoji;
  const cleanText = text.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
  
  return { 
    emoji: detectedEmoji, 
    text: cleanText 
  };
};

/**
 * Checks if content contains any emojis
 * @param content - Content to check
 * @returns True if content contains emojis
 */
export const hasEmoji = (content: React.ReactNode): boolean => {
  const text = String(content);
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
  return emojiRegex.test(text);
};

/**
 * Extracts all emojis from content
 * @param content - Content to parse
 * @returns Array of found emojis
 */
export const extractEmojis = (content: React.ReactNode): string[] => {
  const text = String(content);
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
  return text.match(emojiRegex) || [];
};