import React from 'react';
import styled from 'styled-components';

const StyledMenuButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop),
})<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.variant === 'primary'
    ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
    : 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)'
  };
  color: white;
  min-width: 200px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    background: ${props => props.variant === 'primary'
      ? 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)'
      : 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)'
    };
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    min-width: 160px;
  }
`;

interface MenuButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <StyledMenuButton
      variant={variant}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </StyledMenuButton>
  );
};