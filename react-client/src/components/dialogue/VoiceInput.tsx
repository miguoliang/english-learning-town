import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { AudioManager } from '../../utils/audioManager';

const VoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(212, 144, 74, 0.2);
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(212, 144, 74, 0.1);
  backdrop-filter: blur(4px);
`;

const VoiceControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const VoiceButton = styled.button<{ isListening?: boolean }>`
  background: ${props => props.isListening 
    ? 'rgba(169, 50, 38, 0.9)' 
    : 'rgba(0, 0, 0, 0.6)'};
  border: 1px solid ${props => props.isListening ? '#a93226' : 'rgba(212, 144, 74, 0.6)'};
  color: ${props => props.isListening ? '#ffffff' : '#d4904a'};
  padding: 14px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
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
    background: ${props => props.isListening 
      ? 'rgba(169, 50, 38, 1)' 
      : 'rgba(212, 144, 74, 0.2)'};
    border-color: ${props => props.isListening ? '#a93226' : 'rgba(212, 144, 74, 0.8)'};
    transform: translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(0, 0, 0, 0.4),
      0 3px 6px rgba(212, 144, 74, 0.2);
      
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

const TranscriptDisplay = styled.div`
  min-height: 60px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(212, 144, 74, 0.15);
  border-radius: 10px;
  color: rgba(232, 212, 184, 0.9);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.02em;
  box-shadow: 
    inset 0 2px 6px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(212, 144, 74, 0.05);
  transition: border-color 0.3s;
  
  &:focus-within {
    border-color: rgba(212, 144, 74, 0.3);
  }
`;

const InterimText = styled.span`
  color: rgba(232, 212, 184, 0.5);
  font-style: italic;
`;

const FinalText = styled.span`
  color: #d4904a;
  font-weight: 500;
`;

const StatusText = styled.div`
  font-size: 0.9rem;
  font-weight: 400;
  color: rgba(232, 212, 184, 0.8);
  text-align: center;
  line-height: 1.5;
  letter-spacing: 0.01em;
`;

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  placeholder = "Click 🎤 to speak your response...",
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');
    setStatus('Listening... speak now');

    try {
      await AudioManager.startListening({
        language: 'en-US',
        continuous: false,
        interimResults: true,
        onResult: (text: string, isFinal: boolean) => {
          if (isFinal) {
            setTranscript(text);
            setInterimTranscript('');
            setStatus('Processing...');
            onTranscript(text);
          } else {
            setInterimTranscript(text);
          }
        },
        onError: (error: string) => {
          setStatus(`Error: ${error}`);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
          if (transcript) {
            setStatus('Voice input complete');
          } else {
            setStatus('No speech detected');
          }
        }
      });
    } catch (error) {
      setStatus(`Failed to start listening: ${error}`);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStatus('Stopped listening');
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setStatus('');
  };

  return (
    <VoiceContainer>
      <VoiceControls>
        <VoiceButton 
          onClick={startListening} 
          isListening={isListening}
          disabled={disabled}
        >
          {isListening ? '🔴 Stop' : '🎤 Speak'}
        </VoiceButton>
        {transcript && (
          <VoiceButton onClick={clearTranscript}>
            🗑️ Clear
          </VoiceButton>
        )}
      </VoiceControls>
      
      <TranscriptDisplay>
        {transcript && <FinalText>{transcript}</FinalText>}
        {interimTranscript && <InterimText>{interimTranscript}</InterimText>}
        {!transcript && !interimTranscript && (
          <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            {placeholder}
          </span>
        )}
      </TranscriptDisplay>
      
      {status && <StatusText>{status}</StatusText>}
    </VoiceContainer>
  );
};