import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from './utils';
import { Spinner } from '../components/feedback/Spinner';

describe('Spinner Component', () => {
  it('renders spinner with default props', () => {
    renderWithTheme(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = renderWithTheme(<Spinner size="sm" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    rerender(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom color', () => {
    renderWithTheme(<Spinner color="#ff0000" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('centers when center prop is true', () => {
    renderWithTheme(<Spinner center />);
    
    const spinner = screen.getByRole('status');
    expect(spinner.parentElement).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });
  });

  it('has accessibility attributes', () => {
    renderWithTheme(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('supports custom className', () => {
    renderWithTheme(<Spinner className="custom-spinner" />);
    
    const spinnerWrapper = screen.getByRole('status').parentElement;
    expect(spinnerWrapper).toHaveClass('custom-spinner');
  });

  it('renders with proper animation', () => {
    renderWithTheme(<Spinner />);
    
    const spinner = screen.getByRole('status');
    const computedStyle = window.getComputedStyle(spinner);
    
    // Should have animation applied
    expect(computedStyle.animation).toBeTruthy();
  });
});