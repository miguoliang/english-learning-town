import styled, { css } from 'styled-components';
import { buttonBounce, hoverPulse } from '../../styles/animations';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/**
 * Size styling factory
 */
const getSizeStyles = (size: ButtonSize) => {
  const sizes = {
    sm: css`
      padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
      font-size: ${({ theme }) => theme.fontSizes.sm};
      min-height: 40px;
    `,
    md: css`
      padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
      font-size: ${({ theme }) => theme.fontSizes.lg};
      min-height: 50px;
    `,
    lg: css`
      padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[10]};
      font-size: ${({ theme }) => theme.fontSizes.xl};
      min-height: 60px;
      min-width: 280px;
      
      @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
        font-size: ${({ theme }) => theme.fontSizes.lg};
        min-height: 50px;
        min-width: 240px;
      }
    `
  };
  
  return sizes[size];
};

/**
 * Variant styling factory
 */
const getVariantStyles = (variant: ButtonVariant) => {
  const variants = {
    primary: css`
      background: ${({ theme }) => theme.gradients.primary};
      color: ${({ theme }) => theme.colors.surface};
      border: 3px solid transparent;
      box-shadow: ${({ theme }) => theme.shadows.fun};
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.gradients.magical};
        animation: ${hoverPulse} 1.5s ease-in-out infinite;
        transform: translateY(-2px) scale(1.02);
      }
    `,
    secondary: css`
      background: ${({ theme }) => theme.gradients.secondary};
      color: ${({ theme }) => theme.colors.surface};
      border: 3px solid transparent;
      box-shadow: ${({ theme }) => theme.shadows.medium};
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.gradients.ocean};
        transform: translateY(-2px) scale(1.02);
      }
    `,
    outline: css`
      background: transparent;
      color: ${({ theme }) => theme.colors.primary};
      border: 3px solid ${({ theme }) => theme.colors.primary};
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.surface};
        transform: translateY(-2px) scale(1.02);
      }
    `,
    ghost: css`
      background: transparent;
      color: ${({ theme }) => theme.colors.text};
      border: 3px solid transparent;
      
      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.background};
        transform: translateY(-1px);
      }
    `
  };
  
  return variants[variant];
};

/**
 * Base button styles
 */
const baseButtonStyles = css`
  /* Reset and base */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  transition: all ${({ theme }) => theme.transitions.bounce};
  position: relative;
  overflow: hidden;
  text-decoration: none;
  text-align: center;
  user-select: none;
  
  /* Shine effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover:not(:disabled)::before {
    left: 100%;
  }
  
  /* Click animation */
  &:active:not(:disabled) {
    ${css`animation: ${buttonBounce} 0.3s ease;`}
    transform: translateY(0) scale(0.98);
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: ${({ theme }) => theme.shadows.small};
    background: ${({ theme }) => theme.colors.textLight};
    color: ${({ theme }) => theme.colors.surface};
    
    &:hover {
      animation: none;
      transform: none;
    }
    
    &::before {
      display: none;
    }
  }
`;

/**
 * Full width styles
 */
const fullWidthStyles = css`
  width: 100%;
`;

/**
 * Styled Button component factory
 */
export const StyledButton: any = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'fullWidth'].includes(prop),
})<ButtonStyleProps>`
  ${baseButtonStyles}
  
  /* Size styles */
  ${({ size = 'md' }) => getSizeStyles(size)}
  
  /* Variant styles */
  ${({ variant = 'primary' }) => getVariantStyles(variant)}
  
  /* Full width */
  ${({ fullWidth }) => fullWidth && fullWidthStyles}
`;