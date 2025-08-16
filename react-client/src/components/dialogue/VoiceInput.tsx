import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { AudioManager } from '../../utils/audioManager';

const VoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(116, 185, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 8px;
`;

const VoiceControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VoiceButton = styled.button<{ isListening?: boolean }>`
  background: ${props => props.isListening 
    ? 'rgba(231, 76, 60, 0.8)' 
    : 'rgba(116, 185, 255, 0.8)'};
  border: 1px solid ${props => props.isListening ? '#e74c3c' : '#74b9ff'};
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.isListening 
      ? 'rgba(231, 76, 60, 1)' 
      : 'rgba(116, 185, 255, 1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TranscriptDisplay = styled.div`
  min-height: 40px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #ddd;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const InterimText = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
`;

const FinalText = styled.span`
  color: #74b9ff;
  font-weight: 500;
`;

const StatusText = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
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