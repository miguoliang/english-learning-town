// Refactored Dialogue System Component with Single Responsibility Principle

import React from 'react';
import styled from 'styled-components';
import { useDialogueState } from '../../hooks/useDialogueState';
import { useDialogueKeyboard } from '../../hooks/useDialogueKeyboard';
import { DialogueHeader } from './DialogueHeader';
import { DialogueTextAudio } from './DialogueTextAudio';
import { ResponseOptions } from './ResponseOptions';
import { ContinueButton } from './ContinueButton';
import { VocabularyProgress } from './VocabularyProgress';

const DialogueOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(2px);
`;

const DialogueBox = styled.div`
  background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
  border: 3px solid #74b9ff;
  border-radius: 16px 16px 0 0;
  width: 90%;
  max-width: 800px;
  min-height: 200px;
  padding: 24px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.3);
`;

interface DialogueSystemProps {
  npcId: string;
  onClose: () => void;
}

export const DialogueSystem: React.FC<DialogueSystemProps> = ({ npcId, onClose }) => {
  // Use custom hooks for state and keyboard handling
  const {
    currentDialogue,
    hasResponded,
    learnedVocabulary,
    isSpeaking,
    handleResponseClick,
    handleSpeak,
    handleStopSpeech,
  } = useDialogueState({ npcId, onClose });

  useDialogueKeyboard({
    currentDialogue,
    hasResponded,
    onClose,
  });

  if (!currentDialogue) {
    return null;
  }

  const hasResponses = currentDialogue.responses && currentDialogue.responses.length > 0;

  return (
    <DialogueOverlay onClick={onClose}>
      <DialogueBox onClick={(e) => e.stopPropagation()}>
        <DialogueHeader
          npcId={npcId}
          speakerName={currentDialogue.speakerName}
          onClose={onClose}
          onSpeak={handleSpeak}
          onStopSpeech={handleStopSpeech}
          isSpeaking={isSpeaking}
        />

        <DialogueTextAudio
          text={currentDialogue.text}
          vocabularyHighlights={currentDialogue.vocabularyHighlights}
          onSpeak={handleSpeak}
          isSpeaking={isSpeaking}
        />

        {hasResponses && !hasResponded ? (
          <ResponseOptions
            responses={currentDialogue.responses!}
            onResponseClick={handleResponseClick}
          />
        ) : (
          <ContinueButton onContinue={onClose} />
        )}

        <VocabularyProgress learnedVocabulary={learnedVocabulary} />
      </DialogueBox>
    </DialogueOverlay>
  );
};

export default DialogueSystem;