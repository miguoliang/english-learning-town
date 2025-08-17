import React, { useState } from 'react';
import { AnimatedEmoji } from './AnimatedEmoji';
import { parseEmojiContent } from '../../utils/emojiParser';
import { StyledButton, type ButtonVariant, type ButtonSize } from './ButtonStyles';

export interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button should take full width */
  fullWidth?: boolean;
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Whether to show an emoji with animation */
  showEmoji?: boolean;
  /** Custom emoji to display (auto-detected from children if not provided) */
  emoji?: string;
}

/**
 * Button - A versatile, animated button component
 * 
 * Features:
 * - Multiple variants (primary, secondary, outline, ghost)
 * - Three sizes (sm, md, lg)
 * - Auto-emoji detection and animation
 * - Shine effect on hover
 * - Bounce animation on click
 * - Responsive design
 * - Full accessibility support
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  type = 'button',
  showEmoji = true,
  emoji,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (!disabled && onClick) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 300);
      onClick();
    }
  };

  // Extract emoji and text from children using utility function
  const { emoji: detectedEmoji, text } = parseEmojiContent(children);
  const displayEmoji = emoji || detectedEmoji;

  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      disabled={disabled}
      type={type}
    >
      {showEmoji && (
        <AnimatedEmoji 
          emoji={displayEmoji}
          mood={isClicked ? 'excited' : variant === 'primary' ? 'happy' : 'normal'}
          size={size === 'lg' ? '1.8rem' : size === 'sm' ? '1.2rem' : '1.5rem'}
          triggerAnimation={isClicked}
        />
      )}
      <span>{text}</span>
    </StyledButton>
  );
};