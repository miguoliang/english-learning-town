export type ButtonSize = 'sm' | 'md' | 'lg';

export type ErrorFallbackVariant = 'minimal' | 'detailed' | 'fullscreen';

/**
 * Get default title based on variant
 */
export const getDefaultErrorTitle = (variant: ErrorFallbackVariant): string => {
  switch (variant) {
    case 'minimal':
      return 'Error';
    case 'fullscreen':
      return 'Application Error';
    default:
      return 'Something went wrong';
  }
};

/**
 * Get default message based on variant
 */
export const getDefaultErrorMessage = (variant: ErrorFallbackVariant): string => {
  switch (variant) {
    case 'minimal':
      return 'Please try again.';
    case 'fullscreen':
      return 'The application encountered an unexpected error. Please refresh the page or contact support if the problem persists.';
    default:
      return 'An unexpected error occurred. Please try again or refresh the page.';
  }
};

/**
 * Get button size based on variant
 */
export const getErrorFallbackButtonSize = (variant: ErrorFallbackVariant): ButtonSize => {
  switch (variant) {
    case 'minimal':
      return 'sm';
    case 'fullscreen':
      return 'lg';
    default:
      return 'md';
  }
};

/**
 * Get emoji size based on variant
 */
export const getErrorFallbackEmojiSize = (variant: ErrorFallbackVariant): string => {
  switch (variant) {
    case 'minimal':
      return '1.5rem';
    case 'fullscreen':
      return '3rem';
    default:
      return '2rem';
  }
};

/**
 * Determine if error code should be shown by default
 */
export const shouldShowErrorCode = (variant: ErrorFallbackVariant): boolean => {
  return variant !== 'minimal';
};

/**
 * Determine if refresh button should be shown by default
 */
export const shouldShowRefreshButton = (variant: ErrorFallbackVariant): boolean => {
  return variant !== 'minimal';
};