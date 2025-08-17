# @elt/ui

Reusable React component library for English Learning Town.

## Overview

A comprehensive collection of reusable React components built with styled-components and TypeScript. Designed for use across any application with zero game-specific dependencies.

## Features

- **Reusable Components**: Button, Input, AnimatedEmoji, LoadingScreen
- **Error Boundaries**: Comprehensive error handling components
- **Theme System**: Shared styling utilities and theme configuration
- **Fully Tested**: Comprehensive test coverage with React Testing Library
- **Type-Safe**: Full TypeScript support with proper prop interfaces

## Installation

```bash
pnpm add @elt/ui
```

## Quick Start

```typescript
import { Button, Input, LoadingScreen, AnimatedEmoji } from '@elt/ui';

function App() {
  return (
    <div>
      <Button variant="primary" onClick={() => console.log('Clicked!')}>
        Click me! 🚀
      </Button>
      
      <Input 
        placeholder="Enter your name"
        onChange={(e) => console.log(e.target.value)}
      />
      
      <AnimatedEmoji 
        emoji="🎉" 
        mood="excited" 
        autoAnimate 
      />
      
      <LoadingScreen />
    </div>
  );
}
```

## Components

### Basic Components

**Button**
- Multiple variants: primary, secondary, ghost, outline
- Size options: sm, md, lg
- Emoji parsing support
- Loading states and disabled states

**Input**
- Styled form input with theme integration
- Error state styling
- Placeholder and validation support

**AnimatedEmoji**
- Mood-based animations: happy, excited, thinking, surprised, floating
- Click interactions
- Customizable size and auto-animation

### Feedback Components

**LoadingScreen**
- Full-screen loading overlay
- Animated spinner
- Customizable messaging

**Spinner**
- Reusable loading indicator
- Multiple size options
- Theme-integrated styling

### Error Handling

**ErrorBoundary**
- React error boundary implementation
- Fallback UI for component errors
- Error logging and reporting

**ErrorFallback**
- Customizable error display component
- Retry functionality
- Multiple error types and styling

**AsyncErrorBoundary**
- Error boundary for async operations
- Loading state management
- Error recovery mechanisms

## Theme System

```typescript
import { theme } from '@elt/ui';

// Access theme properties
const primaryColor = theme.colors.primary;
const spacing = theme.spacing[4];
const borderRadius = theme.borderRadius.md;

// Available theme sections:
// - colors: primary, secondary, surface, background, etc.
// - spacing: 1-16 spacing scale
// - fontSizes: xs, sm, base, lg, xl, 2xl, etc.
// - fonts: heading, body, mono
// - borderRadius: sm, md, lg, xl, full
// - shadows: small, medium, large
// - gradients: primary, background
```

## Utilities

**Emoji Parser**
- Extracts and processes emoji from text
- Used internally by Button component
- Supports emoji detection and replacement

**Error Helpers**
- Utility functions for error boundary components
- Error categorization and handling
- Recovery action generators

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode  
pnpm test --watch

# Build package
pnpm build

# Build in watch mode
pnpm build --watch
```

## Testing

Comprehensive test suite covering:

- Component rendering and interactions
- Theme integration
- Error boundary functionality
- Utility functions
- Accessibility features

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## License

Private - English Learning Town Project