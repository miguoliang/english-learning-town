# Door System Implementation Guide

## Overview

The Door System allows you to create interactive doors in your tilemap that can be opened and closed by the player. When a door opens, its tile changes and collision is removed, allowing the player to pass through.

## How It Works

1. **Door Registration**: Register doors by specifying their tile coordinates and open/closed tile IDs
2. **Collision Management**: Door collision bodies are automatically created and removed when doors open/close
3. **Interaction**: Player presses SPACE near a door to toggle it open/closed
4. **Visual Feedback**: Interaction prompt shows "Press SPACE to open/close door"

## Implementation Steps

### Step 1: Import DoorSystem in Game.ts

```typescript
import { DoorSystem } from '../systems/DoorSystem';
```

### Step 2: Add DoorSystem to your Game scene

```typescript
export class Game extends Scene {
  // ... existing properties ...
  private doorSystem: DoorSystem;
  
  // ...
}
```

### Step 3: Initialize DoorSystem in the create() method

```typescript
create(_data?: { exitBuilding?: string }) {
  // ... existing code ...
  
  // Initialize door system after tilemap is created
  this.doorSystem = new DoorSystem(this, this.tilePropertyHelper);
  this.doorSystem.initialize(this.map!);
  
  // ... rest of create method ...
}
```

### Step 4: Register Your Doors

After creating your tilemap layers, register each door. You need to know:
- **Building name**: e.g., "home", "school", "shop", "library"
- **Tile coordinates**: (tileX, tileY) position of the door
- **Layer**: The tilemap layer containing the door
- **Closed tile ID**: The tile ID for the closed door
- **Open tile ID**: The tile ID for the open door

```typescript
// Example: Register home door
// Assuming the door is at tile position (3, 5) in the Home/House layer
// Closed door tile ID: 221
// Open door tile ID: 222

private createTiledMap(): void {
  // ... existing tilemap creation code ...
  
  const homeHouseLayer = this.map.createLayer('Home/House', allTilesets, 0, 0);
  
  // ... other layers ...
  
  // Register door after layer is created
  if (homeHouseLayer) {
    this.doorSystem.registerDoor(
      'home',           // Building name
      3,                // Tile X
      5,                // Tile Y
      homeHouseLayer,   // Layer
      221,              // Closed tile ID
      222               // Open tile ID
    );
  }
  
  // Register more doors for other buildings
  if (schoolHouseLayer) {
    this.doorSystem.registerDoor('school', 10, 5, schoolHouseLayer, 221, 222);
  }
  
  if (shopHouseLayer) {
    this.doorSystem.registerDoor('shop', 18, 5, shopHouseLayer, 221, 222);
  }
  
  if (libraryHouseLayer) {
    this.doorSystem.registerDoor('library', 25, 5, libraryHouseLayer, 221, 222);
  }
}
```

### Step 5: Link Door Collision Bodies (Optional but Recommended)

If your doors have collision shapes defined in Tiled, you'll want to link them to the door system so they can be removed when the door opens.

Modify your collision body creation code in `createTiledMap()`:

```typescript
// Inside the collision body creation loop
objects.forEach((obj: any) => {
  // ... existing position calculation ...
  
  const body = this.matter.add.rectangle(
    tileWorldX,
    tileWorldY,
    obj.width * scale,
    obj.height * scale,
    {
      isStatic: true,
      friction: 0.1,
      restitution: 0,
      label: `tile_collision_${layer.name}`
    }
  );
  
  // Check if this collision body is for a door tile
  // You can identify door tiles by custom properties in Tiled
  // or by checking tile position against registered doors
  // Example: If tile at (x, y) is a door, link the collision body
  if (tile.properties && tile.properties.isDoor) {
    this.doorSystem.setDoorCollisionBody(
      tile.properties.buildingName,  // e.g., "home"
      x,
      y,
      body as MatterJS.BodyType
    );
  }
});
```

### Step 6: Connect DoorSystem to InteractionSystem

If you're using the InteractionSystem, connect the door system:

```typescript
create(_data?: { exitBuilding?: string }) {
  // ... existing code ...
  
  // After creating both systems
  if (this.interactionSystem && this.doorSystem) {
    this.interactionSystem.setDoorSystem(this.doorSystem);
  }
}
```

### Step 7: Handle Door Interactions in update()

The InteractionSystem already handles door interactions if configured, but if you're handling interactions manually:

```typescript
update(_time: number, delta: number): void {
  // ... existing code ...
  
  // Check for nearby doors
  if (this.player && this.doorSystem) {
    const nearbyDoor = this.doorSystem.findNearestDoor(
      this.player.x,
      this.player.y,
      GameConfig.INTERACTION.DISTANCE
    );
    
    // Show interaction prompt if near a door
    if (nearbyDoor) {
      // Show "Press SPACE to open/close door"
      
      // Handle spacebar press
      if (this.playerController.isSpaceJustPressed()) {
        this.doorSystem.toggleDoor(nearbyDoor);
      }
    }
  }
}
```

### Step 8: Clean Up on Scene Destroy

```typescript
destroy(): void {
  // ... existing cleanup ...
  
  if (this.doorSystem) {
    this.doorSystem.destroy();
  }
}
```

## Finding Tile IDs in Tiled

1. Open your tilemap in Tiled
2. Look at your tileset panel (usually on the right)
3. Hover over a tile to see its ID
4. The closed door and open door should be two separate tiles in your tileset
5. Note down both IDs for use in `registerDoor()`

## Finding Tile Coordinates

1. In Tiled, enable "Show Tile Object Outlines" (View menu)
2. Click on the door tile in your map
3. Look at the properties panel - it shows the tile coordinates (x, y)
4. Use these coordinates when calling `registerDoor()`

## Example: Complete Integration

```typescript
export class Game extends Scene {
  private doorSystem: DoorSystem;
  private interactionSystem: InteractionSystem;
  
  create() {
    // 1. Create tilemap
    this.createTiledMap();
    
    // 2. Initialize door system
    this.doorSystem = new DoorSystem(this, this.tilePropertyHelper);
    this.doorSystem.initialize(this.map!);
    
    // 3. Create player
    this.createPlayer();
    
    // 4. Initialize interaction system
    this.interactionSystem = new InteractionSystem(
      this,
      this.townBuilder,
      this.npcManager
    );
    this.interactionSystem.setDoorSystem(this.doorSystem);
  }
  
  private createTiledMap(): void {
    // ... create layers ...
    
    // Register doors
    if (homeHouseLayer) {
      // Home door at bottom center of house
      this.doorSystem.registerDoor('home', 3, 5, homeHouseLayer, 221, 222);
    }
  }
  
  update() {
    // Interaction system handles door checking and toggling
    if (this.interactionSystem && this.player) {
      this.interactionSystem.checkNearbyInteractables(
        this.player.x,
        this.player.y
      );
      
      if (this.playerController.isSpaceJustPressed()) {
        this.interactionSystem.handleSpacebarInteraction();
      }
    }
  }
}
```

## Advanced Usage

### Programmatically Open/Close Doors

```typescript
// Open a specific door
this.doorSystem.openDoor('home_3_5');

// Close a specific door
this.doorSystem.closeDoor('home_3_5');

// Check if door is open
if (this.doorSystem.isDoorOpen('home_3_5')) {
  console.log('Door is open!');
}
```

### Door Events

You can extend the DoorSystem to emit events when doors open/close:

```typescript
openDoor(doorKey: string): void {
  // ... existing code ...
  
  EventBus.emit('door-opened', {
    buildingName: door.buildingName,
    tileX: door.tileX,
    tileY: door.tileY
  });
}
```

## Troubleshooting

**Door doesn't open:**
- Check that the door is registered with correct tile coordinates
- Verify the open tile ID exists in your tileset
- Ensure the player is within interaction distance (default: 80 pixels)

**Collision not removed:**
- Make sure you called `setDoorCollisionBody()` to link the collision body
- Check that the collision body was created before linking it

**Wrong tile displayed:**
- Verify the tile IDs are correct (check in Tiled)
- Make sure you're using global tile IDs (not local tileset IDs)

**Player can't walk through open door:**
- Ensure the collision body is properly removed in `openDoor()`
- Check that the door's collision body reference is correctly set

## Next Steps

- Add door opening/closing sound effects
- Implement locked doors that require keys
- Add automatic door closing after a delay
- Create sliding door animations
- Add door state persistence (save/load)

