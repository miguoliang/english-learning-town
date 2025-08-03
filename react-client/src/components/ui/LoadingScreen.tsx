import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const LoadingScreenContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.gradients.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const LoadingSpinner = styled(motion.div)`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  margin-bottom: 24px;
`;

const LoadingText = styled.h2`
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 8px;
`;

const LoadingSubtext = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  text-align: center;
  max-width: 400px;
`;

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = "English Learning Town",
  subtitle = "Loading your adventure... Get ready to explore, learn, and have fun!"
}) => {
  return (
    <LoadingScreenContainer>
      <LoadingSpinner
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <LoadingText>{title}</LoadingText>
      <LoadingSubtext>{subtitle}</LoadingSubtext>
    </LoadingScreenContainer>
  );
};