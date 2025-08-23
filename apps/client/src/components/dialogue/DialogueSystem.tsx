// Refactored Dialogue System Component with Single Responsibility Principle

import React from "react";
import styled from "styled-components";
import { useDialogueState } from "../../hooks/useDialogueState";
import { useDialogueKeyboard } from "../../hooks/useDialogueKeyboard";
import { useEyeBreakReminder } from "../../hooks/useEyeBreakReminder";
import { DialogueHeader } from "./DialogueHeader";
import { DialogueTextAudio } from "./DialogueTextAudio";
import { ResponseOptions } from "./ResponseOptions";
import { ContinueButton } from "./ContinueButton";
import { VocabularyProgress } from "./VocabularyProgress";
import { EyeBreakReminder } from "./EyeBreakReminder";
import { BrightnessControl } from "./BrightnessControl";
import { VoiceGuidance } from "./VoiceGuidance";

const DialogueOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(3px);
`;

const DialogueBox = styled.div`
  background: linear-gradient(135deg, #0a0906 0%, #1a1612 100%);
  border: 2px solid rgba(212, 144, 74, 0.6);
  border-radius: 20px 20px 0 0;
  width: 90%;
  max-width: 820px;
  min-height: 220px;
  padding: 32px;
  box-shadow:
    0 -20px 60px rgba(0, 0, 0, 0.9),
    0 -8px 25px rgba(212, 144, 74, 0.1),
    inset 0 1px 0 rgba(212, 144, 74, 0.2);
  backdrop-filter: blur(8px);
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

interface DialogueSystemProps {
  npcId: string;
  onClose: () => void;
}

export const DialogueSystem: React.FC<DialogueSystemProps> = ({
  npcId,
  onClose,
}) => {
  const [showVoiceGuidance, setShowVoiceGuidance] = React.useState(true);
  const [guidanceContext, setGuidanceContext] = React.useState<
    "dialogue-start" | "response-options"
  >("dialogue-start");

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
    onClose,
  });

  // Eye break reminder system
  const {
    showBlinkReminder,
    showBreakReminder,
    startTracking,
    stopTracking,
    acknowledgeBlinkReminder,
    acknowledgeBreakReminder,
    getSessionStats,
  } = useEyeBreakReminder();

  // Start eye break tracking when dialogue opens
  React.useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  // Handle voice guidance context changes
  React.useEffect(() => {
    if (currentDialogue) {
      const hasResponses =
        currentDialogue.responses && currentDialogue.responses.length > 0;
      if (hasResponses && !hasResponded) {
        // Show guidance when response options are available
        setTimeout(() => {
          setGuidanceContext("response-options");
          setShowVoiceGuidance(true);
        }, 2000); // Show after dialogue has been read
      }
    }
  }, [currentDialogue, hasResponded]);

  if (!currentDialogue) {
    return null;
  }

  const hasResponses =
    currentDialogue.responses && currentDialogue.responses.length > 0;

  return (
    <>
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

      <EyeBreakReminder
        showBlinkReminder={showBlinkReminder}
        showBreakReminder={showBreakReminder}
        onAcknowledgeBlink={acknowledgeBlinkReminder}
        onAcknowledgeBreak={acknowledgeBreakReminder}
        sessionStats={getSessionStats()}
      />

      <BrightnessControl isVisible={true} />

      <VoiceGuidance
        context={guidanceContext}
        isVisible={showVoiceGuidance}
        onDismiss={() => setShowVoiceGuidance(false)}
        autoHide={8000}
      />
    </>
  );
};

export default DialogueSystem;
