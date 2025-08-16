import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { DialogueResponse } from '../../types';
import { VoiceInput } from './VoiceInput';
import { AudioManager } from '../../utils/audioManager';

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
  color: #d4904a;
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  line-height: 1.4;
`;

const MatchedResponse = styled.div`
  padding: 12px;
  background: rgba(0, 184, 148, 0.2);
  border: 1px solid #00b894;
  border-radius: 8px;
  color: #00b894;
  font-weight: 500;
  margin-bottom: 12px;
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
  color: #d4904a;
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  line-height: 1.4;
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
        console.error('Error reading response:', error);
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
        <SectionTitle>🎤 Voice Response</SectionTitle>
        <VoiceInput 
          onTranscript={handleVoiceTranscript}
          placeholder="Say your response... (e.g., 'Yes, I'm excited' or 'I need help')"
        />
        {matchedResponse && (
          <MatchedResponse>
            ✅ Matched: "{matchedResponse.text}"
          </MatchedResponse>
        )}
      </VoiceSection>
      
      <VoicePrompts>
        <PromptsTitle>💭 You can say:</PromptsTitle>
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