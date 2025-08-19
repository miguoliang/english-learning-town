import React from 'react';
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
 * - CSS-based theming
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
  // Build CSS classes
  const containerClasses = [
    'elt-error-fallback',
    `elt-error-fallback--${variant}`
  ].join(' ');

  const titleClasses = [
    'elt-error-fallback__title',
    `elt-error-fallback__title--${variant}`
  ].join(' ');

  const messageClasses = [
    'elt-error-fallback__message',
    `elt-error-fallback__message--${variant}`
  ].join(' ');

  const actionsClasses = [
    'elt-error-fallback__actions',
    `elt-error-fallback__actions--${variant}`
  ].join(' ');

  return (
    <div className={containerClasses} role="alert">
      <div className="elt-error-fallback__emoji">
        <AnimatedEmoji 
          emoji={emoji} 
          mood="thinking" 
          size={getErrorFallbackEmojiSize(variant)}
        />
      </div>
      
      <h2 className={titleClasses}>
        {title || getDefaultErrorTitle(variant)}
      </h2>
      
      <p className={messageClasses}>
        {message || getDefaultErrorMessage(variant)}
      </p>

      {(showRetry || showRefresh) && (
        <div className={actionsClasses}>
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
        </div>
      )}

      {showErrorCode && (
        <div className="elt-error-fallback__code">
          Error: {error.name} - {error.message}
        </div>
      )}
    </div>
  );
};