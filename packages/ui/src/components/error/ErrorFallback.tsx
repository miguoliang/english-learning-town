import React from 'react';
import styled, { css } from 'styled-components';
import { Button } from '../basic/Button';
import { AnimatedEmoji } from '../basic/AnimatedEmoji';
import { 
  getDefaultErrorTitle, 
  getDefaultErrorMessage, 
  getErrorFallbackButtonSize,
  getErrorFallbackEmojiSize,
  shouldShowErrorCode,
  shouldShowRefreshButton,
  type ErrorFallbackVariant
} from '../../utils/errorFallbackHelpers';

const FallbackContainer = styled.div<{ variant: 'minimal' | 'detailed' | 'fullscreen' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 2px solid ${({ theme }) => theme.colors.error};
  text-align: center;

  ${props => props.variant === 'minimal' && css`
    min-height: 120px;
    padding: ${props.theme.spacing[4]};
    border: 1px solid ${props.theme.colors.error};
  `}

  ${props => props.variant === 'detailed' && css`
    min-height: 200px;
    margin: ${props.theme.spacing[4]};
  `}

  ${props => props.variant === 'fullscreen' && css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    border-radius: 0;
    border: none;
    z-index: 9999;
  `}
`;

const EmojiContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const Title = styled.h2<{ variant: 'minimal' | 'detailed' | 'fullscreen' }>`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;

  ${props => props.variant === 'minimal' && css`
    font-size: ${props.theme.fontSizes.base};
  `}

  ${props => props.variant === 'detailed' && css`
    font-size: ${props.theme.fontSizes.xl};
  `}

  ${props => props.variant === 'fullscreen' && css`
    font-size: ${props.theme.fontSizes['2xl']};
  `}
`;

const Message = styled.p<{ variant: 'minimal' | 'detailed' | 'fullscreen' }>`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.body};
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
  opacity: 0.9;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};

  ${props => props.variant === 'minimal' && css`
    font-size: ${props.theme.fontSizes.sm};
    max-width: 300px;
  `}

  ${props => props.variant === 'detailed' && css`
    font-size: ${props.theme.fontSizes.base};
    max-width: 400px;
  `}

  ${props => props.variant === 'fullscreen' && css`
    font-size: ${props.theme.fontSizes.lg};
    max-width: 500px;
  `}
`;

const ActionContainer = styled.div<{ variant: 'minimal' | 'detailed' | 'fullscreen' }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};

  ${props => props.variant === 'minimal' && css`
    flex-direction: column;
    gap: ${props.theme.spacing[2]};
  `}

  ${props => (props.variant === 'detailed' || props.variant === 'fullscreen') && css`
    flex-direction: row;
    
    @media (max-width: 480px) {
      flex-direction: column;
      gap: ${props.theme.spacing[2]};
    }
  `}
`;

const ErrorCode = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.surface};
  background: rgba(0, 0, 0, 0.2);
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing[3]};
  opacity: 0.8;
`;

export interface ErrorFallbackProps {
  /** The error that occurred */
  error: Error;
  /** Function to retry/reset the error */
  retry: () => void;
  /** Display variant */
  variant?: ErrorFallbackVariant;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Whether to show error code */
  showErrorCode?: boolean;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Whether to show refresh button */
  showRefresh?: boolean;
  /** Custom emoji for the error state */
  emoji?: string;
}

/**
 * ErrorFallback - A customizable error fallback component
 * 
 * Features:
 * - Multiple display variants (minimal, detailed, fullscreen)
 * - Animated emoji indicators
 * - Retry and refresh functionality
 * - Error code display for debugging
 * - Responsive design
 * - Themed styling
 * - Accessibility support
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  variant = 'detailed',
  title,
  message,
  showErrorCode = shouldShowErrorCode(variant),
  showRetry = true,
  showRefresh = shouldShowRefreshButton(variant),
  emoji = '⚠️'
}) => {

  return (
    <FallbackContainer variant={variant} role="alert">
      <EmojiContainer>
        <AnimatedEmoji 
          emoji={emoji} 
          mood="thinking" 
          size={getErrorFallbackEmojiSize(variant)}
          autoAnimate
        />
      </EmojiContainer>
      
      <Title variant={variant}>
        {title || getDefaultErrorTitle(variant)}
      </Title>
      
      <Message variant={variant}>
        {message || getDefaultErrorMessage(variant)}
      </Message>

      {(showRetry || showRefresh) && (
        <ActionContainer variant={variant}>
          {showRetry && (
            <Button 
              variant="secondary" 
              size={getErrorFallbackButtonSize(variant)}
              onClick={retry}
            >
              Try Again
            </Button>
          )}
          {showRefresh && (
            <Button 
              variant="outline" 
              size={getErrorFallbackButtonSize(variant)}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          )}
        </ActionContainer>
      )}

      {showErrorCode && (
        <ErrorCode>
          Error: {error.name} - {error.message}
        </ErrorCode>
      )}
    </FallbackContainer>
  );
};