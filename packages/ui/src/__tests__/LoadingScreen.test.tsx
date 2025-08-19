import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from './utils';
import { LoadingScreen } from '../components/feedback/LoadingScreen';

describe('LoadingScreen Component', () => {
  it('renders loading screen with default message', () => {
    renderWithTheme(<LoadingScreen />);
    
    expect(screen.getByRole('heading', { name: 'Loading...' })).toBeInTheDocument();
    expect(screen.getByText('Please wait while we prepare your learning adventure!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    renderWithTheme(<LoadingScreen title="Loading game data..." />);
    
    expect(screen.getByText('Loading game data...')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    renderWithTheme(<LoadingScreen title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderWithTheme(
      <LoadingScreen 
        title="Loading"
        subtitle="Please wait while we prepare your adventure"
      />
    );
    
    expect(screen.getByText('Please wait while we prepare your adventure')).toBeInTheDocument();
  });

  it('shows progress when provided', () => {
    renderWithTheme(<LoadingScreen progress={75} />);
    
    // Progress bar should be visible
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });

  it('renders animated emoji', () => {
    renderWithTheme(<LoadingScreen />);
    
    // Should contain default educational emoji
    expect(screen.getByText('🎓')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme(<LoadingScreen />);
    
    const loadingContainer = document.querySelector('.elt-loading');
    expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('displays hints when provided', () => {
    const hints = [
      'Practice speaking every day!',
      'Try talking to NPCs for vocabulary practice'
    ];
    
    renderWithTheme(<LoadingScreen hints={hints} />);
    
    // Should display both hints with Tip prefix
    expect(screen.getByText('💡 Tip: Practice speaking every day!')).toBeInTheDocument();
    expect(screen.getByText('💡 Tip: Try talking to NPCs for vocabulary practice')).toBeInTheDocument();
  });

  it('covers full screen', () => {
    renderWithTheme(<LoadingScreen fullScreen />);
    
    const container = document.querySelector('.elt-loading');
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0'
    });
  });
});