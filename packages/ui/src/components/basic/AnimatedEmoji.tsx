import React, { useState, useEffect } from 'react';

export type EmojiMood = 'happy' | 'excited' | 'thinking' | 'surprised' | 'floating';

export interface AnimatedEmojiProps {
  /** The emoji to display */
  emoji: string;
  /** Animation mood */
  mood?: EmojiMood;
  /** Size of the emoji (CSS value) */
  size?: string;
  /** Whether to trigger animation on prop change */
  animate?: boolean;
  /** Rotation in degrees */
  rotation?: number;
  /** Enable hover effects */
  hoverEffect?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Accessibility label for the emoji */
  ariaLabel?: string;
}

/**
 * AnimatedEmoji - An emoji component with playful animations
 * 
 * Features:
 * - Multiple animation moods (happy, excited, thinking, surprised, floating)
 * - Customizable size and rotation
 * - Hover effects
 * - CSS-based animations
 * - Kid-friendly and engaging
 */
export const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({
  emoji,
  mood = 'happy',
  size = '2rem',
  animate = true,
  rotation = 0,
  hoverEffect = false,
  className = '',
  onClick,
  ariaLabel,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMood, setCurrentMood] = useState(mood);

  // Trigger animation when mood changes
  useEffect(() => {
    if (animate && mood !== currentMood) {
      setCurrentMood(mood);
      if (mood !== 'floating' && mood !== 'thinking') {
        setIsAnimating(true);
        // Reset animation after it completes
        const duration = mood === 'excited' ? 800 : mood === 'surprised' ? 600 : 1000;
        setTimeout(() => setIsAnimating(false), duration);
      }
    }
  }, [mood, currentMood, animate]);

  // Build CSS classes
  const classes = [
    'elt-emoji',
    // Animation classes
    mood === 'floating' && 'elt-animate-float',
    mood === 'thinking' && 'elt-animate-thinking',
    isAnimating && mood === 'happy' && 'elt-animate-happy',
    isAnimating && mood === 'excited' && 'elt-animate-excited',
    isAnimating && mood === 'surprised' && 'elt-animate-surprised',
    // Hover effect
    hoverEffect && 'elt-emoji--hover',
    className
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    fontSize: size,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
  };

  return (
    <span
      className={classes}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {emoji}
    </span>
  );
};