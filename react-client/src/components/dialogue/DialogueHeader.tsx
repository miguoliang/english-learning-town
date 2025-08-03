import React from 'react';
import styled from 'styled-components';
import { getNPCAvatar } from '../../utils/vocabularyHighlighter';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(116, 185, 255, 0.3);
`;

const SpeakerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SpeakerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 2px solid #74b9ff;
`;

const SpeakerName = styled.h3`
  color: #74b9ff;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const ControlsHint = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const KeyHint = styled.span`
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

interface DialogueHeaderProps {
  npcId: string;
  speakerName: string;
  onClose: () => void;
}

export const DialogueHeader: React.FC<DialogueHeaderProps> = ({
  npcId,
  speakerName,
  onClose,
}) => {
  return (
    <Header>
      <SpeakerInfo>
        <SpeakerAvatar>
          {getNPCAvatar(npcId)}
        </SpeakerAvatar>
        <SpeakerName>{speakerName}</SpeakerName>
      </SpeakerInfo>
      <ControlsHint>
        <KeyHint>↑↓</KeyHint>
        <KeyHint>ENTER</KeyHint>
        <KeyHint>ESC</KeyHint>
        controls
      </ControlsHint>
      <CloseButton onClick={onClose}>×</CloseButton>
    </Header>
  );
};