import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(232, 67, 147, 0.4);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

interface ContinueButtonProps {
  onContinue: () => void;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onContinue }) => {
  return (
    <ButtonContainer>
      <Button
        onClick={onContinue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Continue
      </Button>
    </ButtonContainer>
  );
};