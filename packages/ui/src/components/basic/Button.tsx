import React, { useState } from 'react';
import { AnimatedEmoji } from './AnimatedEmoji';
import { parseEmojiContent } from '../../utils/emojiParser';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
  /** Additional CSS class name */
  className?: string;
}

/**
 * Button - A versatile, animated button component
 * 
 * Features:
 * - Multiple variants (primary, secondary, accent, outline, ghost)
 * - Three sizes (sm, md, lg)
 * - Auto-emoji detection and animation
 * - CSS-based theming
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
  className = '',
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

  // Build CSS classes
  const classes = [
    'elt-button',
    `elt-button--${variant}`,
    `elt-button--${size}`,
    fullWidth && 'elt-button--full',
    isClicked && 'elt-animate-bounce',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {showEmoji && displayEmoji && (
        <AnimatedEmoji
          emoji={displayEmoji}
          mood={isClicked ? 'excited' : 'happy'}
          size="1.2em"
          hoverEffect={false}
        />
      )}
      {text || children}
    </button>
  );
};