import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { 
  float, 
  happy, 
  excited, 
  thinking, 
  surprised 
} from '../../styles/animations';

const EmojiContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['mood', 'size', 'isAnimating', 'rotation', 'hoverEffect'].includes(prop),
})<{ 
  mood: string;
  size?: string;
  isAnimating?: boolean;
  rotation?: number;
  hoverEffect?: boolean;
}>`
  display: inline-block;
  font-size: ${props => props.size || '2rem'};
  transition: all 0.3s ease;
  transform: rotate(${props => props.rotation || 0}deg);
  
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
  
  ${props => props.hoverEffect && css`
    &:hover {
      transform: scale(1.1) rotate(${props.rotation || 0}deg);
      cursor: pointer;
    }
  `}
`;

export interface AnimatedEmojiProps {
  /** The emoji character to display */
  emoji: string;
  /** Animation mood/style to apply */
  mood?: 'happy' | 'excited' | 'thinking' | 'surprised' | 'floating' | 'normal';
  /** Size of the emoji (CSS font-size value) */
  size?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether to start animation automatically */
  autoAnimate?: boolean;
  /** External trigger for animation */
  triggerAnimation?: boolean;
  /** Rotation angle in degrees */
  rotation?: number;
  /** Enable hover effects */
  hoverEffect?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * AnimatedEmoji - A fun, animated emoji component with multiple moods
 * 
 * Features:
 * - Multiple animation moods (happy, excited, thinking, surprised, floating)
 * - Customizable size
 * - Auto-animation and external triggers
 * - Click interactions
 * - Smooth transitions and hover effects
 */
export const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({
  emoji,
  mood = 'normal',
  size = '2rem',
  onClick,
  autoAnimate = false,
  triggerAnimation = false,
  rotation = 0,
  hoverEffect = true,
  ariaLabel
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
      rotation={rotation}
      hoverEffect={hoverEffect}
      onClick={handleClick}
      title={`Click me! I'm ${mood}!`}
      aria-label={ariaLabel}
      role="generic"
    >
      {emoji}
    </EmojiContainer>
  );
};