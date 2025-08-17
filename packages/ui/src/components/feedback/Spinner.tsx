import React from 'react';
import styled from 'styled-components';
import { spin } from '../../styles/animations';

const SpinnerContainer = styled.div<{ 
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}>`
  display: inline-block;
  
  /* Size variants */
  ${props => props.size === 'sm' && `
    width: 20px;
    height: 20px;
    border-width: 2px;
  `}
  
  ${props => (!props.size || props.size === 'md') && `
    width: 40px;
    height: 40px;
    border-width: 3px;
  `}
  
  ${props => props.size === 'lg' && `
    width: 60px;
    height: 60px;
    border-width: 4px;
  `}
  
  border: ${props => props.size === 'sm' ? '2px' : props.size === 'lg' ? '4px' : '3px'} solid 
    ${props => props.color ? `${props.color}30` : 'rgba(255, 255, 255, 0.3)'};
  border-top: ${props => props.size === 'sm' ? '2px' : props.size === 'lg' ? '4px' : '3px'} solid 
    ${props => props.color || props.theme.colors.surface};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SpinnerWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['center'].includes(prop),
})<{ center?: boolean }>`
  display: ${props => props.center ? 'flex' : 'inline-flex'};
  align-items: center;
  justify-content: center;
  ${props => props.center && `
    width: 100%;
    height: 100%;
  `}
`;

export interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Custom color for the spinner */
  color?: string;
  /** Whether to center the spinner */
  center?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Spinner - A loading spinner component
 * 
 * Features:
 * - Three sizes (sm, md, lg)
 * - Customizable color
 * - Center alignment option
 * - Smooth spinning animation
 * - Themed default colors
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color,
  center = false,
  className
}) => {
  return (
    <SpinnerWrapper center={center} className={className}>
      <SpinnerContainer 
        size={size} 
        {...(color !== undefined && { color })}
        role="status"
        aria-label="Loading"
      />
    </SpinnerWrapper>
  );
};