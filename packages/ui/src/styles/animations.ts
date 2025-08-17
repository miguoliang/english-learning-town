/**
 * Reusable CSS animations and keyframes for @elt/ui components
 */

import { keyframes } from 'styled-components';

// Button animations
export const buttonBounce = keyframes`
  0% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.05) translateY(-3px); }
  100% { transform: scale(1) translateY(0); }
`;

export const hoverPulse = keyframes`
  0% { 
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4), 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6), 0 0 0 8px rgba(255, 107, 107, 0.1);
  }
  100% {
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4), 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
`;

// Emoji animations
export const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(2deg); }
  50% { transform: translateY(-3px) rotate(0deg); }
  75% { transform: translateY(-7px) rotate(-2deg); }
`;

export const happy = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(5deg); }
  50% { transform: scale(1.15) rotate(0deg); }
  75% { transform: scale(1.1) rotate(-5deg); }
`;

export const excited = keyframes`
  0% { transform: scale(1) translateY(0); }
  25% { transform: scale(1.2) translateY(-10px); }
  50% { transform: scale(1.1) translateY(0); }
  75% { transform: scale(1.2) translateY(-5px); }
  100% { transform: scale(1) translateY(0); }
`;

export const thinking = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-10deg) scale(1.05); }
  75% { transform: rotate(10deg) scale(1.05); }
`;

export const surprised = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

// General utility animations
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

export const slideInUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const scaleIn = keyframes`
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

export const scaleOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

export const wiggle = keyframes`
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }
`;