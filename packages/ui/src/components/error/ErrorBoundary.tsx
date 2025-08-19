import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '../basic/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export interface ErrorBoundaryProps {
  /** Content to render when there's no error */
  children: ReactNode;
  /** Custom fallback component to render when there's an error */
  fallback?: (error: Error, errorInfo: { componentStack: string } | null, retry: () => void) => ReactNode;
  /** Callback called when an error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showDetails?: boolean;
  /** Custom title for error display */
  title?: string;
  /** Custom message for error display */
  message?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Custom text for retry button */
  retryText?: string;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * 
 * Features:
 * - Graceful error handling
 * - Custom fallback UI
 * - Development-friendly error display
 * - CSS-based theming
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo: { componentStack: errorInfo.componentStack || '' }
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  override render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error, errorInfo } = this.state;

      if (fallback && error) {
        return fallback(error, errorInfo, this.handleRetry);
      }

      return (
        <div className="elt-error" role="alert">
          <div className="elt-error__icon">⚠️</div>
          <h2 className="elt-error__title">
            {this.props.title || 'Oops! Something went wrong'}
          </h2>
          <p className="elt-error__message">
            {this.props.message || "We're sorry, but something unexpected happened. Don't worry, you can try again!"}
          </p>
          
          {(this.props.showRetry !== false) && (
            <>
              <Button onClick={this.handleRetry} variant="primary">
                {this.props.retryText ? this.props.retryText : '🔄 Try Again'}
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            </>
          )}

          {(process.env.NODE_ENV === 'development' || this.props.showDetails) && error && (
            <details style={{ marginTop: '1rem', maxWidth: '500px' }}>
              <summary style={{ cursor: 'pointer', color: '#fff', marginBottom: '0.5rem' }}>
                Show Error Details
              </summary>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                fontSize: '0.8rem', 
                overflow: 'auto', 
                color: '#fff',
                whiteSpace: 'pre-wrap' 
              }}>
                <strong>Error:</strong> {error.toString()}
                {errorInfo && (
                  <>
                    <br /><br />
                    <strong>Component Stack:</strong>
                    {errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}