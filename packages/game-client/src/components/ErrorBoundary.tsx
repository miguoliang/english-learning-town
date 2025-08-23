/**
 * Error Boundary Components for Learning Systems
 * Provides graceful error handling and fallback UI for critical failures
 * Uses CSS-only styling for consistency with @elt/ui architecture
 */

import React, { Component } from "react";
import type { ReactNode } from "react";
import { Button, AnimatedEmoji } from "@elt/ui";
import { ValidationError } from "@elt/learning-algorithms";

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

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
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

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = errorInfo.componentStack || "No additional error info";

    this.setState({
      errorInfo: errorDetails,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorDetails);
    }

    // Log error for development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Caught Error");
      console.error("Error:", error);
      console.error("Error Info:", errorDetails);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
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

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  override render() {
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
    const isDevelopment = process.env.NODE_ENV === "development";

    return (
      <div className="elt-game-error">
        <div className="elt-game-error__icon">
          <AnimatedEmoji emoji="⚠️" mood="thinking" />
        </div>

        <h3 className="elt-game-error__title">
          {isValidationError
            ? "Input Validation Error"
            : "Something went wrong"}
        </h3>

        <p className="elt-game-error__message">
          {isValidationError
            ? `Invalid input: ${error.message}`
            : "An unexpected error occurred while loading this component. Please try again."}
        </p>

        <div className="elt-game-error__buttons">
          <Button onClick={this.handleReset} variant="primary">
            Try Again
          </Button>

          {!isValidationError && (
            <Button onClick={this.handleAutoReset} variant="outline">
              Auto-retry in 5s
            </Button>
          )}
        </div>

        {isDevelopment && (
          <details className="elt-game-error__details">
            <summary>Debug Information (Development Only)</summary>
            <pre className="elt-game-error__code">
              <strong>Error:</strong> {error.name}: {error.message}
              {error.stack && (
                <>
                  <br />
                  <br />
                  <strong>Stack Trace:</strong>
                  <br />
                  {error.stack}
                </>
              )}
              {errorInfo && (
                <>
                  <br />
                  <br />
                  <strong>Component Stack:</strong>
                  <br />
                  {errorInfo}
                </>
              )}
            </pre>
          </details>
        )}
      </div>
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
  componentName = "Learning Component",
  onRetry,
}) => {
  const handleError = (error: Error, _errorInfo: string) => {
    // Log learning-specific errors
    console.warn(`Learning component error in ${componentName}:`, {
      error: error.message,
      type: error.constructor.name,
      timestamp: new Date().toISOString(),
    });
  };

  const fallbackRenderer = (error: Error, reset: () => void) => (
    <div className="elt-game-error">
      <div className="elt-game-error__icon">
        <AnimatedEmoji emoji="📚" mood="thinking" />
      </div>

      <h3 className="elt-game-error__title">Learning Component Error</h3>

      <p className="elt-game-error__message">
        The {componentName.toLowerCase()} encountered an error and couldn't load
        properly.
        {error instanceof ValidationError && (
          <>
            <br />
            <strong>Details:</strong> {error.message}
          </>
        )}
      </p>

      <div className="elt-game-error__buttons">
        <Button
          onClick={() => {
            reset();
            onRetry?.();
          }}
          variant="primary"
        >
          Retry Learning
        </Button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackRenderer} onError={handleError}>
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
  dashboardName,
}) => {
  const fallbackRenderer = (_error: Error, reset: () => void) => (
    <div className="elt-game-error">
      <div className="elt-game-error__icon">
        <AnimatedEmoji emoji="📊" mood="thinking" />
      </div>

      <h3 className="elt-game-error__title">Dashboard Error</h3>

      <p className="elt-game-error__message">
        The {dashboardName} dashboard encountered an error while loading your
        data. Please check your internet connection and try again.
      </p>

      <div className="elt-game-error__buttons">
        <Button onClick={reset} variant="primary">
          Reload Dashboard
        </Button>
      </div>
    </div>
  );

  return <ErrorBoundary fallback={fallbackRenderer}>{children}</ErrorBoundary>;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);

    // Log error
    console.error("Component error:", error);
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
    hasError: error !== null,
  };
};
