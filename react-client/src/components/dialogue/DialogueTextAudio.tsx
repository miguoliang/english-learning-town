import React from 'react';
import styled from 'styled-components';
import { DialogueText } from './DialogueText';

const TextWithAudio = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`;

const AudioButton = styled.button`
  background: rgba(116, 185, 255, 0.2);
  border: 1px solid #74b9ff;
  color: #74b9ff;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(116, 185, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface DialogueTextAudioProps {
  text: string;
  vocabularyHighlights?: string[];
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export const DialogueTextAudio: React.FC<DialogueTextAudioProps> = ({
  text,
  vocabularyHighlights,
  onSpeak,
  isSpeaking = false,
}) => {
  return (
    <TextWithAudio>
      <DialogueText 
        text={text} 
        vocabularyHighlights={vocabularyHighlights} 
      />
      {onSpeak && (
        <AudioButton 
          onClick={() => onSpeak(text)}
          disabled={isSpeaking}
          title="Read this text aloud"
        >
          {isSpeaking ? '🔇' : '🔊'}
        </AudioButton>
      )}
    </TextWithAudio>
  );
};