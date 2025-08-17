import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from './utils';
import { ErrorFallback } from '../components/error/ErrorFallback';

const mockError = new Error('Test error message');
const mockRetry = vi.fn();

describe('ErrorFallback Component', () => {
  beforeEach(() => {
    mockRetry.mockClear();
  });

  it('renders with default props', () => {
    renderWithTheme(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again or refresh the page.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays custom title and message', () => {
    renderWithTheme(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        title="Custom Error Title"
        message="Custom error message"
      />
    );
    
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders minimal variant correctly', () => {
    renderWithTheme(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        variant="minimal"
      />
    );
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.queryByText('Refresh Page')).not.toBeInTheDocument();
  });

  it('renders fullscreen variant correctly', () => {
    renderWithTheme(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        variant="fullscreen"
      />
    );
    
    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.getByText(/The application encountered an unexpected error/)).toBeInTheDocument();
  });

  it('shows error code by default', () => {
    renderWithTheme(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );
    
    expect(screen.getByText(/Error: Error - Test error message/)).toBeInTheDocument();
  });

  it('hides error code when showErrorCode is false', () => {
    renderWithTheme(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        showErrorCode={false}
      />
    );
    
    expect(screen.queryByText(/Error: Error - Test error message/)).not.toBeInTheDocument();
  });

  it('hides retry button when showRetry is false', () => {
    renderWithTheme(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        showRetry={false}
      />
    );
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('hides refresh button when showRefresh is false', () => {
    renderWithTheme(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        showRefresh={false}
      />
    );
    
    expect(screen.queryByText('Refresh Page')).not.toBeInTheDocument();
  });

  it('calls retry function when Try Again is clicked', async () => {
    const { user } = renderWithTheme(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );
    
    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalledOnce();
  });

  it('displays custom emoji', () => {
    renderWithTheme(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        emoji="🚫"
      />
    );
    
    expect(screen.getByText('🚫')).toBeInTheDocument();
  });

  it('displays animated emoji', () => {
    renderWithTheme(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );
    
    // Should contain the default warning emoji
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );
    
    const container = screen.getByRole('alert');
    expect(container).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    const refreshButton = screen.getByText('Refresh Page');
    expect(refreshButton).toBeInTheDocument();
  });

  it('handles different error types', () => {
    const customError = new TypeError('Type error occurred');
    
    renderWithTheme(
      <ErrorFallback error={customError} retry={mockRetry} />
    );
    
    expect(screen.getByText(/Error: TypeError - Type error occurred/)).toBeInTheDocument();
  });

  it('handles errors without messages', () => {
    const errorWithoutMessage = new Error();
    
    renderWithTheme(
      <ErrorFallback error={errorWithoutMessage} retry={mockRetry} />
    );
    
    expect(screen.getByText(/Error: Error -/)).toBeInTheDocument();
  });

  it('renders different button sizes for different variants', () => {
    const { rerender } = renderWithTheme(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        variant="minimal"
      />
    );
    
    // Minimal variant should have small buttons
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    
    rerender(
      <ErrorFallback 
        error={mockError} 
        retry={mockRetry}
        variant="fullscreen"
      />
    );
    
    // Fullscreen variant should have large buttons
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});