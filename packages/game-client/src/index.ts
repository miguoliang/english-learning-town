/**
 * @elt/game-client - Game-specific React components for English Learning Town
 * 
 * A comprehensive game UI library with:
 * - CSS-only theming system (compatible with @elt/ui)
 * - Game progress components (XP bars, quest trackers)
 * - Educational game error handling
 * - Learning analytics integration
 * - TypeScript definitions
 * 
 * Usage:
 * import { XPProgressBar, QuestTracker } from '@elt/game-client';
 * import '@elt/game-client/components.css'; // Import CSS styles
 */

// Export core migrated components
export * from './components/progress/XPProgressBar';
export * from './components/quest/QuestTracker';
export * from './components/ErrorBoundary';

// Re-export commonly used UI components for convenience
export { AnimatedEmoji, Button, Input, LoadingScreen, Spinner } from '@elt/ui';

// Note: CSS files should be imported directly
// import '@elt/game-client/components.css'