# Sprite Movement and Sizing Fixes (2025-01-03)

## 🎯 Problems Solved

### 1. **Sprite Movement Issue**
**Problem**: Sprites were moving to intersection points instead of cell centers
**Root Cause**: Initial positioning and movement logic wasn't properly aligned to grid centers

### 2. **Sprite Sizing Issue** 
**Problem**: NPCs and sprites were visually larger than their allocated grid cell range
**Root Cause**: Component dimensions didn't match 40×40px grid cell size

## 🔧 Technical Solutions

### Movement Fixes (`usePlayerMovement.ts`)

#### Initial Position Fix
```typescript
// Before: Generic snapping
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
return snapToGrid(centerX, centerY);

// After: Explicit grid cell finding
const gridX = Math.floor(screenCenterX / gridSystem.cellSize);
const gridY = Math.floor(screenCenterY / gridSystem.cellSize);
return gridSystem.gridToScreenCenter(gridX, gridY);
```

#### Keyboard Movement Fix
```typescript
// Before: Screen coordinate movement + snapping
newY = prevPosition.y - CELL_SIZE;
const snappedPosition = snapToGrid(newX, newY);

// After: Pure grid coordinate movement
const currentGridX = Math.round((prevPosition.x - CELL_SIZE / 2) / CELL_SIZE);
newGridY = currentGridY - 1;
const newScreenPosition = gridSystem.gridToScreenCenter(newGridX, newGridY);
```

### Sizing Fixes

#### Player Component (`Player.tsx`)
```typescript
// Before: Undersized and wrong centering
width: 32px;
height: 48px;
left: ${props => props.x - 16}px;
top: ${props => props.y - 24}px;

// After: Perfect grid fit
width: 40px;
height: 40px;
left: ${props => props.x - 20}px;  /* 40px / 2 */
top: ${props => props.y - 20}px;   /* 40px / 2 */
```

#### NPC Component (`NPC.tsx`)
```typescript
// Before: Oversized
width: 40px;
height: 60px;
left: ${props => props.x}px;      /* Top-left positioning */
top: ${props => props.y}px;

// After: Perfect grid fit with centering
width: 40px;
height: 40px;
left: ${props => props.x - 20}px;  /* Center horizontally */
top: ${props => props.y - 20}px;   /* Center vertically */
```

#### SpriteRange Component (`SpriteRange.tsx`)
```typescript
// Before: Top-left positioning
left: ${props => props.x}px;
top: ${props => props.y}px;

// After: Dynamic center positioning
left: ${props => props.x - props.width / 2}px;
top: ${props => props.y - props.height / 2}px;
```

#### NPC Positioning Data (`useGameEntities.ts`)
```typescript
// Before: Grid corner positions
{ id: 'teacher', x: 6 * cellSize, y: 7 * cellSize, ... }

// After: Grid center positions  
{ id: 'teacher', x: 6 * cellSize + cellSize/2, y: 7 * cellSize + cellSize/2, ... }
```

## 📐 Grid System Specifications

### Cell Dimensions
- **Grid Cell Size**: 40px × 40px (square cells)
- **Sprite Size**: 40px × 40px (perfect 1:1 fit)
- **Multi-cell Buildings**: Use top-left positioning (correct for spanning multiple cells)

### Positioning Logic
- **Single-cell entities** (Player, NPCs, SpriteRange): Center positioned
- **Multi-cell entities** (Buildings): Top-left positioned
- **Grid coordinates**: Always work with cell centers for single entities

### Movement Behavior
- **Keyboard**: Moves exactly 1 grid cell at a time
- **Click-to-move**: Snaps to nearest grid cell center
- **Collision**: Checked at grid coordinate level before movement

## 🎮 Results Achieved

### Visual Consistency
- ✅ All sprites exactly fit their allocated grid space
- ✅ No visual overflow beyond grid boundaries  
- ✅ Consistent 40×40px sizing across all sprite types
- ✅ Perfect alignment with grid overlay

### Movement Precision
- ✅ Cell-by-cell movement (no intersection points)
- ✅ Always lands at exact grid cell centers
- ✅ Predictable, discrete movement behavior
- ✅ Perfect collision detection alignment

### Code Quality
- ✅ Clear separation between grid coordinates and screen coordinates
- ✅ Consistent positioning logic across all components
- ✅ No floating-point precision issues
- ✅ Maintainable, understandable movement code

## 🔍 Validation Methods

### Visual Verification
1. **Grid Overlay**: Enable grid visualization to see cell boundaries
2. **Sprite Alignment**: Verify all sprites sit perfectly within grid cells
3. **Movement Path**: Check that movement follows grid lines exactly

### Code Verification
1. **Position Values**: All sprite positions should be multiples of 20 plus cell center offset
2. **Size Values**: All sprites should be exactly 40×40px
3. **Movement Delta**: All movements should be exactly 40px in grid coordinates

This comprehensive fix ensures that the English Learning Town game has precise, predictable sprite movement and perfect visual alignment with the underlying grid system.