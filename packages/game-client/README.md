# @elt/game-client

Game-specific React components for English Learning Town.

## Overview

Specialized React components for educational game features including progress tracking, quest management, and gamification elements. Built on top of @elt/ui for consistent styling.

## Features

- **Progress Components**: XP bars, level indicators, skill tracking
- **Quest Components**: Quest tracker, objective displays
- **Game-Specific UI**: Educational game interface elements
- **@elt/ui Integration**: Consistent styling with base UI library
- **Fully Tested**: Comprehensive test coverage

## Installation

```bash
pnpm add @elt/game-client @elt/ui
```

## Quick Start

```typescript
import { XPProgressBar, QuestTracker } from '@elt/game-client';

function GameUI() {
  return (
    <div>
      <XPProgressBar
        currentXP={750}
        totalXP={1000}
        level={5}
        xpToNextLevel={250}
        animated
      />
      
      <QuestTracker
        questId="tutorial-quest"
        title="Learn Basic Greetings"
        description="Practice saying hello in different situations"
        objectives={[
          { text: "Talk to the teacher", completed: true },
          { text: "Visit the school", completed: true },
          { text: "Complete dialogue", completed: false }
        ]}
        progress={66}
      />
    </div>
  );
}
```

## Components

### Progress Components

**XPProgressBar**
- Animated experience point visualization
- Level display with progression indicators
- Customizable styling and colors
- Celebration animations for level ups

Props:
```typescript
interface XPProgressBarProps {
  currentXP: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  animated?: boolean;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

### Quest Components

**QuestTracker**
- Visual quest progress display
- Objective checklist with completion states
- Progress percentage indicator
- Expandable/collapsible interface

Props:
```typescript
interface QuestTrackerProps {
  questId: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  progress: number;
  completed?: boolean;
  collapsed?: boolean;
}

interface QuestObjective {
  text: string;
  completed: boolean;
  optional?: boolean;
}
```

## Integration with @elt/ui

All components use @elt/ui as a foundation:

```typescript
import { Button, AnimatedEmoji } from '@elt/ui';

// @elt/game-client components automatically include:
// - Consistent theme integration
// - Shared styling utilities  
// - Error boundary protection
// - Accessibility features
```

## Game Data Integration

Components are designed to work with game state management:

```typescript
import { useGameStore } from '../stores/gameStore';
import { XPProgressBar } from '@elt/game-client';

function PlayerProgress() {
  const player = useGameStore(state => state.player);
  
  return (
    <XPProgressBar
      currentXP={player.experience}
      totalXP={player.progress.totalXP}
      level={player.level}
      xpToNextLevel={player.progress.xpToNextLevel}
      animated
    />
  );
}
```

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

Test suite includes:

- Component rendering with various props
- Progress calculation accuracy
- Animation behavior
- Quest state management
- Integration with @elt/ui components

## Educational Features

Components are specifically designed for learning applications:

- **Visual Feedback**: Clear progress indicators for learner motivation
- **Gamification**: Achievement-style displays for engagement
- **Accessibility**: Screen reader support for inclusive learning
- **Responsive**: Works on mobile devices for portable learning

## Dependencies

- `@elt/ui`: Base UI component library
- `react`: React framework
- `styled-components`: CSS-in-JS styling

## License

Private - English Learning Town Project