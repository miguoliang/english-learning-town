import React from 'react';
import styled from 'styled-components';
import type { DialogueResponse } from '../../types';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 30px;
`;

const ResponseButton = styled.button<{ isCorrect?: boolean; isSelected?: boolean }>`
  background: ${props => {
    if (props.isCorrect) return 'linear-gradient(135deg, #00b894 0%, #00a085 100%)';
    if (props.isSelected) return 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)';
    return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
  }};
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: ${props => props.isSelected 
    ? '0 6px 20px rgba(232, 67, 147, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  
  &::before {
    content: '👉';
    position: absolute;
    left: -30px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    opacity: ${props => props.isSelected ? 1 : 0};
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface ResponseOptionsProps {
  responses: DialogueResponse[];
  selectedIndex: number;
  onResponseClick: (response: DialogueResponse) => void;
}

export const ResponseOptions: React.FC<ResponseOptionsProps> = ({
  responses,
  selectedIndex,
  onResponseClick,
}) => {
  return (
    <OptionsContainer>
      {responses.map((response, index) => (
        <ResponseButton
          key={response.id}
          onClick={() => onResponseClick(response)}
          isSelected={index === selectedIndex}
        >
          {response.text}
        </ResponseButton>
      ))}
    </OptionsContainer>
  );
};