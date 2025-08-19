import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/basic/Button';

describe('Button Component', () => {
  it('renders button with text content', () => {
    render(<Button onClick={() => {}}>Test Button</Button>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button onClick={() => {}} variant="primary">Primary</Button>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(<Button onClick={() => {}} variant="secondary">Secondary</Button>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('extracts emoji from content', () => {
    render(<Button onClick={() => {}}>🚀 Launch</Button>);
    
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    render(<Button onClick={() => {}} size="lg">Large Button</Button>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports full width', () => {
    render(<Button onClick={() => {}} fullWidth>Full Width</Button>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});