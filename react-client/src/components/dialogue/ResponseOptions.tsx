import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { DialogueResponse } from '../../types';
import { VoiceInput } from './VoiceInput';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 30px;
`;

const VoiceSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  color: #74b9ff;
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  font-weight: 600;
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
  margin-top: 16px;
`;

const PromptsTitle = styled.h4`
  color: #74b9ff;
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PromptItem = styled.div`
  padding: 10px 12px;
  background: rgba(116, 185, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 6px;
  color: #ddd;
  font-size: 0.85rem;
  line-height: 1.3;
  position: relative;
  
  &::before {
    content: '💬';
    margin-right: 8px;
    opacity: 0.7;
  }
`;

const PromptHint = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
  font-style: italic;
  text-align: center;
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
  const [voiceTranscript, setVoiceTranscript] = useState('');

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
    setVoiceTranscript(transcript);
    const match = findBestMatch(transcript);
    setMatchedResponse(match);
    
    if (match) {
      setTimeout(() => {
        onResponseClick(match);
      }, 1500);
    }
  };

  useEffect(() => {
    setMatchedResponse(null);
    setVoiceTranscript('');
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
          {responses.map((response, index) => (
            <PromptItem key={response.id}>
              {response.text}
            </PromptItem>
          ))}
        </PromptList>
        <PromptHint>
          Speak naturally - you don't need to say the exact words above
        </PromptHint>
      </VoicePrompts>
    </OptionsContainer>
  );
};