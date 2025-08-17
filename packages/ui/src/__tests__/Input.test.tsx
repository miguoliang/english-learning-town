import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from './utils';
import { Input } from '../components/forms/Input';

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    renderWithTheme(
      <Input placeholder="Enter your name" />
    );
    
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    const { user } = renderWithTheme(
      <Input onChange={handleChange} />
    );
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('Hello World');
  });

  it('applies different variants correctly', () => {
    const { rerender } = renderWithTheme(
      <Input variant="primary" placeholder="Primary input" />
    );
    
    expect(screen.getByPlaceholderText('Primary input')).toBeInTheDocument();
    
    rerender(<Input variant="secondary" placeholder="Secondary input" />);
    expect(screen.getByPlaceholderText('Secondary input')).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <Input size="sm" placeholder="Small input" />
    );
    
    expect(screen.getByPlaceholderText('Small input')).toBeInTheDocument();
    
    rerender(<Input size="lg" placeholder="Large input" />);
    expect(screen.getByPlaceholderText('Large input')).toBeInTheDocument();
  });

  it('shows error state correctly', () => {
    renderWithTheme(
      <Input error="This field is required" placeholder="Error input" />
    );
    
    expect(screen.getByPlaceholderText('Error input')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    renderWithTheme(
      <Input disabled placeholder="Disabled input" />
    );
    
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('supports full width', () => {
    renderWithTheme(
      <Input fullWidth placeholder="Full width input" />
    );
    
    expect(screen.getByPlaceholderText('Full width input')).toBeInTheDocument();
  });

  it('handles focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const { user } = renderWithTheme(
      <Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Focus test" />
    );
    
    const input = screen.getByPlaceholderText('Focus test');
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalled();
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('supports different input types', () => {
    const { rerender } = renderWithTheme(
      <Input type="email" placeholder="Email input" />
    );
    
    expect(screen.getByPlaceholderText('Email input')).toHaveAttribute('type', 'email');
    
    rerender(<Input type="password" placeholder="Password input" />);
    expect(screen.getByPlaceholderText('Password input')).toHaveAttribute('type', 'password');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    renderWithTheme(<Input ref={ref} placeholder="Ref test" />);
    
    expect(ref).toHaveBeenCalled();
  });
});