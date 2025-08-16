import React from 'react';
import styled from 'styled-components';
import { getNPCAvatar } from '../../utils/vocabularyHighlighter';
import { AudioManager } from '../../utils/audioManager';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(212, 144, 74, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(212, 144, 74, 0.1) 50%, transparent 100%);
  }
`;

const SpeakerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SpeakerAvatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4904a 0%, #b8783a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  border: 2px solid rgba(212, 144, 74, 0.6);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(212, 144, 74, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(212, 144, 74, 0.3), transparent);
    z-index: -1;
  }
`;

const SpeakerName = styled.h3`
  color: #d4904a;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  line-height: 1.4;
`;

const ControlsHint = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(232, 212, 184, 0.6);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  position: relative;
`;

const VoiceModeIndicator = styled.div`
  background: #00b894;
  border: 2px solid #0a0906;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  animation: pulse 2s infinite;
  box-shadow: 0 0 8px rgba(0, 184, 148, 0.4);
  
  @keyframes pulse {
    0% { 
      transform: scale(1); 
      opacity: 1; 
      box-shadow: 0 0 8px rgba(0, 184, 148, 0.4);
    }
    50% { 
      transform: scale(1.2); 
      opacity: 0.8; 
      box-shadow: 0 0 16px rgba(0, 184, 148, 0.6);
    }
    100% { 
      transform: scale(1); 
      opacity: 1; 
      box-shadow: 0 0 8px rgba(0, 184, 148, 0.4);
    }
  }
`;

const KeyHint = styled.span`
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(212, 144, 74, 0.3);
  letter-spacing: 0.02em;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(232, 212, 184, 0.8);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
    color: rgba(232, 212, 184, 1);
  }
`;

const AudioControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AudioButton = styled.button`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(212, 144, 74, 0.6);
  color: #d4904a;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(212, 144, 74, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(212, 144, 74, 0.1), transparent);
    transition: left 0.6s;
  }
  
  &:hover {
    background: rgba(212, 144, 74, 0.2);
    border-color: rgba(212, 144, 74, 0.8);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.4),
      0 2px 4px rgba(212, 144, 74, 0.2);
      
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

interface DialogueHeaderProps {
  npcId: string;
  speakerName: string;
  onClose: () => void;
  onSpeak?: (text: string) => void;
  onStopSpeech?: () => void;
  isSpeaking?: boolean;
}

export const DialogueHeader: React.FC<DialogueHeaderProps> = ({
  npcId,
  speakerName,
  onClose,
  onSpeak,
  onStopSpeech,
  isSpeaking = false,
}) => {
  const handleSpeakClick = () => {
    if (onSpeak) {
      const message = `Hello, I am ${speakerName}. Nice to meet you!`;
      onSpeak(message);
    }
  };

  const handleStopClick = () => {
    if (onStopSpeech) {
      onStopSpeech();
    }
  };

  return (
    <Header>
      <SpeakerInfo>
        <SpeakerAvatar>
          {getNPCAvatar(npcId)}
        </SpeakerAvatar>
        <SpeakerName>{speakerName}</SpeakerName>
      </SpeakerInfo>
      <AudioControls>
        {onSpeak && (
          <AudioButton 
            onClick={handleSpeakClick}
            disabled={isSpeaking}
            title="Hear the speaker's voice"
          >
            🔊 Speak
          </AudioButton>
        )}
        {onStopSpeech && (
          <AudioButton 
            onClick={handleStopClick}
            disabled={!isSpeaking}
          >
            🔇 Stop
          </AudioButton>
        )}
      </AudioControls>
      <ControlsHint>
        <VoiceModeIndicator title="Voice mode active" />
        <KeyHint>🎤</KeyHint>
        <KeyHint>ESC</KeyHint>
        voice controls
      </ControlsHint>
      <CloseButton onClick={onClose}>×</CloseButton>
    </Header>
  );
};