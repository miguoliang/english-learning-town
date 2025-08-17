import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Button } from '../components/basic/Button';
import { theme } from '../styles/theme';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('Button Component', () => {
  it('renders button with text content', () => {
    render(
      <TestWrapper>
        <Button onClick={() => {}}>Test Button</Button>
      </TestWrapper>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    
    render(
      <TestWrapper>
        <Button onClick={handleClick}>Click me</Button>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    
    render(
      <TestWrapper>
        <Button onClick={handleClick} disabled>Disabled Button</Button>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <TestWrapper>
        <Button onClick={() => {}} variant="primary">Primary</Button>
      </TestWrapper>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(
      <TestWrapper>
        <Button onClick={() => {}} variant="secondary">Secondary</Button>
      </TestWrapper>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('extracts emoji from content', () => {
    render(
      <TestWrapper>
        <Button onClick={() => {}}>🚀 Launch</Button>
      </TestWrapper>
    );
    
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    render(
      <TestWrapper>
        <Button onClick={() => {}} size="lg">Large Button</Button>
      </TestWrapper>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports full width', () => {
    render(
      <TestWrapper>
        <Button onClick={() => {}} fullWidth>Full Width</Button>
      </TestWrapper>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});