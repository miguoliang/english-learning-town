import React, { forwardRef } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['hasError', 'fullWidth'].includes(prop),
})<{ hasError?: boolean; fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['hasError', 'size'].includes(prop),
})<{ 
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>`
  width: 100%;
  border: 3px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.surface
  };
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: ${({ theme }) => theme.gradients.accent};
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.bounce};
  box-shadow: ${({ theme }) => theme.shadows.fun};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  /* Size variants */
  ${props => props.size === 'sm' && `
    padding: ${props.theme.spacing[2]} ${props.theme.spacing[4]};
    font-size: ${props.theme.fontSizes.sm};
    min-height: 40px;
  `}
  
  ${props => (!props.size || props.size === 'md') && `
    padding: ${props.theme.spacing[4]} ${props.theme.spacing[6]};
    font-size: ${props.theme.fontSizes.lg};
    min-height: 50px;
  `}
  
  ${props => props.size === 'lg' && `
    padding: ${props.theme.spacing[6]} ${props.theme.spacing[8]};
    font-size: ${props.theme.fontSizes.xl};
    min-height: 60px;
  `}
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.8);
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) => 
      hasError ? theme.colors.error : theme.colors.primary
    };
    background: ${({ theme, hasError }) => 
      hasError ? theme.gradients.error : theme.gradients.magical
    };
    box-shadow: ${({ theme, hasError }) => 
      hasError 
        ? `${theme.shadows.medium}, 0 6px 20px rgba(255, 77, 79, 0.4)`
        : `${theme.shadows.medium}, 0 6px 20px rgba(255, 107, 107, 0.4)`
    };
    transform: translateY(-2px) scale(1.02);
  }
  
  &:hover:not(:focus) {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.textLight};
    transform: none;
    
    &:hover {
      transform: none;
    }
  }
  
  /* Error state */
  ${props => props.hasError && `
    border-color: ${props.theme.colors.error};
    background: ${props.theme.gradients.error};
  `}
`;

const Label = styled.label<{ required?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  
  ${props => props.required && `
    &::after {
      content: ' *';
      color: ${props.theme.colors.error};
    }
  `}
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const HelperText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** Variant of the input */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Whether input should take full width */
  fullWidth?: boolean;
}

/**
 * Input - A styled input component with validation support
 * 
 * Features:
 * - Three sizes (sm, md, lg)
 * - Error state styling
 * - Label and helper text support
 * - Required field indicator
 * - Smooth animations and hover effects
 * - Accessibility support
 * - Forward ref support
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  required = false,
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const hasError = Boolean(error);

  return (
    <InputWrapper hasError={hasError} fullWidth={fullWidth} className={className}>
      {label && (
        <Label required={required} htmlFor={props.id}>
          {label}
        </Label>
      )}
      <StyledInput
        ref={ref}
        hasError={hasError}
        size={size}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${props.id}-error` : 
          helperText ? `${props.id}-helper` : undefined
        }
        {...props}
      />
      {error && (
        <ErrorMessage id={`${props.id}-error`} role="alert">
          {error}
        </ErrorMessage>
      )}
      {helperText && !error && (
        <HelperText id={`${props.id}-helper`}>
          {helperText}
        </HelperText>
      )}
    </InputWrapper>
  );
});

Input.displayName = 'Input';