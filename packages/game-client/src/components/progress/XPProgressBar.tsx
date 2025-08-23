import React from 'react';
import { AnimatedEmoji } from '@elt/ui';

export interface XPProgressBarProps {
  /** Current player level */
  currentLevel: number;
  /** Total accumulated XP */
  totalXP: number;
  /** XP needed to reach next level */
  xpToNextLevel: number;
  /** Whether to display in compact mode */
  isCompact?: boolean;
  /** Whether to show the level icon */
  showLevelIcon?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * XPProgressBar - Displays player experience and level progression
 * 
 * Features:
 * - Animated progress bar with shimmer effect
 * - Level badge with glow animation
 * - Compact and full display modes
 * - Level-based emoji indicators
 * - Smooth XP transitions
 * - Responsive design
 */
export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentLevel,
  totalXP,
  xpToNextLevel,
  isCompact = false,
  showLevelIcon = true,
  className
}) => {
  // Calculate progress percentage (this would normally use imported function)
  const calculateLevelProgress = (xp: number): number => {
    const baseXP = 100;
    const currentLevelStart = (currentLevel - 1) * baseXP;
    const nextLevelStart = currentLevel * baseXP;
    const progress = (xp - currentLevelStart) / (nextLevelStart - currentLevelStart);
    return Math.min(Math.max(progress, 0), 1);
  };

  const progressPercentage = calculateLevelProgress(totalXP) * 100;
  const currentLevelXP = totalXP - (xpToNextLevel > 0 ? totalXP - xpToNextLevel : totalXP);
  const nextLevelTotalXP = currentLevelXP + xpToNextLevel;
  
  const getLevelEmoji = (level: number): string => {
    if (level >= 20) return '👑';
    if (level >= 15) return '🌟';
    if (level >= 10) return '🎓';
    if (level >= 5) return '🌠';
    return '⭐';
  };
  
  // Build CSS classes
  const containerClasses = [
    'elt-game-progress-container',
    isCompact && 'elt-game-progress-container--compact',
    className
  ].filter(Boolean).join(' ');

  const badgeClasses = [
    'elt-game-level-badge',
    isCompact && 'elt-game-level-badge--compact'
  ].filter(Boolean).join(' ');

  const textClasses = [
    'elt-game-progress-text',
    isCompact && 'elt-game-progress-text--compact'
  ].filter(Boolean).join(' ');

  const barClasses = [
    'elt-game-progress-bar',
    isCompact && 'elt-game-progress-bar--compact'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={badgeClasses}>
        {currentLevel}
      </div>
      
      <div className="elt-game-progress-info">
        <div className={textClasses}>
          <span>Level {currentLevel}</span>
          <span>
            {xpToNextLevel > 0 ? `${xpToNextLevel} XP to go!` : 'Max Level!'}
          </span>
        </div>
        
        <div className={barClasses}>
          <div 
            className="elt-game-progress-fill"
            style={{ 
              width: `${progressPercentage}%`,
              '--progress-width': `${progressPercentage}%` 
            } as React.CSSProperties}
          />
        </div>
        
        {!isCompact && (
          <div className={textClasses}>
            <span>{currentLevelXP} / {nextLevelTotalXP} XP</span>
            <span>Total: {totalXP.toLocaleString()} XP</span>
          </div>
        )}
      </div>
      
      {showLevelIcon && (
        <div className="elt-game-level-icon">
          <AnimatedEmoji 
            emoji={getLevelEmoji(currentLevel)} 
            mood="floating" 
            size={isCompact ? '1.2rem' : '1.5rem'}
          />
        </div>
      )}
    </div>
  );
};