import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AudioManager } from "../../utils/audioManager";

const GuidanceOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid rgba(212, 144, 74, 0.6);
  border-radius: 12px;
  padding: 16px 20px;
  z-index: 3600;
  backdrop-filter: blur(8px);
  max-width: 320px;
  transform: ${(props) =>
    props.isVisible ? "translateY(0)" : "translateY(100%)"};
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.7),
    0 4px 8px rgba(212, 144, 74, 0.2);
`;

const GuidanceTitle = styled.h4`
  color: #d4904a;
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GuidanceText = styled.p`
  color: rgba(232, 212, 184, 0.9);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  font-weight: 400;
`;

const GuidanceAction = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  background: ${(props) =>
    props.primary ? "rgba(212, 144, 74, 0.8)" : "rgba(0, 0, 0, 0.6)"};
  border: 1px solid rgba(212, 144, 74, 0.6);
  color: ${(props) => (props.primary ? "#0a0906" : "#d4904a")};
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background: ${(props) =>
      props.primary ? "rgba(212, 144, 74, 1)" : "rgba(212, 144, 74, 0.2)"};
  }
`;

interface VoiceGuidanceProps {
  context:
    | "dialogue-start"
    | "response-options"
    | "voice-input"
    | "error"
    | "success";
  customMessage?: string;
  isVisible?: boolean;
  onDismiss?: () => void;
  autoHide?: number; // ms
}

const GUIDANCE_MESSAGES = {
  "dialogue-start": {
    title: "🎧 Voice Mode Active",
    text: "This conversation is optimized for voice interaction. Listen carefully and respond naturally.",
    actions: ["Got it"],
  },
  "response-options": {
    title: "🗣️ Response Options",
    text: "You can speak your response naturally, or click any option to hear it read aloud first.",
    actions: ["Understood"],
  },
  "voice-input": {
    title: "🎤 Voice Input",
    text: "Press the microphone button and speak clearly. You don't need to match the exact wording.",
    actions: ["Start Speaking", "Skip Guide"],
  },
  error: {
    title: "❌ Not Recognized",
    text: "I didn't understand that. Try speaking more clearly or clicking an option to hear it first.",
    actions: ["Try Again", "Listen to Options"],
  },
  success: {
    title: "✅ Response Matched",
    text: "Great! Your voice input was recognized and matched to a response.",
    actions: ["Continue"],
  },
};

export const VoiceGuidance: React.FC<VoiceGuidanceProps> = ({
  context,
  customMessage,
  isVisible = true,
  onDismiss,
  autoHide,
}) => {
  const [shouldShow, setShouldShow] = useState(isVisible);
  const [hasBeenShown, setHasBeenShown] = useState<Set<string>>(
    () =>
      new Set(JSON.parse(localStorage.getItem("voiceGuidanceShown") || "[]")),
  );

  const guidance = customMessage
    ? { title: "💬 Voice Guidance", text: customMessage, actions: ["OK"] }
    : GUIDANCE_MESSAGES[context];

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && shouldShow) {
      const timer = setTimeout(() => {
        setShouldShow(false);
        onDismiss?.();
      }, autoHide);
      return () => clearTimeout(timer);
    }
  }, [autoHide, shouldShow, onDismiss]);

  // Check if this guidance has been shown before
  useEffect(() => {
    if (!customMessage && hasBeenShown.has(context)) {
      setShouldShow(false);
      return;
    }

    if (isVisible && guidance) {
      setShouldShow(true);

      // Auto-read guidance message
      setTimeout(() => {
        AudioManager.speakText(`${guidance.title}. ${guidance.text}`);
      }, 300);
    }
  }, [context, isVisible, guidance, hasBeenShown, customMessage]);

  const handleAction = (action: string) => {
    if (action === "Start Speaking") {
      // Trigger voice input
      onDismiss?.();
    } else if (action === "Listen to Options") {
      // This would trigger reading all available options
      onDismiss?.();
    } else {
      // Default dismiss action
      setShouldShow(false);
      onDismiss?.();
    }

    // Mark this guidance as shown (except for error/success which can repeat)
    if (!["error", "success"].includes(context) && !customMessage) {
      const newShown = new Set(hasBeenShown);
      newShown.add(context);
      setHasBeenShown(newShown);
      localStorage.setItem("voiceGuidanceShown", JSON.stringify([...newShown]));
    }
  };

  if (!guidance || !shouldShow) return null;

  return (
    <GuidanceOverlay isVisible={shouldShow}>
      <GuidanceTitle>{guidance.title}</GuidanceTitle>

      <GuidanceText>{guidance.text}</GuidanceText>

      <GuidanceAction>
        {guidance.actions.map((action, index) => (
          <ActionButton
            key={action}
            primary={index === 0}
            onClick={() => handleAction(action)}
          >
            {action}
          </ActionButton>
        ))}
      </GuidanceAction>
    </GuidanceOverlay>
  );
};
