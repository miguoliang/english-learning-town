import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledMenuButton = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.variant === 'primary' 
    ? props.theme.gradients.primary
    : 'rgba(255, 255, 255, 0.1)'
  };
  color: white;
  border: 2px solid ${props => props.variant === 'primary' ? 'transparent' : 'rgba(255, 255, 255, 0.3)'};
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    background: ${props => props.variant === 'primary' 
      ? props.theme.gradients.primary
      : 'rgba(255, 255, 255, 0.2)'
    };
  }
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface MenuButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  variant = 'secondary',
  onClick,
  disabled = false,
  children
}) => {
  return (
    <StyledMenuButton
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </StyledMenuButton>
  );
};