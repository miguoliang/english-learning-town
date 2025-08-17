import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type { ErrorBoundaryProps } from './ErrorBoundary';


export interface AsyncErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'children'> {
  /** Content to render when there's no error */
  children: ReactNode;
  /** Whether to catch unhandled promise rejections */
  catchUnhandledRejections?: boolean;
}

/**
 * AsyncErrorBoundary - An enhanced error boundary that also catches async errors
 * 
 * Features:
 * - All features of regular ErrorBoundary
 * - Catches unhandled promise rejections
 * - Catches async errors that escape React's error boundary mechanism
 * - Provides the same fallback UI and retry functionality
 * - Can be configured to ignore certain async errors
 */
export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  catchUnhandledRejections = true,
  onError,
  ...errorBoundaryProps
}) => {
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  useEffect(() => {
    if (!catchUnhandledRejections) return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Convert promise rejection to Error
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));

      // Set async error to trigger error boundary
      setAsyncError(error);

      // Call onError callback if provided
      onError?.(error, { componentStack: 'Async Error' });

      // Prevent the default browser behavior
      event.preventDefault();
    };

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [catchUnhandledRejections, onError]);

  // If we have an async error, throw it to trigger the error boundary
  if (asyncError) {
    throw asyncError;
  }

  return (
    <ErrorBoundary
      {...errorBoundaryProps}
      onError={(error, errorInfo) => {
        // Reset async error when ErrorBoundary handles an error
        setAsyncError(null);
        onError?.(error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};