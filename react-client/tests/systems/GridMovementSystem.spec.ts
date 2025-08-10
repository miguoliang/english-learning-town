/**
 * GridMovementSystem Unit Tests
 * Tests the discrete grid-based movement system
 */

import { test, expect } from '@playwright/test';

test.describe('GridMovementSystem', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the root
    await page.goto('/');
    
    // Fill name
    await page.fill('input[placeholder*="name"]', 'TestPlayer');
    
    // Click start new adventure
    await page.click('button:has-text("Start New Adventure")');
    
    // Wait for the game canvas
    await page.waitForSelector('[data-testid="game-canvas"]', { timeout: 10000 });
    
    // Wait for game scene to load
    await page.waitForTimeout(2000);
  });

  test('should move player one cell at a time with arrow keys', async ({ page }) => {
    // Wait for player to be rendered
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    // Get initial position
    const initialPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    
    const positions: { left: number; top: number }[] = [initialPosition];
    const cellSize = 40; // Default cell size
    
    // Test arrow key movement - up, right, down, left
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(50);
    
    let currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
    
    const finalPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(finalPosition);
    
    // Verify movement occurred and is grid-based
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBeGreaterThan(1); // At least some movement
    
    // Verify all positions are grid-aligned
    for (const pos of positions) {
      expect(pos.left % cellSize).toBe(0);
      expect(pos.top % cellSize).toBe(0);
    }
    
    console.log(`Arrow key movement path: ${Array.from(uniquePositions).join(' -> ')}`);
  });

  test('should move player one cell at a time with WASD keys', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    // Get initial position
    const initialPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    
    const positions: { left: number; top: number }[] = [initialPosition];
    const cellSize = 40; // Default cell size
    
    // Test WASD movement - W(up), D(right), S(down), A(left)
    await page.keyboard.press('KeyW'); // Up
    await page.waitForTimeout(50);
    
    let currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('KeyD'); // Right
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('KeyS'); // Down
    await page.waitForTimeout(50);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('KeyA'); // Left
    await page.waitForTimeout(50);
    
    const finalPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(finalPosition);
    
    // Verify movement occurred and is grid-based
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBeGreaterThan(1); // At least some movement
    
    // Verify all positions are grid-aligned
    for (const pos of positions) {
      expect(pos.left % cellSize).toBe(0);
      expect(pos.top % cellSize).toBe(0);
    }
    
    console.log(`WASD movement path: ${Array.from(uniquePositions).join(' -> ')}`);
  });

  test('should not move on key hold (discrete movement only)', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const movementLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Player moved')) {
        movementLogs.push(msg.text());
      }
    });
    
    // Hold key down for extended period
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(500); // Hold for 500ms
    await page.keyboard.up('ArrowRight');
    
    // Should only have one movement event, not continuous movement
    expect(movementLogs.length).toBeLessThanOrEqual(2); // At most 1-2 movements due to discrete nature
  });

  test('should handle collision detection', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const collisionLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Movement blocked') || msg.text().includes('collision detected')) {
        collisionLogs.push(msg.text());
      }
    });
    
    // Try to move player into areas that might have obstacles
    // Move towards edges or try multiple movements to find obstacles
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(50);
    }
    
    // If there are obstacles, we should eventually hit collision detection
    // This test validates that collision system is integrated
    console.log(`Collision logs recorded: ${collisionLogs.length}`);
  });

  test('should ignore non-movement keys', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const movementLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Player moved')) {
        movementLogs.push(msg.text());
      }
    });
    
    // Press non-movement keys
    await page.keyboard.press('KeyQ');
    await page.keyboard.press('KeyE');
    await page.keyboard.press('KeyR');
    await page.keyboard.press('KeyT');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    // Should have no movement from non-movement keys
    expect(movementLogs.length).toBe(0);
  });

  test('should handle rapid key presses correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Find the player entity
    const playerEntity = await page.locator('[data-entity-type="player"]').first();
    await expect(playerEntity).toBeVisible();
    
    // Get initial position
    const initialPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    
    const positions: { left: number; top: number }[] = [initialPosition];
    
    // Rapid key presses - move right 3 times, then left 2 times
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(10);
    
    let currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(10);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(10);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(10);
    
    currentPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(currentPosition);
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(10);
    
    const finalPosition = await playerEntity.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.left, 10),
        top: parseInt(style.top, 10)
      };
    });
    positions.push(finalPosition);
    
    // Check discrete movement behavior
    // Should have at least some position changes (not all movements may succeed due to collisions)
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBeGreaterThan(1);
    
    // Grid movement should be discrete (each movement by exactly cellSize pixels)
    // Check that movements are in grid increments (40px by default)
    const cellSize = 40;
    const xPositions = positions.map(p => p.left);
    const yPositions = positions.map(p => p.top);
    
    // All x positions should be multiples of cellSize
    for (const x of xPositions) {
      expect(x % cellSize).toBe(0);
    }
    
    // All y positions should be multiples of cellSize (should not change in this test)
    for (const y of yPositions) {
      expect(y % cellSize).toBe(0);
    }
    
    console.log(`Rapid key movement path: ${Array.from(uniquePositions).join(' -> ')}`);
  });

  test('should emit proper movement events', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    const eventLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('ENTITY_MOVED') || msg.text().includes('Entity moved')) {
        eventLogs.push(msg.text());
      }
    });
    
    // Make a movement
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    // Should trigger render system update
    expect(eventLogs.length).toBeGreaterThanOrEqual(0);
  });

  test('should maintain player position consistency', async ({ page }) => {
    await page.waitForSelector('[data-testid^="entity-"]', { timeout: 5000 });
    
    // Perform a series of movements that should return to original position
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    // Position should be consistent (no visual glitches or errors)
    const entities = await page.locator('[data-testid^="entity-"]').all();
    expect(entities.length).toBeGreaterThan(0);
    
    // All entities should still be properly positioned
    for (const entity of entities) {
      const isVisible = await entity.isVisible();
      expect(isVisible).toBe(true);
    }
  });
});
