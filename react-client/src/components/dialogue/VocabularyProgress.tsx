import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  background: rgba(116, 185, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
`;

const ProgressText = styled.div`
  color: #74b9ff;
  font-size: 0.9rem;
  font-weight: 500;
`;

interface VocabularyProgressProps {
  learnedVocabulary: string[];
}

export const VocabularyProgress: React.FC<VocabularyProgressProps> = ({
  learnedVocabulary,
}) => {
  if (learnedVocabulary.length === 0) return null;

  return (
    <ProgressContainer>
      <ProgressText>
        📚 New vocabulary learned: {learnedVocabulary.join(', ')}
      </ProgressText>
    </ProgressContainer>
  );
};