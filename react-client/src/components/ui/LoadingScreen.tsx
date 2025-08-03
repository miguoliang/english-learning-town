import React from 'react';
import styled from 'styled-components';

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

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  margin-bottom: 24px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
`;

const LoadingSubtext = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  subMessage = "Preparing your adventure"
}) => {
  return (
    <LoadingScreenContainer>
      <LoadingSpinner />
      <LoadingText>{message}</LoadingText>
      <LoadingSubtext>{subMessage}</LoadingSubtext>
    </LoadingScreenContainer>
  );
};