import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInOut = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  10% { opacity: 1; transform: scale(1); }
  90% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.9); }
`;

const breatheAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const BlinkReminderOverlay = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid rgba(212, 144, 74, 0.8);
  border-radius: 12px;
  padding: 16px 20px;
  z-index: 4000;
  animation: ${fadeInOut} 4s ease-in-out;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.6),
    0 4px 8px rgba(212, 144, 74, 0.2);
`;

const BreakReminderOverlay = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #0a0906 0%, #1a1612 100%);
  border: 2px solid rgba(212, 144, 74, 0.8);
  border-radius: 16px;
  padding: 32px;
  z-index: 5000;
  backdrop-filter: blur(12px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.8),
    0 8px 25px rgba(212, 144, 74, 0.1);
  animation: ${breatheAnimation} 3s ease-in-out infinite;
  max-width: 400px;
  text-align: center;
`;

const BlinkText = styled.div`
  color: rgba(232, 212, 184, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '👁️';
    font-size: 1.2rem;
  }
`;

const BreakTitle = styled.h3`
  color: #d4904a;
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &::before {
    content: '🌅';
    font-size: 1.5rem;
  }
`;

const BreakText = styled.p`
  color: rgba(232, 212, 184, 0.8);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 24px 0;
`;

const Rule2020 = styled.div`
  background: rgba(212, 144, 74, 0.1);
  border: 1px solid rgba(212, 144, 74, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-size: 0.9rem;
  color: rgba(232, 212, 184, 0.7);
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary 
    ? 'rgba(212, 144, 74, 0.8)' 
    : 'rgba(0, 0, 0, 0.6)'};
  border: 1px solid rgba(212, 144, 74, 0.6);
  color: ${props => props.primary ? '#0a0906' : '#d4904a'};
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.primary 
      ? 'rgba(212, 144, 74, 1)' 
      : 'rgba(212, 144, 74, 0.2)'};
    transform: translateY(-1px);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #d4904a, #b8783a);
  border-radius: 2px;
  width: ${props => props.progress}%;
  transition: width 1s ease;
`;

interface EyeBreakReminderProps {
  showBlinkReminder: boolean;
  showBreakReminder: boolean;
  onAcknowledgeBlink: () => void;
  onAcknowledgeBreak: (taken: boolean) => void;
  sessionStats: {
    readingTimeMinutes: number;
    totalTimeMinutes: number;
    blinkRemindersShown: number;
    nextBreakIn: number;
  };
}

export const EyeBreakReminder: React.FC<EyeBreakReminderProps> = ({
  showBlinkReminder,
  showBreakReminder,
  onAcknowledgeBlink,
  onAcknowledgeBreak,
  sessionStats,
}) => {
  const [blinkCountdown, setBlinkCountdown] = useState(4);

  // Auto-dismiss blink reminder after 4 seconds
  useEffect(() => {
    if (showBlinkReminder) {
      setBlinkCountdown(4);
      const timer = setInterval(() => {
        setBlinkCountdown(prev => {
          if (prev <= 1) {
            onAcknowledgeBlink();
            return 4;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showBlinkReminder, onAcknowledgeBlink]);

  if (showBlinkReminder) {
    return (
      <BlinkReminderOverlay>
        <BlinkText>
          Remember to blink naturally
        </BlinkText>
        <ProgressBar>
          <ProgressFill progress={(4 - blinkCountdown) * 25} />
        </ProgressBar>
      </BlinkReminderOverlay>
    );
  }

  if (showBreakReminder) {
    return (
      <BreakReminderOverlay>
        <BreakTitle>
          Time for an Eye Break!
        </BreakTitle>
        
        <BreakText>
          You've been reading for {sessionStats.readingTimeMinutes} minutes. 
          Consider taking a break to rest your eyes.
        </BreakText>

        <Rule2020>
          <strong>20-20-20 Rule:</strong><br />
          Look at something 20 feet away for at least 20 seconds
        </Rule2020>

        <ButtonGroup>
          <ActionButton 
            primary 
            onClick={() => onAcknowledgeBreak(true)}
          >
            Taking a break
          </ActionButton>
          <ActionButton 
            onClick={() => onAcknowledgeBreak(false)}
          >
            Continue reading
          </ActionButton>
        </ButtonGroup>
      </BreakReminderOverlay>
    );
  }

  return null;
};