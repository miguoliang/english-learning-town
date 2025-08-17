/**
 * @elt/game-client - Game-specific React components for English Learning Town
 * 
 * Specialized components for educational game features:
 * - Progress tracking and leveling
 * - Quest management
 * - Dialogue systems
 * - Achievement displays
 * - Game UI elements
 */

// Export all components
export * from './components';

// Export error boundary components
export {
  ErrorBoundary,
  LearningErrorBoundary,
  DashboardErrorBoundary,
  useErrorHandler
} from './components/ErrorBoundary';

// Re-export commonly used UI components for convenience
export { AnimatedEmoji, Button, Input, LoadingScreen, Spinner } from '@elt/ui';