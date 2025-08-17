import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AnimatedEmoji } from '@elt/ui';

const progressFill = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--progress-width);
  }
`;

const levelGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  }
`;

const ProgressContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isCompact'].includes(prop),
})<{ isCompact: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.isCompact ? '8px' : '15px'};
  padding: ${props => props.isCompact ? '8px 12px' : '12px 20px'};
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${props => props.isCompact ? '20px' : '25px'};
  box-shadow: ${({ theme }) => theme.shadows.fun};
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  min-width: ${props => props.isCompact ? '200px' : '300px'};
`;

const LevelBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isCompact'].includes(prop),
})<{ isCompact: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.isCompact ? '32px' : '40px'};
  height: ${props => props.isCompact ? '32px' : '40px'};
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${props => props.isCompact ? '0.9rem' : '1.1rem'};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  color: ${({ theme }) => theme.colors.surface};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  animation: ${levelGlow} 3s ease-in-out infinite;
  flex-shrink: 0;
`;

const ProgressSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProgressInfo = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isCompact'].includes(prop),
})<{ isCompact: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.isCompact ? '4px' : '6px'};
`;

const ProgressLabel = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isCompact'].includes(prop),
})<{ isCompact: boolean }>`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${props => props.isCompact ? '0.8rem' : '0.9rem'};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.surface};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const XPText = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isCompact'].includes(prop),
})<{ isCompact: boolean }>`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${props => props.isCompact ? '0.7rem' : '0.8rem'};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.surface};
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const ProgressBarContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isCompact'].includes(prop),
})<{ isCompact: boolean }>`
  position: relative;
  width: 100%;
  height: ${props => props.isCompact ? '12px' : '16px'};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.isCompact ? '6px' : '8px'};
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ProgressBarFill = styled.div.withConfig({
  shouldForwardProp: (prop) => !['progress', 'isCompact'].includes(prop),
})<{ progress: number; isCompact: boolean }>`
  height: 100%;
  background: linear-gradient(90deg, #26de81 0%, #4ecdc4 50%, #FFD700 100%);
  border-radius: ${props => props.isCompact ? '6px' : '8px'};
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.progress}%;
  --progress-width: ${props => props.progress}%;
  animation: ${progressFill} 1.5s ease-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: shimmer 2s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const LevelIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isCompact'].includes(prop),
})<{ isCompact: boolean }>`
  font-size: ${props => props.isCompact ? '1.2rem' : '1.5rem'};
  margin-left: ${props => props.isCompact ? '6px' : '8px'};
  flex-shrink: 0;
`;

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
  
  return (
    <ProgressContainer isCompact={isCompact} className={className}>
      <LevelBadge isCompact={isCompact}>
        {currentLevel}
      </LevelBadge>
      
      <ProgressSection>
        <ProgressInfo isCompact={isCompact}>
          <ProgressLabel isCompact={isCompact}>
            Level {currentLevel}
          </ProgressLabel>
          <XPText isCompact={isCompact}>
            {xpToNextLevel > 0 ? `${xpToNextLevel} XP to go!` : 'Max Level!'}
          </XPText>
        </ProgressInfo>
        
        <ProgressBarContainer isCompact={isCompact}>
          <ProgressBarFill progress={progressPercentage} isCompact={isCompact} />
        </ProgressBarContainer>
        
        {!isCompact && (
          <ProgressInfo isCompact={isCompact}>
            <XPText isCompact={isCompact}>
              {currentLevelXP} / {nextLevelTotalXP} XP
            </XPText>
            <XPText isCompact={isCompact}>
              Total: {totalXP.toLocaleString()} XP
            </XPText>
          </ProgressInfo>
        )}
      </ProgressSection>
      
      {showLevelIcon && (
        <LevelIcon isCompact={isCompact}>
          <AnimatedEmoji 
            emoji={getLevelEmoji(currentLevel)} 
            mood="floating" 
            size={isCompact ? '1.2rem' : '1.5rem'}
          />
        </LevelIcon>
      )}
    </ProgressContainer>
  );
};