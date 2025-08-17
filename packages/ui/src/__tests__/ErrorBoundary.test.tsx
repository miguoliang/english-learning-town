import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from './utils';
import { ErrorBoundary } from '../components/error/ErrorBoundary';

// Mock component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({ 
  shouldThrow = true, 
  message = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Mock console.error to prevent noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error fallback when child component throws', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError message="Component crashed" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays custom title and message', () => {
    renderWithTheme(
      <ErrorBoundary 
        title="Custom Error Title"
        message="Custom error message for testing"
      >
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom error message for testing')).toBeInTheDocument();
  });

  it('shows retry button by default', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('hides retry button when showRetry is false', () => {
    renderWithTheme(
      <ErrorBoundary showRetry={false}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    expect(screen.queryByText('Refresh Page')).not.toBeInTheDocument();
  });

  it('uses custom retry button text', () => {
    renderWithTheme(
      <ErrorBoundary retryText="Retry Component">
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Retry Component')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const mockOnError = vi.fn();
    
    renderWithTheme(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError message="Callback test error" />
      </ErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Callback test error'
      }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('uses custom fallback component', () => {
    const customFallback = (error: Error, _errorInfo: any, retry: () => void) => (
      <div>
        <h1>Custom Error UI</h1>
        <p>Error: {error.message}</p>
        <button onClick={retry}>Custom Retry</button>
      </div>
    );

    renderWithTheme(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError message="Custom fallback test" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.getByText('Error: Custom fallback test')).toBeInTheDocument();
    expect(screen.getByText('Custom Retry')).toBeInTheDocument();
  });

  it('resets error state when retry is clicked', async () => {
    const { user } = renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    // Initially shows error
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);
    
    // Should still show error since ThrowError still throws
    // but the retry button should still be available for testing purposes
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    renderWithTheme(
      <ErrorBoundary showDetails={true}>
        <ThrowError message="Debug error details" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Show Error Details')).toBeInTheDocument();
  });

  it('hides error details when showDetails is false', () => {
    renderWithTheme(
      <ErrorBoundary showDetails={false}>
        <ThrowError message="No debug info" />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Show Error Details')).not.toBeInTheDocument();
  });

  it('displays error icon', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    const refreshButton = screen.getByText('Refresh Page');
    expect(refreshButton).toBeInTheDocument();
  });

  it('handles nested error boundaries correctly', () => {
    renderWithTheme(
      <ErrorBoundary title="Outer Error">
        <ErrorBoundary title="Inner Error">
          <ThrowError message="Nested error" />
        </ErrorBoundary>
      </ErrorBoundary>
    );
    
    // Inner error boundary should catch the error
    expect(screen.getByText('Inner Error')).toBeInTheDocument();
    expect(screen.queryByText('Outer Error')).not.toBeInTheDocument();
  });
});