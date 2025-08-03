/**
 * Utility for highlighting vocabulary words in text
 */
export const highlightVocabulary = (text: string, vocabulary: string[] = []): string => {
  if (!vocabulary.length) return text;

  let highlightedText = text;
  vocabulary.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    highlightedText = highlightedText.replace(
      regex, 
      `<span class="vocabulary-highlight">${word}</span>`
    );
  });

  return highlightedText;
};

/**
 * Get NPC avatar emoji based on NPC ID
 */
export const getNPCAvatar = (npcId: string): string => {
  switch (npcId) {
    case 'teacher': return '👩‍🏫';
    case 'shopkeeper': return '👨‍💼';
    case 'librarian': return '👩‍🎓';
    default: return '👤';
  }
};