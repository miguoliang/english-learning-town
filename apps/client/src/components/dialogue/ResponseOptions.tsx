import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import type { DialogueResponse } from '../../types';
import { VoiceInput } from './VoiceInput';
import { AudioManager } from '../../utils/audioManager';
import { AnimatedEmoji } from '@elt/ui';
import { logger } from '../../utils/logger';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 30px;
`;

const VoiceSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(255, 107, 107, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const celebrationPop = keyframes`
  0% {
    transform: scale(0.5) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const sparkleAnimation = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    box-shadow: 0 0 10px rgba(150, 206, 180, 0.6);
  }
  25% {
    transform: scale(1.05) rotate(5deg);
    box-shadow: 0 0 20px rgba(150, 206, 180, 0.8);
  }
  50% {
    transform: scale(1.1) rotate(0deg);
    box-shadow: 0 0 15px rgba(150, 206, 180, 0.7);
  }
  75% {
    transform: scale(1.05) rotate(-5deg);
    box-shadow: 0 0 20px rgba(150, 206, 180, 0.8);
  }
`;

const MatchedResponse = styled.div`
  padding: 16px 20px;
  background: ${({ theme }) => theme.gradients.success};
  border: 3px solid ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 16px;
  animation: ${celebrationPop} 0.6s ease-out, ${sparkleAnimation} 2s ease-in-out 0.6s;
  box-shadow: 
    ${({ theme }) => theme.shadows.fun},
    0 6px 20px rgba(150, 206, 180, 0.4);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s ease-in-out 0.8s;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const VoicePrompts = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(212, 144, 74, 0.1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const PromptsTitle = styled.h4`
  color: ${({ theme }) => theme.colors.secondary};
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(78, 205, 196, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PromptItem = styled.div<{ isHighlighted?: boolean }>`
  padding: 16px 20px;
  background: ${props => props.isHighlighted 
    ? 'rgba(212, 144, 74, 0.15)' 
    : 'rgba(0, 0, 0, 0.3)'};
  border: 1px solid ${props => props.isHighlighted 
    ? 'rgba(212, 144, 74, 0.5)' 
    : 'rgba(212, 144, 74, 0.2)'};
  border-radius: 10px;
  color: ${props => props.isHighlighted 
    ? 'rgba(232, 212, 184, 1)' 
    : 'rgba(232, 212, 184, 0.85)'};
  font-size: 0.95rem;
  font-weight: ${props => props.isHighlighted ? 500 : 400};
  line-height: 1.6;
  letter-spacing: 0.02em;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(212, 144, 74, 0.05);
  cursor: pointer;
  
  &::before {
    content: ${props => props.isHighlighted ? "'🔊'" : "'💬'"};
    margin-right: 12px;
    opacity: ${props => props.isHighlighted ? 1 : 0.6};
    transition: opacity 0.3s;
  }
  
  &:hover {
    background: rgba(212, 144, 74, 0.05);
    border-color: rgba(212, 144, 74, 0.3);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.3),
      0 2px 4px rgba(212, 144, 74, 0.1);
      
    &::before {
      opacity: 0.8;
    }
  }
`;

const PromptHint = styled.div`
  font-size: 0.85rem;
  font-weight: 400;
  color: rgba(232, 212, 184, 0.6);
  margin-top: 12px;
  font-style: italic;
  text-align: center;
  line-height: 1.5;
  letter-spacing: 0.01em;
`;


interface ResponseOptionsProps {
  responses: DialogueResponse[];
  onResponseClick: (response: DialogueResponse) => void;
}

export const ResponseOptions: React.FC<ResponseOptionsProps> = ({
  responses,
  onResponseClick,
}) => {
  const [matchedResponse, setMatchedResponse] = useState<DialogueResponse | null>(null);
  const [currentlyReading, setCurrentlyReading] = useState<string | null>(null);

  const findBestMatch = (transcript: string): DialogueResponse | null => {
    if (!transcript.trim()) return null;
    
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // First, try exact matches
    for (const response of responses) {
      if (response.text.toLowerCase().includes(lowerTranscript) || 
          lowerTranscript.includes(response.text.toLowerCase())) {
        return response;
      }
    }
    
    // Then try keyword matching
    const transcriptWords = lowerTranscript.split(/\s+/);
    let bestMatch: DialogueResponse | null = null;
    let bestScore = 0;
    
    for (const response of responses) {
      const responseWords = response.text.toLowerCase().split(/\s+/);
      let score = 0;
      
      for (const transcriptWord of transcriptWords) {
        for (const responseWord of responseWords) {
          if (transcriptWord.length > 2 && responseWord.includes(transcriptWord)) {
            score += transcriptWord.length;
          }
          if (responseWord.length > 2 && transcriptWord.includes(responseWord)) {
            score += responseWord.length;
          }
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = response;
      }
    }
    
    return bestScore > 3 ? bestMatch : null;
  };

  const handleVoiceTranscript = (transcript: string) => {
    const match = findBestMatch(transcript);
    setMatchedResponse(match);
    
    if (match) {
      // Play success sound and announce match
      AudioManager.playSuccess();
      AudioManager.speakText(`Selected: ${match.text}`);
      
      setTimeout(() => {
        onResponseClick(match);
      }, 1500);
    } else if (transcript.trim()) {
      // Play error sound for unmatched input
      AudioManager.playError();
      AudioManager.speakText("I didn't quite catch that. Please try saying one of the available options.");
    }
  };

  // Handle clicking on a prompt to hear it read aloud
  const handlePromptClick = async (response: DialogueResponse) => {
    if (currentlyReading === response.id) {
      // Stop current reading
      AudioManager.stopSpeech();
      setCurrentlyReading(null);
    } else {
      // Start reading this response
      setCurrentlyReading(response.id);
      AudioManager.playClick();
      
      try {
        await AudioManager.speakText(response.text);
        setCurrentlyReading(null);
      } catch (error) {
        logger.error('Error reading response:', error);
        setCurrentlyReading(null);
      }
    }
  };

  // Auto-read available options when component mounts
  useEffect(() => {
    const readOptions = async () => {
      if (responses.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Brief delay
        
        const optionsText = responses.length === 1 
          ? `You can say: ${responses[0].text}`
          : `You have ${responses.length} options. ${responses.map(r => r.text).join(', or ')}.`;
        
        AudioManager.speakText(optionsText);
      }
    };

    readOptions();
  }, [responses]);

  useEffect(() => {
    setMatchedResponse(null);
    setCurrentlyReading(null);
  }, [responses]);

  return (
    <OptionsContainer>
      <VoiceSection>
        <SectionTitle>
          <AnimatedEmoji emoji="🎤" mood="floating" size="1.3rem" />
          Speak Your Answer!
        </SectionTitle>
        <VoiceInput 
          onTranscript={handleVoiceTranscript}
          placeholder="Say your response... (e.g., 'Yes, I'm excited' or 'I need help')"
        />
        {matchedResponse && (
          <MatchedResponse>
            <AnimatedEmoji 
              emoji="🎉" 
              mood="excited" 
              size="1.5rem"
              autoAnimate={true}
            />
            <span>Great choice! You said: "{matchedResponse.text}"</span>
            <AnimatedEmoji 
              emoji="⭐" 
              mood="floating" 
              size="1.3rem"
            />
          </MatchedResponse>
        )}
      </VoiceSection>
      
      <VoicePrompts>
        <PromptsTitle>
          <AnimatedEmoji emoji="💭" mood="thinking" size="1.3rem" />
          Try saying these words:
        </PromptsTitle>
        <PromptList>
          {responses.map((response) => (
            <PromptItem 
              key={response.id}
              isHighlighted={currentlyReading === response.id}
              onClick={() => handlePromptClick(response)}
              title="Click to hear this option read aloud"
            >
              {response.text}
            </PromptItem>
          ))}
        </PromptList>
        <PromptHint>
          💡 Speak naturally - you don't need to say the exact words above<br />
          🔊 Click any option to hear it read aloud
        </PromptHint>
      </VoicePrompts>
    </OptionsContainer>
  );
};