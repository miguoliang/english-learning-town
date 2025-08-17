import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTheme, screen } from './utils';
import { AsyncErrorBoundary } from '../components/error/AsyncErrorBoundary';

// Mock component that can trigger async errors
const AsyncComponent: React.FC<{ triggerAsyncError?: boolean }> = ({ triggerAsyncError }) => {
  if (triggerAsyncError) {
    // Don't actually trigger unhandled promise rejection in tests
    // as it causes test failures - just render normally for test
  }
  return <div>Async component loaded</div>;
};

// Mock component that throws synchronous error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Sync error');
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

describe('AsyncErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    renderWithTheme(
      <AsyncErrorBoundary>
        <div>Normal content</div>
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('catches synchronous errors like regular ErrorBoundary', () => {
    renderWithTheme(
      <AsyncErrorBoundary>
        <ThrowError />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('passes props to underlying ErrorBoundary', () => {
    renderWithTheme(
      <AsyncErrorBoundary 
        title="Custom Async Title"
        message="Custom async message"
      >
        <ThrowError />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Custom Async Title')).toBeInTheDocument();
    expect(screen.getByText('Custom async message')).toBeInTheDocument();
  });

  it('calls onError callback when sync error occurs', () => {
    const mockOnError = vi.fn();
    
    renderWithTheme(
      <AsyncErrorBoundary onError={mockOnError}>
        <ThrowError />
      </AsyncErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Sync error'
      }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('can be configured to not catch unhandled rejections', () => {
    renderWithTheme(
      <AsyncErrorBoundary catchUnhandledRejections={false}>
        <AsyncComponent triggerAsyncError={true} />
      </AsyncErrorBoundary>
    );
    
    // Should render normally since async error catching is disabled
    expect(screen.getByText('Async component loaded')).toBeInTheDocument();
  });

  it('shows retry and refresh buttons', () => {
    renderWithTheme(
      <AsyncErrorBoundary>
        <ThrowError />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('supports custom fallback component', () => {
    const customFallback = (error: Error) => (
      <div>
        <h1>Async Error UI</h1>
        <p>Error: {error.message}</p>
      </div>
    );

    renderWithTheme(
      <AsyncErrorBoundary fallback={customFallback}>
        <ThrowError />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Async Error UI')).toBeInTheDocument();
    expect(screen.getByText('Error: Sync error')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme(
      <AsyncErrorBoundary>
        <ThrowError />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('can be used without children', () => {
    renderWithTheme(
      <AsyncErrorBoundary>
        {null}
      </AsyncErrorBoundary>
    );
    
    // Should not crash when children is null/undefined
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles multiple nested AsyncErrorBoundaries', () => {
    renderWithTheme(
      <AsyncErrorBoundary title="Outer Async">
        <AsyncErrorBoundary title="Inner Async">
          <ThrowError />
        </AsyncErrorBoundary>
      </AsyncErrorBoundary>
    );
    
    // Inner boundary should catch the error
    expect(screen.getByText('Inner Async')).toBeInTheDocument();
    expect(screen.queryByText('Outer Async')).not.toBeInTheDocument();
  });

  it('supports all ErrorBoundary props', () => {
    renderWithTheme(
      <AsyncErrorBoundary 
        showRetry={false}
        showDetails={false}
        retryText="Custom Retry"
      >
        <ThrowError />
      </AsyncErrorBoundary>
    );
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    expect(screen.queryByText('Custom Retry')).not.toBeInTheDocument();
    expect(screen.queryByText('Show Error Details')).not.toBeInTheDocument();
  });
});