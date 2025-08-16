import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { AnimatedEmoji } from '../ui/AnimatedEmoji';

const celebrationSlideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translateY(-10px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const confettiAnimation = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
`;

const ProgressContainer = styled.div<{ isAnimating?: boolean }>`
  background: ${({ theme }) => theme.gradients.celebration};
  border: 4px solid ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  padding: 20px;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    ${({ theme }) => theme.shadows.fun},
    0 8px 24px rgba(255, 107, 107, 0.3);
  animation: ${props => props.isAnimating ? celebrationSlideIn : 'none'} 0.8s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      rgba(255, 255, 255, 0.1) 25%, 
      transparent 25%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.1) 50%, 
      rgba(255, 255, 255, 0.1) 75%, 
      transparent 75%
    );
    background-size: 20px 20px;
    animation: ${props => props.isAnimating ? 'celebration 2s ease-in-out' : 'none'};
    pointer-events: none;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ProgressText = styled.div`
  color: ${({ theme }) => theme.colors.surface};
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.4;
`;

const VocabularyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const VocabularyChip = styled.div<{ index: number }>`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  padding: 8px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
  animation: celebration 0.6s ease-out;
  animation-delay: ${props => props.index * 0.1}s;
  animation-fill-mode: both;
  border: 2px solid ${({ theme }) => theme.colors.accent};
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(69, 183, 209, 0.4);
  }
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

const ConfettiPiece = styled.div<{ color: string; delay: number; x: number }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${props => props.color};
  top: 100%;
  left: ${props => props.x}%;
  animation: ${confettiAnimation} 2s ease-out;
  animation-delay: ${props => props.delay}s;
  border-radius: 2px;
`;

interface VocabularyProgressProps {
  learnedVocabulary: string[];
}

export const VocabularyProgress: React.FC<VocabularyProgressProps> = ({
  learnedVocabulary,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (learnedVocabulary.length > 0) {
      setIsAnimating(true);
      setShowConfetti(true);
      
      const animationTimer = setTimeout(() => setIsAnimating(false), 800);
      const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
      
      return () => {
        clearTimeout(animationTimer);
        clearTimeout(confettiTimer);
      };
    }
  }, [learnedVocabulary.length]);

  if (learnedVocabulary.length === 0) return null;

  const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8', '#a29bfe'];
  const confettiPieces = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    color: confettiColors[i % confettiColors.length],
    delay: Math.random() * 0.5,
    x: Math.random() * 100,
  }));

  const celebrationMessages = [
    '🎉 Fantastic! You learned new words!',
    '⭐ Amazing vocabulary progress!',
    '🌟 You\'re becoming a word master!',
    '🎊 Great job learning English!',
    '💫 Wonderful! Keep up the great work!'
  ];

  const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

  return (
    <ProgressContainer isAnimating={isAnimating}>
      {showConfetti && (
        <ConfettiContainer>
          {confettiPieces.map(piece => (
            <ConfettiPiece
              key={piece.id}
              color={piece.color}
              delay={piece.delay}
              x={piece.x}
            />
          ))}
        </ConfettiContainer>
      )}
      
      <ProgressHeader>
        <AnimatedEmoji 
          emoji="🎉" 
          mood="excited" 
          size="1.8rem"
          autoAnimate={true}
        />
        <ProgressText>{randomMessage}</ProgressText>
        <AnimatedEmoji 
          emoji="⭐" 
          mood="floating" 
          size="1.5rem"
        />
      </ProgressHeader>
      
      <VocabularyList>
        {learnedVocabulary.map((word, index) => (
          <VocabularyChip key={word} index={index}>
            {word}
          </VocabularyChip>
        ))}
      </VocabularyList>
    </ProgressContainer>
  );
};