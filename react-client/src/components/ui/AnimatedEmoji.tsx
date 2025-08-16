import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(2deg); }
  50% { transform: translateY(-3px) rotate(0deg); }
  75% { transform: translateY(-7px) rotate(-2deg); }
`;

const happy = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(5deg); }
  50% { transform: scale(1.15) rotate(0deg); }
  75% { transform: scale(1.1) rotate(-5deg); }
`;

const excited = keyframes`
  0% { transform: scale(1) translateY(0); }
  25% { transform: scale(1.2) translateY(-10px); }
  50% { transform: scale(1.1) translateY(0); }
  75% { transform: scale(1.2) translateY(-5px); }
  100% { transform: scale(1) translateY(0); }
`;

const thinking = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-10deg) scale(1.05); }
  75% { transform: rotate(10deg) scale(1.05); }
`;

const surprised = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const EmojiContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['mood', 'size', 'isAnimating'].includes(prop),
})<{ 
  mood: string;
  size?: string;
  isAnimating?: boolean;
}>`
  display: inline-block;
  font-size: ${props => props.size || '2rem'};
  transition: all 0.3s ease;
  
  ${props => props.isAnimating && props.mood === 'happy' && css`
    animation: ${happy} 1s ease-in-out;
  `}
  
  ${props => props.isAnimating && props.mood === 'excited' && css`
    animation: ${excited} 0.8s ease-in-out;
  `}
  
  ${props => props.isAnimating && props.mood === 'thinking' && css`
    animation: ${thinking} 2s ease-in-out infinite;
  `}
  
  ${props => props.isAnimating && props.mood === 'surprised' && css`
    animation: ${surprised} 0.6s ease-in-out;
  `}
  
  ${props => props.mood === 'floating' && css`
    animation: ${float} 3s ease-in-out infinite;
  `}
  
  &:hover {
    transform: scale(1.1);
    cursor: pointer;
  }
`;

interface AnimatedEmojiProps {
  emoji: string;
  mood?: 'happy' | 'excited' | 'thinking' | 'surprised' | 'floating' | 'normal';
  size?: string;
  onClick?: () => void;
  autoAnimate?: boolean;
  triggerAnimation?: boolean;
}

export const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({
  emoji,
  mood = 'normal',
  size = '2rem',
  onClick,
  autoAnimate = false,
  triggerAnimation = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (triggerAnimation) {
      setIsAnimating(true);
      const duration = mood === 'thinking' ? 2000 : mood === 'excited' ? 800 : 1000;
      setTimeout(() => setIsAnimating(false), duration);
    }
  }, [triggerAnimation, mood]);

  useEffect(() => {
    if (autoAnimate) {
      setIsAnimating(true);
    }
  }, [autoAnimate]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Trigger animation on click
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <EmojiContainer
      mood={mood}
      size={size}
      isAnimating={isAnimating}
      onClick={handleClick}
      title={`Click me! I'm ${mood}!`}
    >
      {emoji}
    </EmojiContainer>
  );
};