import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { spin, fadeIn } from '../../styles/animations';
import { AnimatedEmoji } from '../basic/AnimatedEmoji';

const LoadingScreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.surface};
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-family: ${({ theme }) => theme.fonts.heading};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.surface};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const LoadingSubtext = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  max-width: 400px;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const LoadingDots = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const Dot = styled.div<{ delay: number }>`
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  animation: ${fadeIn} 0.8s ease-in-out infinite alternate;
  animation-delay: ${props => props.delay}s;
`;

const ProgressContainer = styled.div`
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin: ${({ theme }) => theme.spacing[4]} 0;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  background: ${({ theme }) => theme.gradients.secondary};
  border-radius: 4px;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const HintsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  max-width: 400px;
`;

const HintText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const EmojiContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export interface LoadingScreenProps {
  /** Main loading message */
  message?: string;
  /** Title for the loading screen */
  title?: string;
  /** Secondary descriptive text */
  subMessage?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Array of hint messages to display */
  hints?: string[];
  /** Whether to show animated dots */
  showDots?: boolean;
}

/**
 * LoadingScreen - A full-screen loading component with spinner and messages
 * 
 * Features:
 * - Full viewport coverage
 * - Animated spinner
 * - Customizable messages
 * - Optional animated dots
 * - Themed styling
 * - Smooth fade-in animation
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title,
  subtitle,
  progress,
  hints,
  showDots = true
}) => {
  const [currentHint, setCurrentHint] = useState(0);

  useEffect(() => {
    if (hints && hints.length > 1) {
      const interval = setInterval(() => {
        setCurrentHint(prev => (prev + 1) % hints.length);
      }, 3000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [hints]);

  const displayTitle = title || "Loading...";
  const displaySubtitle = subtitle || "Preparing your adventure";

  return (
    <LoadingScreenContainer role="status" aria-live="polite">
      <EmojiContainer>
        <AnimatedEmoji emoji="🎮" mood="floating" size="3rem" />
      </EmojiContainer>
      
      <LoadingSpinner />
      <LoadingText>{displayTitle}</LoadingText>
      <LoadingSubtext>{displaySubtitle}</LoadingSubtext>
      
      {progress !== undefined && (
        <ProgressContainer>
          <ProgressBar 
            progress={progress} 
            role="progressbar" 
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </ProgressContainer>
      )}
      
      {showDots && (
        <LoadingDots>
          <Dot delay={0} />
          <Dot delay={0.2} />
          <Dot delay={0.4} />
        </LoadingDots>
      )}
      
      {hints && hints.length > 0 && (
        <HintsContainer>
          <HintText key={currentHint}>
            {hints[currentHint]}
          </HintText>
        </HintsContainer>
      )}
    </LoadingScreenContainer>
  );
};