import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TitleContainer = styled(motion.div)`
  text-align: center;
  max-width: 600px;
  padding: 40px;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  font-weight: 300;
  line-height: 1.4;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
`;

interface GameTitleProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const GameTitle: React.FC<GameTitleProps> = ({
  title = "🎓 English Learning Town",
  subtitle = "Learn English through adventure and conversation in our friendly virtual town",
  children
}) => {
  return (
    <TitleContainer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Title
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
      >
        {title}
      </Title>

      <Subtitle
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {subtitle}
      </Subtitle>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {children}
      </motion.div>
    </TitleContainer>
  );
};