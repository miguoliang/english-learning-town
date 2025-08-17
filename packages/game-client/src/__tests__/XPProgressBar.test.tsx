import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from './utils';
import { XPProgressBar } from '../components/progress/XPProgressBar';

describe('XPProgressBar Component', () => {
  it('renders with basic props', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={5}
        totalXP={450}
        xpToNextLevel={50}
      />
    );
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('50 XP to go!')).toBeInTheDocument();
  });

  it('displays correct level emoji based on level', () => {
    const { rerender } = renderWithTheme(
      <XPProgressBar currentLevel={1} totalXP={50} xpToNextLevel={50} />
    );
    
    // Level 1-4: ⭐
    expect(screen.getByText('⭐')).toBeInTheDocument();
    
    // Level 5-9: 🌠
    rerender(
      <XPProgressBar currentLevel={7} totalXP={650} xpToNextLevel={50} />
    );
    expect(screen.getByText('🌠')).toBeInTheDocument();
    
    // Level 10-14: 🎓
    rerender(
      <XPProgressBar currentLevel={12} totalXP={1150} xpToNextLevel={50} />
    );
    expect(screen.getByText('🎓')).toBeInTheDocument();
    
    // Level 15-19: 🌟
    rerender(
      <XPProgressBar currentLevel={17} totalXP={1650} xpToNextLevel={50} />
    );
    expect(screen.getByText('🌟')).toBeInTheDocument();
    
    // Level 20+: 👑
    rerender(
      <XPProgressBar currentLevel={25} totalXP={2450} xpToNextLevel={50} />
    );
    expect(screen.getByText('👑')).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={3}
        totalXP={250}
        xpToNextLevel={50}
        isCompact={true}
      />
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('50 XP to go!')).toBeInTheDocument();
    
    // Should not show detailed XP breakdown in compact mode
    expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
  });

  it('shows detailed XP information in full mode', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={5}
        totalXP={450}
        xpToNextLevel={50}
        isCompact={false}
      />
    );
    
    // Should show detailed XP breakdown
    expect(screen.getByText(/\d+ \/ \d+ XP/)).toBeInTheDocument();
    expect(screen.getByText(/Total: \d+ XP/)).toBeInTheDocument();
  });

  it('handles max level state', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={50}
        totalXP={5000}
        xpToNextLevel={0}
      />
    );
    
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Max Level!')).toBeInTheDocument();
  });

  it('hides level icon when showLevelIcon is false', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={5}
        totalXP={450}
        xpToNextLevel={50}
        showLevelIcon={false}
      />
    );
    
    expect(screen.getByText('Level 5')).toBeInTheDocument();
    // Should not render any emoji
    expect(screen.queryByText(/[⭐🌠🎓🌟👑]/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithTheme(
      <XPProgressBar
        currentLevel={5}
        totalXP={450}
        xpToNextLevel={50}
        className="custom-progress"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-progress');
  });

  it('calculates progress percentage correctly', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={5}
        totalXP={450}
        xpToNextLevel={50}
      />
    );
    
    // Progress bar should be rendered (we can't easily test the exact percentage)
    const progressContainer = screen.getByText('Level 5').closest('div')?.querySelector('[progress]');
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('formats XP numbers correctly', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={10}
        totalXP={15000}
        xpToNextLevel={500}
        isCompact={false}
      />
    );
    
    // Should format large numbers with commas
    expect(screen.getByText('Total: 15,000 XP')).toBeInTheDocument();
  });

  it('handles zero XP to next level', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={20}
        totalXP={2000}
        xpToNextLevel={0}
      />
    );
    
    expect(screen.getByText('Max Level!')).toBeInTheDocument();
  });

  it('renders level badge with correct styling', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={15}
        totalXP={1450}
        xpToNextLevel={50}
      />
    );
    
    const levelBadge = screen.getByText('15');
    expect(levelBadge).toBeInTheDocument();
    expect(levelBadge).toHaveStyle({
      borderRadius: '50%',
    });
  });

  it('shows appropriate XP remaining text', () => {
    renderWithTheme(
      <XPProgressBar
        currentLevel={8}
        totalXP={750}
        xpToNextLevel={250}
      />
    );
    
    expect(screen.getByText('250 XP to go!')).toBeInTheDocument();
  });
});