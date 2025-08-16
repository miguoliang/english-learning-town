import React from 'react';
import styled from 'styled-components';

const TextContainer = styled.div`
  color: rgba(232, 212, 184, 0.95);
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.7;
  letter-spacing: 0.02em;
  margin-bottom: 24px;
  min-height: 70px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
`;

const VocabularyHighlight = styled.span`
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
`;

interface DialogueTextProps {
  text: string;
  vocabularyHighlights?: string[];
}

// Safe vocabulary highlighting using React components instead of dangerouslySetInnerHTML
const highlightVocabularyWords = (text: string, vocabulary: string[] = []): React.ReactNode[] => {
  if (!vocabulary.length) return [text];

  // Create a regex that matches all vocabulary words
  const vocabularyRegex = new RegExp(`\\b(${vocabulary.join('|')})\\b`, 'gi');
  const parts = text.split(vocabularyRegex);

  return parts.map((part, index) => {
    // Check if this part is a vocabulary word
    const isVocabulary = vocabulary.some(word => 
      word.toLowerCase() === part.toLowerCase()
    );

    if (isVocabulary) {
      return (
        <VocabularyHighlight key={index}>
          {part}
        </VocabularyHighlight>
      );
    }

    return part;
  });
};

export const DialogueText: React.FC<DialogueTextProps> = ({
  text,
  vocabularyHighlights = [],
}) => {
  const highlightedContent = highlightVocabularyWords(text, vocabularyHighlights);

  return (
    <TextContainer>
      {highlightedContent}
    </TextContainer>
  );
};