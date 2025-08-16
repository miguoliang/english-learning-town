import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AnimatedEmoji } from './AnimatedEmoji';

const buttonBounce = keyframes`
  0% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.05) translateY(-3px); }
  100% { transform: scale(1) translateY(0); }
`;

const hoverPulse = keyframes`
  0% { 
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4), 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6), 0 0 0 8px rgba(255, 107, 107, 0.1);
  }
  100% {
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4), 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
`;

const StyledMenuButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop),
})<{ variant?: 'primary' | 'secondary' }>`
  padding: 1.5rem 2.5rem;
  font-size: 1.4rem;
  font-weight: 700;
  font-family: 'Comic Neue', 'Fredoka One', sans-serif;
  border: 4px solid ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  background: ${props => props.variant === 'primary'
    ? props.theme.gradients.primary
    : props.theme.gradients.secondary
  };
  color: ${({ theme }) => theme.colors.surface};
  min-width: 280px;
  min-height: 70px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 
    ${({ theme }) => theme.shadows.fun},
    0 6px 20px rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    animation: ${hoverPulse} 1.5s ease-in-out infinite;
    background: ${props => props.variant === 'primary'
      ? props.theme.gradients.magical
      : props.theme.gradients.ocean
    };
    border-color: ${({ theme }) => theme.colors.accent};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(0.98);
    animation: ${buttonBounce} 0.3s ease;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: ${({ theme }) => theme.shadows.small};
    background: ${({ theme }) => theme.colors.textLight};
    
    &:hover {
      animation: none;
      transform: none;
    }
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 1.2rem 2rem;
    font-size: 1.2rem;
    min-width: 240px;
    min-height: 60px;
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
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 300);
      onClick();
    }
  };

  // Extract emoji and text from children
  const parseContent = (content: React.ReactNode): { emoji: string; text: string } => {
    const text = String(content);
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    const emoji = text.match(emojiRegex)?.[0] || '🎮';
    const cleanText = text.replace(emojiRegex, '').trim();
    return { emoji, text: cleanText };
  };

  const { emoji, text } = parseContent(children);

  return (
    <StyledMenuButton
      variant={variant}
      onClick={handleClick}
      disabled={disabled}
    >
      <AnimatedEmoji 
        emoji={emoji}
        mood={isClicked ? 'excited' : variant === 'primary' ? 'happy' : 'normal'}
        size="1.8rem"
        triggerAnimation={isClicked}
      />
      <span>{text}</span>
    </StyledMenuButton>
  );
};