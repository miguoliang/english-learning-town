import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { Achievement, AchievementRarity } from '../../types';
import { AnimatedEmoji } from '@elt/ui';

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const unlockGlow = keyframes`
  0% { 
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
    transform: scale(1.05);
  }
  100% { 
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
    transform: scale(1);
  }
`;

const lockedPulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
`;

interface BadgeContainerProps {
  rarity: AchievementRarity;
  isUnlocked: boolean;
  isHovered: boolean;
}

const getBadgeColors = (rarity: AchievementRarity) => {
  switch (rarity) {
    case 'COMMON':
      return {
        primary: '#4ecdc4',
        secondary: '#26de81',
        glow: 'rgba(78, 205, 196, 0.6)'
      };
    case 'UNCOMMON':
      return {
        primary: '#45b7d1',
        secondary: '#3742fa',
        glow: 'rgba(69, 183, 209, 0.6)'
      };
    case 'RARE':
      return {
        primary: '#a29bfe',
        secondary: '#6c5ce7',
        glow: 'rgba(162, 155, 254, 0.6)'
      };
    case 'EPIC':
      return {
        primary: '#fd79a8',
        secondary: '#e84393',
        glow: 'rgba(253, 121, 168, 0.6)'
      };
    case 'LEGENDARY':
      return {
        primary: '#fdcb6e',
        secondary: '#e17055',
        glow: 'rgba(253, 203, 110, 0.8)'
      };
    default:
      return {
        primary: '#ddd',
        secondary: '#999',
        glow: 'rgba(221, 221, 221, 0.4)'
      };
  }
};

const BadgeContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['rarity', 'isUnlocked', 'isHovered'].includes(prop),
})<BadgeContainerProps>`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  overflow: hidden;
  
  ${props => {
    const colors = getBadgeColors(props.rarity);
    return css`
      background: ${props.isUnlocked 
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
        : 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)'
      };
      
      border: 4px solid ${props.isUnlocked ? colors.primary : '#636e72'};
      
      ${props.isUnlocked && css`
        box-shadow: 
          0 8px 25px ${colors.glow},
          0 0 0 0 ${colors.glow};
        animation: ${unlockGlow} 3s ease-in-out infinite;
      `}
      
      ${!props.isUnlocked && css`
        opacity: 0.4;
        filter: grayscale(100%);
        animation: ${lockedPulse} 2s ease-in-out infinite;
      `}
      
      ${props.isHovered && props.isUnlocked && css`
        transform: scale(1.1) translateY(-5px);
        box-shadow: 
          0 12px 35px ${colors.glow},
          0 0 0 8px rgba(255, 255, 255, 0.1);
      `}
    `;
  }}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: ${props => props.isUnlocked ? shimmer : 'none'} 3s ease-in-out infinite;
    animation-delay: 1s;
  }
`;

const BadgeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 15px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const BadgeIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const BadgeTitle = styled.div<{ isUnlocked: boolean }>`
  font-family: 'Comic Neue', 'Fredoka One', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${props => props.isUnlocked ? '#ffffff' : '#999999'};
  text-shadow: ${props => props.isUnlocked ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'};
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const RarityIndicator = styled.div<{ rarity: AchievementRarity; isUnlocked: boolean }>`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 3;
  
  ${props => {
    const colors = getBadgeColors(props.rarity);
    return css`
      background: ${props.isUnlocked 
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
        : 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)'
      };
    `;
  }}
`;

const getRaritySymbol = (rarity: AchievementRarity): string => {
  switch (rarity) {
    case 'COMMON': return '●';
    case 'UNCOMMON': return '◆';
    case 'RARE': return '★';
    case 'EPIC': return '♦';
    case 'LEGENDARY': return '♛';
    default: return '●';
  }
};

const LockedOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  z-index: 4;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
`;

const Tooltip = styled.div<{ isVisible: boolean }>`
  position: absolute;
  bottom: -120px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.gradients.celebration};
  color: ${({ theme }) => theme.colors.surface};
  padding: 12px 16px;
  border-radius: 12px;
  font-family: 'Comic Neue', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 
    ${({ theme }) => theme.shadows.fun},
    0 6px 20px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  z-index: 10;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: translateX(-50%) ${props => props.isVisible ? 'translateY(0)' : 'translateY(10px)'};
  transition: all 0.3s ease;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid ${({ theme }) => theme.colors.primary};
  }
`;

const XPReward = styled.div`
  margin-top: 4px;
  font-size: 0.8rem;
  color: #ffd700;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  onClick?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  isUnlocked,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <BadgeContainer
      rarity={achievement.rarity}
      isUnlocked={isUnlocked}
      isHovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <RarityIndicator rarity={achievement.rarity} isUnlocked={isUnlocked}>
        {getRaritySymbol(achievement.rarity)}
      </RarityIndicator>
      
      <BadgeContent>
        <BadgeIcon>
          {isUnlocked ? (
            <AnimatedEmoji 
              emoji={achievement.icon}
              mood="happy"
              size="2.5rem"
              triggerAnimation={isHovered}
            />
          ) : (
            achievement.icon
          )}
        </BadgeIcon>
        <BadgeTitle isUnlocked={isUnlocked}>
          {achievement.title}
        </BadgeTitle>
        {isUnlocked && (
          <XPReward>+{achievement.xpReward} XP</XPReward>
        )}
      </BadgeContent>
      
      {!isUnlocked && !achievement.isSecret && (
        <LockedOverlay>🔒</LockedOverlay>
      )}
      
      {!isUnlocked && achievement.isSecret && (
        <LockedOverlay>❓</LockedOverlay>
      )}
      
      <Tooltip isVisible={isHovered}>
        {isUnlocked ? achievement.description : 
         achievement.isSecret ? "Secret Achievement - Keep exploring!" : 
         achievement.description}
      </Tooltip>
    </BadgeContainer>
  );
};