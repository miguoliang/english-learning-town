# @elt/game-client

Game-specific React components for English Learning Town with CSS-only theming architecture.

## Overview

The `@elt/game-client` package provides specialized UI components for educational game features including progress tracking, quest management, and error handling. Built with a CSS-only theming system for optimal performance and architectural consistency with the broader monorepo.

## Installation

```bash
# Install the package
pnpm add @elt/game-client

# Install peer dependencies
pnpm add @elt/ui @elt/core @elt/learning-algorithms @elt/learning-analytics
```

## Usage

```typescript
import { XPProgressBar, QuestTracker, ErrorBoundary } from '@elt/game-client';
import '@elt/game-client/components.css'; // Required CSS import

function GameUI() {
  return (
    <ErrorBoundary>
      <XPProgressBar
        currentLevel={5}
        totalXP={1250}
        xpToNextLevel={150}
        isCompact={false}
      />

      <QuestTracker
        quests={gameQuests}
        activeQuestId="quest-1"
        onQuestClick={(questId) => console.log('Quest clicked:', questId)}
      />
    </ErrorBoundary>
  );
}
```

## Architecture

### CSS-Only Theming System

The package follows a **CSS-only architecture** for consistent theming across the monorepo:

```
@elt/game-client/
├── src/
│   ├── components/          # React components with CSS classes
│   ├── styles/              # CSS-only theming system
│   │   ├── tokens.css       # Game-specific design tokens
│   │   ├── animations.css   # Game UI animations
│   │   └── components.css   # Component styling
│   └── index.ts             # Package exports
└── dist/
    ├── index.js             # Bundled JavaScript
    ├── index.d.ts           # TypeScript definitions
    └── *.css                # Distributable CSS files
```

### Design System Integration

Extends the `@elt/ui` design system with game-specific tokens:

```css
/* tokens.css - Game-specific design tokens */
:root {
  /* Extends @elt/ui tokens */
  --elt-game-color-xp: #ffd700; /* XP gold */
  --elt-game-color-quest: #4ecdc4; /* Quest accent */
  --elt-game-color-achievement: #9b59b6; /* Achievement purple */
  --elt-game-gradient-xp: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  --elt-game-shadow-tracker: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

## Components

### XPProgressBar

Displays player experience and level progression with animated progress bars.

```typescript
interface XPProgressBarProps {
  currentLevel: number; // Current player level
  totalXP: number; // Total accumulated XP
  xpToNextLevel: number; // XP needed for next level
  isCompact?: boolean; // Compact display mode
  showLevelIcon?: boolean; // Show emoji level indicator
  className?: string; // Additional CSS classes
}
```

**Features:**

- Animated progress bar with shimmer effect
- Level badge with glow animation
- Compact and full display modes
- Level-based emoji indicators (⭐ → 🌠 → 🎓 → 🌟 → 👑)
- Responsive design

**CSS Classes:**

- `.elt-game-progress-container` - Main container
- `.elt-game-progress-container--compact` - Compact mode
- `.elt-game-level-badge` - Level number badge
- `.elt-game-progress-bar` - Progress bar track
- `.elt-game-progress-fill` - Animated progress fill

### QuestTracker

Fixed-position quest tracking component with scrollable quest list.

```typescript
interface Quest {
  id: string; // Unique quest identifier
  title: string; // Display title
  description: string; // Quest description
  progress: number; // Current progress
  maxProgress: number; // Progress target
  isActive?: boolean; // Active quest highlight
}

interface QuestTrackerProps {
  quests: Quest[]; // Array of quests to display
  activeQuestId?: string; // Currently active quest ID
  onQuestClick?: (questId: string) => void; // Quest selection handler
  className?: string; // Additional CSS classes
}
```

**Features:**

- Fixed positioning on screen edge
- Scrollable quest list with custom scrollbars
- Progress indicators per quest
- Active quest highlighting
- Click interactions for quest selection
- Responsive design with mobile optimizations
- Empty state handling

**CSS Classes:**

- `.elt-game-tracker-container` - Main fixed container
- `.elt-game-quest-list` - Scrollable quest container
- `.elt-game-quest-item` - Individual quest item
- `.elt-game-quest-item--active` - Active quest styling
- `.elt-game-quest-progress-bar` - Quest progress indicator

### ErrorBoundary System

Comprehensive error handling for educational game components.

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: string) => void;
  isolate?: boolean;          // Isolate error catching
}

// Specialized error boundaries
<LearningErrorBoundary componentName="Vocabulary Quiz" onRetry={handleRetry}>
  <VocabularyComponent />
</LearningErrorBoundary>

<DashboardErrorBoundary dashboardName="Progress Dashboard">
  <ProgressDashboard />
</DashboardErrorBoundary>
```

**Features:**

- Multiple error boundary types for different use cases
- Custom fallback UI with game-appropriate messaging
- Auto-retry functionality with timeouts
- Development-friendly error details
- Educational context-aware error messages
- Integration with learning analytics

**CSS Classes:**

- `.elt-game-error` - Main error container
- `.elt-game-error__title` - Error title styling
- `.elt-game-error__message` - Error message text
- `.elt-game-error__buttons` - Action button container
- `.elt-game-error__details` - Development error details

## Entity Relationships & Data Flow

### ECS Integration

The components integrate with the ECS (Entity Component System) architecture from `@elt/core`:

```typescript
// ECS World → Game Client Components
const gameWorld = new World();

// XP Component (from ECS)
interface XPComponent extends Component {
  currentLevel: number;
  totalXP: number;
  xpToNextLevel: number;
}

// Quest Component (from ECS)
interface QuestComponent extends Component {
  activeQuests: Quest[];
  completedQuests: string[];
}

// React Integration
function GameHUD() {
  const { xp, quests } = useECSData(gameWorld);

  return (
    <>
      <XPProgressBar {...xp} />
      <QuestTracker quests={quests.activeQuests} />
    </>
  );
}
```

### Learning Analytics Integration

Components integrate with `@elt/learning-analytics` for educational tracking:

```typescript
import { ProgressTracker, AchievementEngine } from "@elt/learning-analytics";

// XP Progress triggers analytics
const handleXPGain = (xpAmount: number) => {
  ProgressTracker.recordXPGain(xpAmount);
  AchievementEngine.checkLevelAchievements(currentLevel);
};

// Quest completion analytics
const handleQuestComplete = (questId: string) => {
  ProgressTracker.recordQuestCompletion(questId);
  AchievementEngine.checkQuestAchievements(questId);
};
```

### State Management Flow

```
ECS World (Game State)
       ↓
React Hooks (useECSData)
       ↓
Game Client Components
       ↓
User Interactions
       ↓
Learning Analytics
       ↓
ECS Systems Update
       ↓
Component Re-render
```

## Animation System

### CSS Animations

All animations are implemented in pure CSS for optimal performance:

```css
/* Progress fill animation */
@keyframes elt-game-progress-fill {
  from {
    width: 0%;
  }
  to {
    width: var(--progress-width);
  }
}

/* Level badge glow effect */
@keyframes elt-game-level-glow {
  0%,
  100% {
    box-shadow: var(--elt-game-shadow-badge);
  }
  50% {
    box-shadow: var(--elt-game-shadow-glow);
  }
}

/* Quest tracker slide-in */
@keyframes elt-game-quest-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Animation Triggers

Animations are triggered by:

- **XP changes**: Progress bar fills animate smoothly
- **Level ups**: Badge glow intensifies with pulse effect
- **Quest updates**: New quests slide in from the right
- **Interactions**: Hover effects and click feedback

## Responsive Design

### Breakpoints

Components adapt to different screen sizes:

```css
/* Mobile optimizations */
@media (max-width: 768px) {
  .elt-game-tracker-container {
    width: 280px;
    top: 60px;
    right: 10px;
  }

  .elt-game-progress-container {
    min-width: 200px;
    padding: var(--elt-game-spacing-sm);
  }
}
```

### Adaptive Features

- **Quest Tracker**: Reduces width and repositions on mobile
- **XP Progress Bar**: Switches to compact mode automatically
- **Error Boundaries**: Adjusts button layout for smaller screens
- **Touch Interactions**: Optimized touch targets for mobile devices

## Accessibility

### ARIA Support

All components include proper accessibility attributes:

```typescript
// XP Progress Bar
<div
  role="progressbar"
  aria-valuenow={progressPercentage}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Level ${currentLevel}, ${xpToNextLevel} XP to next level`}
>

// Quest Items
<div
  role="button"
  tabIndex={0}
  aria-selected={isActive}
  aria-describedby={`quest-progress-${quest.id}`}
>

// Error Boundaries
<div role="alert" aria-live="assertive">
```

### Keyboard Navigation

- **Tab Navigation**: All interactive elements are keyboard accessible
- **Enter/Space**: Activates quest selection and error recovery
- **Arrow Keys**: Navigate between quest items
- **Escape**: Dismisses error dialogs (where applicable)

## Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { XPProgressBar } from '@elt/game-client';

describe('XPProgressBar', () => {
  it('displays correct level and XP information', () => {
    render(
      <XPProgressBar
        currentLevel={5}
        totalXP={1250}
        xpToNextLevel={150}
      />
    );

    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('150 XP to go!')).toBeInTheDocument();
  });

  it('shows progress bar with correct percentage', () => {
    const { container } = render(
      <XPProgressBar currentLevel={5} totalXP={1250} xpToNextLevel={150} />
    );

    const progressFill = container.querySelector('.elt-game-progress-fill');
    expect(progressFill).toHaveStyle({ width: '89.3%' });
  });
});
```

## Performance Considerations

### Bundle Size Optimization

- **CSS-only theming**: No runtime JavaScript for styling
- **Tree shaking**: Import only the components you need
- **Code splitting**: Components can be loaded on demand
- **Minimal dependencies**: Only essential peer dependencies

### Runtime Performance

- **CSS animations**: Hardware-accelerated animations
- **Efficient re-renders**: Minimal prop changes trigger re-renders
- **Event delegation**: Optimized event handling
- **Memoization**: React.memo used where appropriate

## Development

### Building

```bash
# Build the package
pnpm build

# Build with CSS copying
pnpm build  # Automatically copies src/styles/*.css to dist/

# Development mode
pnpm dev    # Watch mode with hot reloading
```

### Adding New Components

1. **Create component** in `src/components/`
2. **Add CSS styles** in `src/styles/components.css`
3. **Export component** in `src/index.ts`
4. **Write tests** in `src/__tests__/`
5. **Update README** with component documentation

### CSS Architecture Guidelines

```css
/* Follow BEM-style naming convention */
.elt-game-{component}                    /* Block */
.elt-game-{component}__element           /* Element */
.elt-game-{component}--modifier          /* Modifier */

/* Use CSS custom properties for theming */
.elt-game-button {
  background: var(--elt-game-color-primary);
  border-radius: var(--elt-game-border-radius-md);
  padding: var(--elt-game-spacing-md);
}

/* Responsive design with mobile-first approach */
.elt-game-component {
  /* Mobile styles first */
  width: 280px;
}

@media (min-width: 768px) {
  .elt-game-component {
    /* Desktop enhancements */
    width: 320px;
  }
}
```

## Integration Examples

### Full Game HUD Example

```typescript
import { XPProgressBar, QuestTracker, LearningErrorBoundary } from '@elt/game-client';
import '@elt/game-client/components.css';

function GameHUD({ gameState }: { gameState: GameState }) {
  return (
    <div className="game-hud">
      {/* XP Progress in top-left */}
      <div className="hud-top-left">
        <LearningErrorBoundary componentName="XP Progress">
          <XPProgressBar
            currentLevel={gameState.player.level}
            totalXP={gameState.player.totalXP}
            xpToNextLevel={gameState.player.xpToNextLevel}
            isCompact={gameState.ui.compactMode}
          />
        </LearningErrorBoundary>
      </div>

      {/* Quest Tracker in top-right */}
      <LearningErrorBoundary componentName="Quest Tracker">
        <QuestTracker
          quests={gameState.quests.active}
          activeQuestId={gameState.quests.currentId}
          onQuestClick={(questId) => gameState.selectQuest(questId)}
        />
      </LearningErrorBoundary>
    </div>
  );
}
```

### Learning Progress Integration

```typescript
import { useEffect } from 'react';
import { XPProgressBar } from '@elt/game-client';
import { LearningAnalytics } from '@elt/learning-analytics';

function ProgressTrackingExample() {
  const [playerData, setPlayerData] = useState({
    level: 1,
    totalXP: 0,
    xpToNextLevel: 100
  });

  // Analytics integration
  useEffect(() => {
    const unsubscribe = LearningAnalytics.subscribe('xp_gained', (event) => {
      setPlayerData(current => ({
        ...current,
        totalXP: current.totalXP + event.amount,
        xpToNextLevel: Math.max(0, current.xpToNextLevel - event.amount)
      }));
    });

    return unsubscribe;
  }, []);

  return (
    <XPProgressBar
      currentLevel={playerData.level}
      totalXP={playerData.totalXP}
      xpToNextLevel={playerData.xpToNextLevel}
    />
  );
}
```

## Troubleshooting

### Common Issues

**CSS not applying:**

```typescript
// Make sure to import CSS
import "@elt/game-client/components.css";

// Check CSS load order - should be after @elt/ui
import "@elt/ui/theme.css";
import "@elt/game-client/components.css";
```

**TypeScript errors:**

```typescript
// Use type-only imports for interfaces
import type { Quest, XPProgressBarProps } from "@elt/game-client";
import { XPProgressBar, QuestTracker } from "@elt/game-client";
```

**Animation not working:**

```css
/* Ensure CSS custom properties are defined */
:root {
  --progress-width: 75%; /* Required for progress animations */
}
```

## Contributing

1. Follow the [CSS architecture guidelines](#css-architecture-guidelines)
2. Ensure all components have proper TypeScript interfaces
3. Add comprehensive tests for new components
4. Update this README with new component documentation
5. Follow the existing naming conventions (`elt-game-*`)

## License

MIT - Part of the English Learning Town educational game project.
