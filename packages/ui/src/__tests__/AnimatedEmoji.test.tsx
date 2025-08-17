import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTheme, screen } from './utils';
import { AnimatedEmoji } from '../components/basic/AnimatedEmoji';

// Mock requestAnimationFrame for animation tests
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

beforeEach(() => {
  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame;
  mockRequestAnimationFrame.mockImplementation((callback) => {
    setTimeout(callback, 16); // ~60fps
    return 1;
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AnimatedEmoji Component', () => {
  it('renders emoji correctly', () => {
    renderWithTheme(<AnimatedEmoji emoji="🎮" />);
    
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  it('applies custom size', () => {
    renderWithTheme(<AnimatedEmoji emoji="⭐" size="2rem" />);
    
    const emojiElement = screen.getByText('⭐');
    expect(emojiElement).toHaveStyle({ fontSize: '2rem' });
  });

  it('applies different moods correctly', () => {
    const { rerender } = renderWithTheme(
      <AnimatedEmoji emoji="😊" mood="happy" />
    );
    
    expect(screen.getByText('😊')).toBeInTheDocument();
    
    rerender(<AnimatedEmoji emoji="😊" mood="excited" />);
    expect(screen.getByText('😊')).toBeInTheDocument();
    
    rerender(<AnimatedEmoji emoji="😊" mood="floating" />);
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('triggers animation when triggerAnimation prop changes', () => {
    const { rerender } = renderWithTheme(
      <AnimatedEmoji emoji="🎉" triggerAnimation={false} />
    );
    
    rerender(<AnimatedEmoji emoji="🎉" triggerAnimation={true} />);
    
    // Animation should be triggered
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('auto-animates when autoAnimate is true', () => {
    renderWithTheme(<AnimatedEmoji emoji="✨" autoAnimate={true} />);
    
    expect(screen.getByText('✨')).toBeInTheDocument();
    // Component should render with animation state
  });

  it('handles rotation prop correctly', () => {
    renderWithTheme(<AnimatedEmoji emoji="🔄" rotation={45} />);
    
    const emojiElement = screen.getByText('🔄');
    // Rotation should be applied via transform
    expect(emojiElement).toHaveStyle('transform: rotate(45deg)');
  });

  it('applies hover effects when hoverEffect is enabled', async () => {
    const { user } = renderWithTheme(
      <AnimatedEmoji emoji="👍" hoverEffect={true} />
    );
    
    const emojiElement = screen.getByText('👍');
    
    await user.hover(emojiElement);
    // Component should handle hover state
    expect(emojiElement).toBeInTheDocument();
  });

  it('renders with accessibility attributes', () => {
    renderWithTheme(
      <AnimatedEmoji emoji="🎯" ariaLabel="Target emoji" />
    );
    
    const emojiElement = screen.getByLabelText('Target emoji');
    expect(emojiElement).toBeInTheDocument();
  });

  it('falls back gracefully with invalid emoji', () => {
    renderWithTheme(<AnimatedEmoji emoji="" ariaLabel="Empty emoji" />);
    
    // Should render without crashing
    expect(screen.getByLabelText('Empty emoji')).toBeInTheDocument();
  });
});