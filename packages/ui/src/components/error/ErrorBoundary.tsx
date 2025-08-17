import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '../basic/Button';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 2px solid ${({ theme }) => theme.colors.error};
  margin: ${({ theme }) => theme.spacing[4]};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.base};
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
  opacity: 0.9;
  max-width: 400px;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const ErrorDetails = styled.details`
  margin-top: ${({ theme }) => theme.spacing[4]};
  max-width: 500px;
  width: 100%;
`;

const ErrorSummary = styled.summary`
  color: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

const ErrorStack = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`;

const ActionContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

interface ErrorBoundaryErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorBoundaryErrorInfo | null;
}

export interface ErrorBoundaryProps {
  /** Content to render when there's no error */
  children: ReactNode;
  /** Custom fallback component to render when there's an error */
  fallback?: (error: Error, errorInfo: ErrorBoundaryErrorInfo | null, retry: () => void) => ReactNode;
  /** Callback called when an error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showDetails?: boolean;
  /** Custom error title */
  title?: string;
  /** Custom error message */
  message?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Custom retry button text */
  retryText?: string;
}

/**
 * ErrorBoundary - A React error boundary component for graceful error handling
 * 
 * Features:
 * - Catches JavaScript errors anywhere in the child component tree
 * - Displays fallback UI instead of crashing the entire app
 * - Provides error details in development mode
 * - Supports custom fallback components
 * - Includes retry functionality
 * - Logs errors for debugging
 * - Themed styling consistent with UI library
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo: { componentStack: errorInfo.componentStack || '' },
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render() {
    const { 
      children, 
      fallback, 
      showDetails = process.env.NODE_ENV === 'development',
      title = 'Oops! Something went wrong',
      message = 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.',
      showRetry = true,
      retryText = 'Try Again'
    } = this.props;

    if (this.state.hasError && this.state.error) {
      // Custom fallback component
      if (fallback) {
        return fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Default fallback UI
      return (
        <ErrorContainer role="alert">
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>{title}</ErrorTitle>
          <ErrorMessage>{message}</ErrorMessage>
          
          {showRetry && (
            <ActionContainer>
              <Button 
                variant="secondary" 
                onClick={this.handleRetry}
              >
                {retryText}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </ActionContainer>
          )}

          {showDetails && this.state.error && (
            <ErrorDetails>
              <ErrorSummary>Show Error Details</ErrorSummary>
              <ErrorStack>
                <strong>Error:</strong> {this.state.error.message}
                {this.state.error.stack && (
                  <>
                    <br /><br />
                    <strong>Stack Trace:</strong>
                    <br />
                    {this.state.error.stack}
                  </>
                )}
                {this.state.errorInfo?.componentStack && (
                  <>
                    <br /><br />
                    <strong>Component Stack:</strong>
                    <br />
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </ErrorStack>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    // No error, render children normally
    return children;
  }
}