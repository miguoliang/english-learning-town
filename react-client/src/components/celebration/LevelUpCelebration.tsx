import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AnimatedEmoji } from '../ui/AnimatedEmoji';

const confettiPop = keyframes`
  0% {
    transform: translateY(0) rotate(0deg) scale(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-200px) rotate(180deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-400px) rotate(360deg) scale(0.5);
    opacity: 0;
  }
`;

const levelBounce = keyframes`
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(0deg);
    opacity: 1;
  }
  70% {
    transform: scale(0.9) rotate(5deg);
    opacity: 1;
  }
  85% {
    transform: scale(1.1) rotate(-3deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const starShine = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.8;
  }
  25% {
    transform: scale(1.2) rotate(90deg);
    opacity: 1;
  }
  50% {
    transform: scale(0.8) rotate(180deg);
    opacity: 0.6;
  }
  75% {
    transform: scale(1.3) rotate(270deg);
    opacity: 1;
  }
`;

const textGlow = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 5px rgba(255, 215, 0, 0.8),
      0 0 10px rgba(255, 215, 0, 0.6),
      0 0 15px rgba(255, 215, 0, 0.4);
  }
  50% {
    text-shadow: 
      0 0 10px rgba(255, 215, 0, 1),
      0 0 20px rgba(255, 215, 0, 0.8),
      0 0 30px rgba(255, 215, 0, 0.6),
      0 0 40px rgba(255, 215, 0, 0.4);
  }
`;

const firework = keyframes`
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  20% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--random-x, 0), var(--random-y, 0)) scale(0);
    opacity: 0;
  }
`;

const CelebrationOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
`;

const CelebrationContainer = styled.div`
  position: relative;
  text-align: center;
  padding: 40px;
  background: ${({ theme }) => theme.gradients.celebration};
  border-radius: 30px;
  box-shadow: 
    ${({ theme }) => theme.shadows.fun},
    0 0 50px rgba(255, 215, 0, 0.3);
  max-width: 500px;
  width: 90%;
  overflow: hidden;
`;

const ConfettiContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
`;

const ConfettiPiece = styled.div<{ delay: number; color: string; left: number }>`
  position: absolute;
  top: 100%;
  left: ${props => props.left}%;
  width: 10px;
  height: 10px;
  background: ${props => props.color};
  border-radius: 50%;
  animation: ${confettiPop} 3s ease-out ${props => props.delay}s infinite;
`;

const StarContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 2rem;
  animation: ${starShine} 2s ease-in-out infinite;
`;

const LevelIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 20px;
  animation: ${levelBounce} 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
`;

const CelebrationTitle = styled.h1`
  font-family: 'Comic Neue', 'Fredoka One', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.surface};
  margin-bottom: 15px;
  animation: ${textGlow} 2s ease-in-out infinite;
`;

const LevelNumber = styled.div`
  font-family: 'Comic Neue', sans-serif;
  font-size: 4rem;
  font-weight: 900;
  color: #FFD700;
  text-stroke: 2px ${({ theme }) => theme.colors.surface};
  -webkit-text-stroke: 2px ${({ theme }) => theme.colors.surface};
  margin: 20px 0;
  animation: ${levelBounce} 1.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
`;

const CelebrationMessage = styled.p`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.surface};
  margin-bottom: 30px;
  opacity: 0.95;
  line-height: 1.4;
`;

const RewardSection = styled.div`
  margin: 25px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const RewardTitle = styled.h3`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.surface};
  margin-bottom: 15px;
`;

const RewardList = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const RewardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 15px;
  border-radius: 15px;
  font-family: 'Comic Neue', sans-serif;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.surface};
  font-size: 1.1rem;
`;

const ContinueButton = styled.button`
  font-family: 'Comic Neue', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 165, 0, 0.4);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 165, 0, 0.6);
    background: linear-gradient(135deg, #FFA500 0%, #FFD700 100%);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const FireworkContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Firework = styled.div<{ delay: number; x: number; y: number }>`
  position: absolute;
  top: ${props => props.y}%;
  left: ${props => props.x}%;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #FFD700, #FFA500);
  border-radius: 50%;
  animation: ${firework} 2s ease-out ${props => props.delay}s infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.6), transparent);
    border-radius: 50%;
  }
`;

interface LevelUpCelebrationProps {
  isVisible: boolean;
  newLevel: number;
  xpGained?: number;
  onContinue: () => void;
  rewards?: {
    xp?: number;
    features?: string[];
    achievements?: string[];
  };
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  isVisible,
  newLevel,
  xpGained = 0,
  onContinue,
  rewards = {}
}) => {
  const [showFireworks, setShowFireworks] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      // Start fireworks after initial animation
      const timer = setTimeout(() => {
        setShowFireworks(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setShowFireworks(false);
    }
  }, [isVisible]);
  
  const confettiColors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const confettiPieces = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    left: Math.random() * 100
  }));
  
  const fireworks = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 60
  }));
  
  const levelMessages = [
    "You're getting awesome at English!",
    "Amazing progress, superstar!",
    "You're becoming an English expert!",
    "Incredible job learning English!",
    "You're on fire with your English!",
    "Outstanding English skills!",
    "You're a true English champion!",
    "Brilliant work with English!",
    "You're mastering English beautifully!",
    "Exceptional English learning!"
  ];
  
  const getMessage = (level: number): string => {
    const index = (level - 1) % levelMessages.length;
    return levelMessages[index];
  };
  
  if (!isVisible) return null;
  
  return (
    <CelebrationOverlay isVisible={isVisible}>
      <CelebrationContainer>
        <ConfettiContainer>
          {confettiPieces.map(piece => (
            <ConfettiPiece
              key={piece.id}
              delay={piece.delay}
              color={piece.color}
              left={piece.left}
            />
          ))}
        </ConfettiContainer>
        
        {showFireworks && (
          <FireworkContainer>
            {fireworks.map(firework => (
              <Firework
                key={firework.id}
                delay={firework.delay}
                x={firework.x}
                y={firework.y}
              />
            ))}
          </FireworkContainer>
        )}
        
        <StarContainer>
          <AnimatedEmoji emoji="⭐" mood="excited" autoAnimate />
        </StarContainer>
        
        <LevelIcon>
          <AnimatedEmoji emoji="🎉" mood="excited" size="5rem" autoAnimate />
        </LevelIcon>
        
        <CelebrationTitle>LEVEL UP!</CelebrationTitle>
        
        <LevelNumber>Level {newLevel}</LevelNumber>
        
        <CelebrationMessage>
          {getMessage(newLevel)}
        </CelebrationMessage>
        
        <RewardSection>
          <RewardTitle>🎁 Level Up Rewards!</RewardTitle>
          <RewardList>
            {xpGained > 0 && (
              <RewardItem>
                <AnimatedEmoji emoji="⭐" size="1.2rem" mood="floating" />
                +{xpGained} XP
              </RewardItem>
            )}
            <RewardItem>
              <AnimatedEmoji emoji="🔓" size="1.2rem" mood="floating" />
              New Adventures
            </RewardItem>
            {rewards.features && rewards.features.map((feature, index) => (
              <RewardItem key={index}>
                <AnimatedEmoji emoji="✨" size="1.2rem" mood="floating" />
                {feature}
              </RewardItem>
            ))}
            {rewards.achievements && rewards.achievements.map((achievement, index) => (
              <RewardItem key={index}>
                <AnimatedEmoji emoji="🏆" size="1.2rem" mood="floating" />
                {achievement}
              </RewardItem>
            ))}
          </RewardList>
        </RewardSection>
        
        <ContinueButton onClick={onContinue}>
          Continue Adventure! 🚀
        </ContinueButton>
      </CelebrationContainer>
    </CelebrationOverlay>
  );
};