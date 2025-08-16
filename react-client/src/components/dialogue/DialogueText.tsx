import React from 'react';
import styled from 'styled-components';
import { highlightVocabulary } from '../../utils/vocabularyHighlighter';

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

interface DialogueTextProps {
  text: string;
  vocabularyHighlights?: string[];
}

export const DialogueText: React.FC<DialogueTextProps> = ({
  text,
  vocabularyHighlights = [],
}) => {
  return (
    <TextContainer
      dangerouslySetInnerHTML={{
        __html: highlightVocabulary(text, vocabularyHighlights)
      }}
    />
  );
};