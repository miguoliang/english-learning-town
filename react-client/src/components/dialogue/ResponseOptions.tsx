import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { DialogueResponse } from '../../types';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResponseButton = styled(motion.button)<{ isCorrect?: boolean; isSelected?: boolean }>`
  background: ${props => {
    if (props.isCorrect) return 'linear-gradient(135deg, #00b894 0%, #00a085 100%)';
    if (props.isSelected) return 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)';
    return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
  }};
  border: ${props => props.isSelected ? '2px solid #ffffff' : 'none'};
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  transform: ${props => props.isSelected ? 'translateX(8px) scale(1.02)' : 'translateX(0)'};
  box-shadow: ${props => props.isSelected 
    ? '0 6px 20px rgba(232, 67, 147, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  
  &:hover {
    transform: ${props => props.isSelected ? 'translateX(8px) scale(1.02)' : 'translateX(4px)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {response.text}
        </ResponseButton>
      ))}
    </OptionsContainer>
  );
};