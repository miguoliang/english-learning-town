import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { highlightVocabulary } from '../../utils/vocabularyHighlighter';

const TextContainer = styled(motion.div)`
  color: white;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 20px;
  min-height: 60px;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      dangerouslySetInnerHTML={{
        __html: highlightVocabulary(text, vocabularyHighlights).replace(
          /<span class="vocabulary-highlight">/g,
          '<span style="background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600;">'
        )
      }}
    />
  );
};