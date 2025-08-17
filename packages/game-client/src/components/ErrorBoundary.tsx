/**
 * Error Boundary Components for Learning Systems
 * Provides graceful error handling and fallback UI for critical failures
 */

import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { Button, AnimatedEmoji } from '@elt/ui';
import { ValidationError } from '@elt/core';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: string) => void;
  isolate?: boolean; // If true, only catches errors from immediate children
}

const ErrorContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  margin: ${({ theme }) => theme.spacing[4]} 0;
  border: 2px solid ${({ theme }) => theme.colors.error};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  text-align: center;
`;

const ErrorTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  line-height: 1.5;
`;

const ErrorDetails = styled.details`
  margin-top: ${({ theme }) => theme.spacing[4]};
  text-align: left;
  
  summary {
    cursor: pointer;
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }
`;

const ErrorCode = styled.pre`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  overflow-x: auto;
  white-space: pre-wrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = errorInfo.componentStack || 'No additional error info';
    
    this.setState({
      errorInfo: errorDetails
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorDetails);
    }

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorDetails);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleAutoReset = () => {
    // Clear any existing timeout
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    // Auto-reset after 5 seconds
    this.resetTimeoutId = window.setTimeout(() => {
      this.handleReset();
    }, 5000);
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI based on error type
      return this.renderDefaultErrorUI();
    }

    return this.props.children;
  }

  private renderDefaultErrorUI() {
    const { error, errorInfo } = this.state;
    
    if (!error) return null;

    // Customize error message based on error type
    const isValidationError = error instanceof ValidationError;
    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
      <ErrorContainer>
        <ErrorTitle>
          <AnimatedEmoji emoji="⚠️" mood="thinking" />
          {isValidationError ? 'Input Validation Error' : 'Something went wrong'}
        </ErrorTitle>

        <ErrorMessage>
          {isValidationError 
            ? `Invalid input: ${error.message}`
            : 'An unexpected error occurred while loading this component. Please try again.'
          }
        </ErrorMessage>

        <ButtonGroup>
          <Button onClick={this.handleReset} variant="primary">
            Try Again
          </Button>
          
          {!isValidationError && (
            <Button onClick={this.handleAutoReset} variant="outline">
              Auto-retry in 5s
            </Button>
          )}
        </ButtonGroup>

        {isDevelopment && (
          <ErrorDetails>
            <summary>Debug Information (Development Only)</summary>
            <ErrorCode>
              <strong>Error:</strong> {error.name}: {error.message}
              {error.stack && (
                <>
                  <br /><br />
                  <strong>Stack Trace:</strong><br />
                  {error.stack}
                </>
              )}
              {errorInfo && (
                <>
                  <br /><br />
                  <strong>Component Stack:</strong><br />
                  {errorInfo}
                </>
              )}
            </ErrorCode>
          </ErrorDetails>
        )}
      </ErrorContainer>
    );
  }
}

// Specialized error boundaries for different component types

interface LearningErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  onRetry?: () => void;
}

export const LearningErrorBoundary: React.FC<LearningErrorBoundaryProps> = ({ 
  children, 
  componentName = 'Learning Component',
  onRetry 
}) => {
  const handleError = (error: Error, errorInfo: string) => {
    // Log learning-specific errors
    console.warn(`Learning component error in ${componentName}:`, {
      error: error.message,
      type: error.constructor.name,
      timestamp: new Date().toISOString()
    });
  };

  const fallbackRenderer = (error: Error, reset: () => void) => (
    <ErrorContainer>
      <ErrorTitle>
        <AnimatedEmoji emoji="📚" mood="thinking" />
        Learning Component Error
      </ErrorTitle>
      
      <ErrorMessage>
        The {componentName.toLowerCase()} encountered an error and couldn't load properly.
        {error instanceof ValidationError && (
          <><br /><strong>Details:</strong> {error.message}</>
        )}
      </ErrorMessage>

      <ButtonGroup>
        <Button onClick={() => { reset(); onRetry?.(); }} variant="primary">
          Retry Learning
        </Button>
      </ButtonGroup>
    </ErrorContainer>
  );

  return (
    <ErrorBoundary 
      fallback={fallbackRenderer}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  dashboardName: string;
}

export const DashboardErrorBoundary: React.FC<DashboardErrorBoundaryProps> = ({ 
  children, 
  dashboardName 
}) => {
  const fallbackRenderer = (error: Error, reset: () => void) => (
    <ErrorContainer>
      <ErrorTitle>
        <AnimatedEmoji emoji="📊" mood="thinking" />
        Dashboard Error
      </ErrorTitle>
      
      <ErrorMessage>
        The {dashboardName} dashboard encountered an error while loading your data.
        Please check your internet connection and try again.
      </ErrorMessage>

      <ButtonGroup>
        <Button onClick={reset} variant="primary">
          Reload Dashboard
        </Button>
      </ButtonGroup>
    </ErrorContainer>
  );

  return (
    <ErrorBoundary fallback={fallbackRenderer}>
      {children}
    </ErrorBoundary>
  );
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    
    // Log error
    console.error('Component error:', error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Reset error on unmount
  React.useEffect(() => {
    return () => setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null
  };
};