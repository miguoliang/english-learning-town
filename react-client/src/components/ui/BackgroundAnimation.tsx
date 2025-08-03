import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AnimationContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
  z-index: 0;
`;

export const BackgroundAnimation: React.FC = () => {
  return (
    <AnimationContainer
      animate={{
        background: [
          'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
          'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          'radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)'
        ]
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
    />
  );
};