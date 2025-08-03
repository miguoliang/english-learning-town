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
      `<span style="background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${word}</span>`
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