import React, { useState } from 'react';
import styled from 'styled-components';
import { getNPCAvatar } from '../../utils/vocabularyHighlighter';
import { AnimatedEmoji } from '@elt/ui';

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

const SpeakerAvatar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSpeaking'].includes(prop),
})<{ isSpeaking?: boolean }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.celebration};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 
    ${({ theme }) => theme.shadows.glow},
    0 6px 16px rgba(255, 107, 107, 0.2);
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  
  ${props => props.isSpeaking && `
    animation: celebration 1s ease-in-out infinite;
    box-shadow: 
      0 0 25px rgba(255, 107, 107, 0.6),
      0 6px 16px rgba(255, 107, 107, 0.3);
  `}
  
  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: ${({ theme }) => theme.gradients.rainbow};
    z-index: -1;
    opacity: 0.4;
    animation: rainbow 3s linear infinite;
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 
      0 0 30px rgba(78, 205, 196, 0.7),
      0 8px 20px rgba(78, 205, 196, 0.3);
  }
`;

const SpeakerName = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(255, 107, 107, 0.2);
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
    transition: color 0.3s ease;
  }
`;

const ControlsHint = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const VoiceModeIndicator = styled.div`
  background: ${({ theme }) => theme.colors.success};
  border: 2px solid ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  width: 14px;
  height: 14px;
  margin-right: 8px;
  animation: pulse 2s infinite;
  box-shadow: 0 0 12px rgba(150, 206, 180, 0.6);
  
  @keyframes pulse {
    0% { 
      transform: scale(1); 
      opacity: 1; 
      box-shadow: 0 0 12px rgba(150, 206, 180, 0.6);
    }
    50% { 
      transform: scale(1.3); 
      opacity: 0.8; 
      box-shadow: 0 0 20px rgba(150, 206, 180, 0.8);
    }
    100% { 
      transform: scale(1); 
      opacity: 1; 
      box-shadow: 0 0 12px rgba(150, 206, 180, 0.6);
    }
  }
`;

const KeyHint = styled.span`
  background: ${({ theme }) => theme.gradients.accent};
  color: ${({ theme }) => theme.colors.surface};
  padding: 6px 10px;
  border-radius: 8px;
  font-family: 'Comic Neue', 'Fredoka One', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  letter-spacing: 0.02em;
  box-shadow: 0 2px 6px rgba(69, 183, 209, 0.3);
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.gradients.warning};
  border: 3px solid ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 234, 167, 0.4);
  
  &:hover {
    background: ${({ theme }) => theme.gradients.magical};
    transform: scale(1.1) rotate(15deg);
    box-shadow: 0 6px 16px rgba(162, 155, 254, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
    animation: wiggle 0.3s ease;
  }
`;

const AudioControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AudioButton = styled.button`
  background: ${({ theme }) => theme.gradients.primary};
  border: 3px solid ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.surface};
  padding: 12px 20px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  box-shadow: 
    ${({ theme }) => theme.shadows.fun},
    0 4px 12px rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
  min-height: 48px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover {
    background: ${({ theme }) => theme.gradients.secondary};
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      ${({ theme }) => theme.shadows.glow},
      0 6px 16px rgba(78, 205, 196, 0.4);
      
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0) scale(1.02);
    animation: bounce 0.3s ease;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    background: ${({ theme }) => theme.colors.textLight};
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
  const [avatarMood, setAvatarMood] = useState<'normal' | 'happy' | 'excited' | 'thinking'>('normal');

  const handleSpeakClick = () => {
    if (onSpeak) {
      const message = `Hello, I am ${speakerName}. Nice to meet you!`;
      onSpeak(message);
      setAvatarMood('excited');
      setTimeout(() => setAvatarMood('normal'), 2000);
    }
  };

  const handleStopClick = () => {
    if (onStopSpeech) {
      onStopSpeech();
      setAvatarMood('normal');
    }
  };

  const handleAvatarClick = () => {
    setAvatarMood('happy');
    setTimeout(() => setAvatarMood('normal'), 1000);
  };

  return (
    <Header>
      <SpeakerInfo>
        <SpeakerAvatar isSpeaking={isSpeaking} onClick={handleAvatarClick}>
          <AnimatedEmoji 
            emoji={getNPCAvatar(npcId)}
            mood={isSpeaking ? 'excited' : avatarMood}
            size="2.2rem"
            autoAnimate={isSpeaking}
            triggerAnimation={avatarMood !== 'normal'}
          />
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